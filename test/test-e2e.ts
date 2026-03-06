/**
 * End-to-end integration test.
 *
 * Spins up mock OpenClaw + relay, then verifies auth, round-trip, and cancel.
 * Uses non-standard ports to avoid conflicting with real OpenClaw.
 */
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "node:net";
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
    const server = createServer();
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

// ─── Mock OpenClaw ──────────────────────────────────────────────────────────

function startMockOpenClaw(): Promise<WebSocketServer> {
  return new Promise((resolve, reject) => {
    const wss = new WebSocketServer({ port: MOCK_OC_PORT });

    wss.on("error", (err) => {
      console.error("[mock-oc] Server error:", err.message);
      reject(err);
    });

    wss.on("connection", (ws) => {
      console.log("[mock-oc] Connection received");

      ws.on("message", (data) => {
        const msg = JSON.parse(data.toString());
        console.log("[mock-oc] Received:", msg.type, msg.id || msg.taskId || "");

        if (msg.type === "message") {
          const id = msg.id;
          setTimeout(() => ws.send(JSON.stringify({ type: "status", taskId: id, status: "running" })), 50);
          setTimeout(() => ws.send(JSON.stringify({ type: "activity", taskId: id, text: "Working..." })), 100);
          setTimeout(() => ws.send(JSON.stringify({ type: "assistant", taskId: id, text: "Done!", done: true })), 200);
          setTimeout(() => ws.send(JSON.stringify({ type: "files", taskId: id, changed: ["test.ts"] })), 300);
          setTimeout(() => ws.send(JSON.stringify({ type: "status", taskId: id, status: "done" })), 400);
        }

        if (msg.type === "cancel") {
          ws.send(JSON.stringify({ type: "status", taskId: msg.taskId, status: "error" }));
          ws.send(JSON.stringify({ type: "error", taskId: msg.taskId, message: "Cancelled by user" }));
        }
      });

      ws.on("close", (code) => console.log("[mock-oc] Connection closed, code:", code));
    });

    wss.on("listening", () => {
      console.log(`[mock-oc] Listening on port ${MOCK_OC_PORT}`);
      resolve(wss);
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
    openclawUrl: `ws://127.0.0.1:${MOCK_OC_PORT}`,
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
    const events = await collect(ws, 5, 5000);

    const types = events.map((e) => e.type);
    assert(types.includes("status"), "Has status event");
    assert(types.includes("activity"), "Has activity event");
    assert(types.includes("assistant"), "Has assistant event");
    assert(types.includes("files"), "Has files event");
    assert(events.some((e) => e.type === "status" && e.status === "done"), "Task completed");

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

    const events = await collect(ws, 6, 5000);
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
