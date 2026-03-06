/**
 * End-to-end integration test.
 *
 * Spins up mock OpenClaw + relay, then verifies auth, round-trip, and cancel.
 * Uses non-standard ports to avoid conflicting with real OpenClaw.
 */
import { WebSocket } from "ws";
import { createServer as createNetServer } from "node:net";
import { createServer as createHttpServer, type Server as HttpServer } from "node:http";
import { startRelay } from "../packages/relay/src/server.js";

const SECRET = "test-secret";
let MOCK_OC_PORT = 19789;
let RELAY_PORT = 19790;
let pass = 0;
let fail = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    pass++;
  } else {
    console.error(`  ✗ ${label}`);
    fail++;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createNetServer();
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        server.close();
        reject(new Error("Failed to get free port"));
        return;
      }
      const port = addr.port;
      server.close((err) => {
        if (err) return reject(err);
        resolve(port);
      });
    });
    server.on("error", reject);
  });
}

// ─── Mock OpenClaw (HTTP SSE) ──────────────────────────────────────────────

function startMockOpenClaw(): Promise<HttpServer> {
  return new Promise((resolve, reject) => {
    const server = createHttpServer((req, res) => {
      console.log("[mock-oc] incoming", req.method, req.url);
      if (req.method !== "POST" || req.url !== "/v1/chat/completions") {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
        return;
      }

      // Consume request body without blocking response timing.
      req.resume();

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      const chunks = ["Working", "...", " Done!"];
      if (typeof (res as any).flushHeaders === "function") {
        (res as any).flushHeaders();
      }

      // Send first chunk immediately so fetch() resolves quickly.
      const firstChunk = JSON.stringify({
        choices: [{ delta: { content: chunks[0] }, finish_reason: null }],
      });
      res.write(`data: ${firstChunk}\n\n`);

      let i = 1;
      const timer = setInterval(() => {
        if (i >= chunks.length) {
          const stopChunk = JSON.stringify({
            choices: [{ delta: {}, finish_reason: "stop" }],
          });
          res.write(`data: ${stopChunk}\n\n`);
          res.write("data: [DONE]\n\n");
          clearInterval(timer);
          res.end();
          return;
        }

        const chunk = JSON.stringify({
          choices: [{ delta: { content: chunks[i] }, finish_reason: null }],
        });
        res.write(`data: ${chunk}\n\n`);
        i++;
      }, 120);

      req.on("close", () => clearInterval(timer));
    });

    server.on("error", reject);
    server.listen(MOCK_OC_PORT, "127.0.0.1", () => {
      console.log(`[mock-oc] Listening on http://127.0.0.1:${MOCK_OC_PORT}`);
      resolve(server);
    });
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function connectWidget(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${RELAY_PORT}`);
    ws.on("open", () => resolve(ws));
    ws.on("error", reject);
  });
}

function collect(ws: WebSocket, count: number, timeoutMs = 5000): Promise<any[]> {
  return new Promise((resolve) => {
    const msgs: any[] = [];
    const handler = (data: any) => {
      msgs.push(JSON.parse(data.toString()));
      if (msgs.length >= count) {
        ws.removeListener("message", handler);
        clearTimeout(timer);
        resolve(msgs);
      }
    };
    const timer = setTimeout(() => {
      ws.removeListener("message", handler);
      resolve(msgs);
    }, timeoutMs);
    ws.on("message", handler);
  });
}

async function authWidget(ws: WebSocket): Promise<boolean> {
  ws.send(JSON.stringify({ type: "auth", secret: SECRET }));
  const [resp] = await collect(ws, 1, 2000);
  return resp?.ok === true;
}

// ─── Run Tests ──────────────────────────────────────────────────────────────

async function run() {
  console.log("\nStarting integration test...\n");

  MOCK_OC_PORT = await getFreePort();
  RELAY_PORT = await getFreePort();
  while (RELAY_PORT === MOCK_OC_PORT) {
    RELAY_PORT = await getFreePort();
  }

  const mockOC = await startMockOpenClaw();
  await sleep(200);

  const relay = startRelay({
    port: RELAY_PORT,
    secret: SECRET,
    projectDir: process.cwd(),
    openclawUrl: `http://127.0.0.1:${MOCK_OC_PORT}`,
  });

  await sleep(1000);

  // ─── Test 1: Good Auth ────────────────────────────────────────────────
  console.log("Test 1: Auth (good secret)");
  {
    const ws = await connectWidget();
    ws.send(JSON.stringify({ type: "auth", secret: SECRET }));
    const [resp] = await collect(ws, 1, 2000);
    assert(resp?.type === "authenticated" && resp?.ok === true, "Auth succeeds");
    ws.close();
    await sleep(100);
  }

  // ─── Test 2: Bad Auth ─────────────────────────────────────────────────
  console.log("Test 2: Auth (bad secret)");
  {
    const ws = await connectWidget();
    ws.send(JSON.stringify({ type: "auth", secret: "wrong" }));
    const [resp] = await collect(ws, 1, 2000);
    assert(resp?.type === "authenticated" && resp?.ok === false, "Auth fails");
    ws.close();
    await sleep(100);
  }

  // ─── Test 3: Message Round-trip ───────────────────────────────────────
  console.log("Test 3: Message round-trip");
  {
    const ws = await connectWidget();
    const authed = await authWidget(ws);
    assert(authed, "Authed for round-trip");

    ws.send(JSON.stringify({ type: "message", id: "test_1", text: "Fix header", agent: "codex" }));
    const events = await collect(ws, 4, 7000);

    const types = events.map((e) => e.type);
    assert(types.includes("status"), "Has status event");
    assert(types.includes("assistant"), "Has assistant event");
    assert(
      events.some((e) => e.type === "status" && (e.status === "running" || e.status === "done")),
      "Task progressed",
    );

    ws.close();
    await sleep(100);
  }

  // ─── Test 4: Cancel ───────────────────────────────────────────────────
  console.log("Test 4: Cancel");
  {
    const ws = await connectWidget();
    await authWidget(ws);

    ws.send(JSON.stringify({ type: "message", id: "test_c", text: "Do work" }));
    await sleep(30);
    ws.send(JSON.stringify({ type: "cancel", taskId: "test_c" }));

    const events = await collect(ws, 3, 5000);
    const errEvent = events.find((e) => e.type === "error");
    assert(!!errEvent, "Has error event after cancel");
    assert(errEvent?.message?.includes("Cancel"), "Error mentions cancel");

    ws.close();
  }

  console.log(`\n${pass} passed, ${fail} failed\n`);
  relay.close();
  mockOC.close();
  process.exit(fail > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
