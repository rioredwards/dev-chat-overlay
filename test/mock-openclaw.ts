/**
 * Mock OpenClaw server for integration testing.
 * Simulates the OpenClaw daemon WebSocket behavior:
 * receives messages, sends back activity/status/assistant/files events.
 */
import { WebSocketServer, WebSocket } from "ws";

const PORT = parseInt(process.env.MOCK_OC_PORT ?? "19789", 10);

const wss = new WebSocketServer({ port: PORT });
console.log(`[mock-openclaw] Listening on ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
  console.log("[mock-openclaw] Relay connected");

  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString());
    console.log("[mock-openclaw] Received:", JSON.stringify(msg));

    if (msg.type === "message") {
      simulateTask(ws, msg.id, msg.text);
    }

    if (msg.type === "cancel") {
      ws.send(JSON.stringify({ type: "status", taskId: msg.taskId, status: "error" }));
      ws.send(JSON.stringify({ type: "error", taskId: msg.taskId, message: "Cancelled by user" }));
    }

    if (msg.type === "confirm_response") {
      if (msg.approved) {
        ws.send(JSON.stringify({ type: "activity", taskId: msg.taskId, text: "Confirmed. Proceeding..." }));
      } else {
        ws.send(JSON.stringify({ type: "status", taskId: msg.taskId, status: "error" }));
        ws.send(JSON.stringify({ type: "error", taskId: msg.taskId, message: "User rejected the action" }));
      }
    }
  });

  ws.on("close", () => {
    console.log("[mock-openclaw] Relay disconnected");
  });
});

function simulateTask(ws: WebSocket, taskId: string, text: string) {
  const steps = [
    { delay: 100, msg: { type: "status", taskId, status: "queued" } },
    { delay: 400, msg: { type: "status", taskId, status: "running" } },
    { delay: 600, msg: { type: "activity", taskId, text: "Reading project files..." } },
    { delay: 1000, msg: { type: "activity", taskId, text: "Analyzing: src/app/page.tsx" } },
    { delay: 1400, msg: { type: "activity", taskId, text: "Editing 2 files..." } },
    { delay: 1800, msg: { type: "assistant", taskId, text: `Working on: "${text.slice(0, 60)}"`, done: false } },
    { delay: 2200, msg: { type: "assistant", taskId, text: "\n\nDone! I've made the changes you requested.", done: true } },
    { delay: 2400, msg: { type: "files", taskId, changed: ["src/app/page.tsx", "src/app/globals.css"] } },
    { delay: 2600, msg: { type: "status", taskId, status: "done" } },
  ];

  // If message includes "delete", simulate a confirmation gate
  if (text.toLowerCase().includes("delete")) {
    steps.splice(3, 0, {
      delay: 800,
      msg: {
        type: "confirm",
        taskId,
        action: "Delete files",
        description: "Agent wants to delete src/old-module/ (3 files). This cannot be undone.",
      } as any,
    });
  }

  for (const step of steps) {
    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(step.msg));
      }
    }, step.delay);
  }
}
