/**
 * Mock OpenClaw HTTP server for integration testing.
 * Serves POST /v1/chat/completions with SSE streaming,
 * mimicking the OpenAI-compatible API that real OpenClaw exposes.
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

const PORT = parseInt(process.env.MOCK_OC_PORT ?? "19789", 10);

const server = createServer((req, res) => {
  if (req.method === "POST" && req.url === "/v1/chat/completions") {
    handleChatCompletions(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`[mock-openclaw] HTTP listening on http://localhost:${PORT}`);
});

function handleChatCompletions(req: IncomingMessage, res: ServerResponse) {
  let body = "";
  req.on("data", (chunk: Buffer) => (body += chunk.toString()));
  req.on("end", () => {
    let parsed: any;
    try {
      parsed = JSON.parse(body);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }

    console.log("[mock-openclaw] Received:", JSON.stringify(parsed).slice(0, 200));

    const userMsg = parsed.messages?.findLast?.((m: any) => m.role === "user")?.content ?? "";

    if (parsed.stream) {
      streamResponse(res, userMsg);
    } else {
      nonStreamResponse(res, userMsg);
    }
  });
}

function nonStreamResponse(res: ServerResponse, userMsg: string) {
  const reply = `I received your request: "${userMsg.slice(0, 60)}". Done!`;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      id: `chatcmpl-mock-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "openclaw:main",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: reply },
          finish_reason: "stop",
        },
      ],
    }),
  );
}

function streamResponse(res: ServerResponse, userMsg: string) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const id = `chatcmpl-mock-${Date.now()}`;
  const chunks = [
    `Working on: "${userMsg.slice(0, 60)}"`,
    "\n\nAnalyzing your request...",
    "\n\nDone! I've made the changes you requested.",
  ];

  let i = 0;

  function sendChunk() {
    if (i < chunks.length) {
      const data = JSON.stringify({
        id,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: "openclaw:main",
        choices: [{ index: 0, delta: { content: chunks[i] }, finish_reason: null }],
      });
      res.write(`data: ${data}\n\n`);
      i++;
      setTimeout(sendChunk, 600);
    } else {
      const stopData = JSON.stringify({
        id,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: "openclaw:main",
        choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
      });
      res.write(`data: ${stopData}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }

  setTimeout(sendChunk, 300);
}
