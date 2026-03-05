import path from "node:path";
import type { DevChatContext } from "./types.js";

export function normalizeProjectDir(projectDir: string): string {
  return path.resolve(projectDir);
}

export function buildContextSystemPrompt(projectDir: string, context?: DevChatContext): string {
  const scope = normalizeProjectDir(projectDir);

  const contextLines = [
    context?.source ? `- source: ${context.source}` : null,
    context?.appId ? `- appId: ${context.appId}` : null,
    context?.activeUrl ? `- activeUrl: ${context.activeUrl}` : null,
    context?.pageTitle ? `- pageTitle: ${context.pageTitle}` : null,
  ].filter(Boolean);

  const contextBlock = contextLines.length
    ? `\nCurrent client context:\n${contextLines.join("\n")}`
    : "";

  return [
    "You are operating inside Dev Chat Overlay.",
    "Primary objective: edit the currently viewed website/application for this chat session.",
    `HARD SCOPE: Only read/write files under this project root: ${scope}`,
    "Never edit files outside this root unless the user explicitly requests an out-of-scope override.",
    "If target files are ambiguous, ask one concise clarification question before editing.",
    "Do not wander unrelated directories or projects.",
    contextBlock,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildOpenClawMessages(userText: string, projectDir: string, context?: DevChatContext) {
  return [
    { role: "system" as const, content: buildContextSystemPrompt(projectDir, context) },
    { role: "user" as const, content: userText },
  ];
}
