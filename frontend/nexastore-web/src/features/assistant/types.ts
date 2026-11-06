export type AssistantRole = "user" | "assistant";
export type AssistantResponseStyle = "concise" | "balanced" | "detailed";

export type AssistantMessage = {
  id: string;
  role: AssistantRole;
  content: string;
  tools?: AssistantToolActivity[];
};

export type AssistantToolActivity = { name: string; label: string };

export type AssistantStatus = {
  enabled: boolean;
  provider: string;
  model: string;
  capabilities: string[];
  responseStyles: AssistantResponseStyle[];
};

export type AssistantStreamEvent =
  | {
      type: "started";
      requestId: string;
      model: string;
      responseStyle: AssistantResponseStyle;
    }
  | { type: "delta"; sequence: number; content: string }
  | { type: "tool"; name: string; label: string }
  | { type: "done"; requestId: string; chunks: number; elapsedMs: number }
  | { type: "error"; message: string };
