import { env } from "@/config/env";
import { http } from "@/lib/http";
import type {
  AssistantMessage,
  AssistantResponseStyle,
  AssistantStatus,
  AssistantStreamEvent,
} from "./types";

export async function getAssistantStatus() {
  const response = await http.get<AssistantStatus>("/api/assistant/status");
  return response.data;
}

export async function streamAssistantResponse(
  messages: AssistantMessage[],
  responseStyle: AssistantResponseStyle,
  onEvent: (event: AssistantStreamEvent) => void,
  signal: AbortSignal,
) {
  const baseUrl = env.apiBaseUrl.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/api/assistant/chat/stream`, {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: messages
        .filter(({ content }) => content.trim().length > 0)
        .map(({ role, content }) => ({ role, content: content.trim() })),
      responseStyle,
    }),
    signal,
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(
      problem?.detail ?? problem?.title ?? "Nexa AI request failed.",
    );
  }

  if (!response.body)
    throw new Error("Streaming is not supported by this browser.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const lines = frame.split("\n");
      const type = lines.find((line) => line.startsWith("event: "))?.slice(7);
      const data = lines
        .filter((line) => line.startsWith("data: "))
        .map((line) => line.slice(6))
        .join("\n");
      if (!type || !data) continue;

      const payload = JSON.parse(data);
      if (type === "started") onEvent({ type, ...payload });
      if (type === "delta")
        onEvent({ type, sequence: payload.sequence, content: payload.content });
      if (type === "tool")
        onEvent({ type, name: payload.name, label: payload.label });
      if (type === "done") onEvent({ type, ...payload });
      if (type === "error") onEvent({ type, message: payload.message });
    }

    if (done) break;
  }
}
