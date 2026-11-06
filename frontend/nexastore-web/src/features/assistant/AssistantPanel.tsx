import {
  Bot,
  CircleStop,
  Cpu,
  DatabaseZap,
  Send,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getAssistantStatus, streamAssistantResponse } from "./api";
import type {
  AssistantMessage,
  AssistantResponseStyle,
  AssistantStatus,
} from "./types";
import { MarkdownMessage } from "./MarkdownMessage";

const suggestions = [
  "Show me AI-ready laptops with at least 16 GB VRAM.",
  "What hardware does the local LLM guide recommend?",
  "Summarize the return policy and cite the source.",
];

const welcome: AssistantMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi, I’m Nexa AI. I can search the live catalog, check inventory, and answer from NexaStore’s indexed product, buying-guide, policy, and support documents with citations.",
};

const responseStyles: { value: AssistantResponseStyle; label: string }[] = [
  { value: "concise", label: "Concise" },
  { value: "balanced", label: "Balanced" },
  { value: "detailed", label: "Detailed" },
];

export function AssistantPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<AssistantMessage[]>([welcome]);
  const [status, setStatus] = useState<AssistantStatus>();
  const [input, setInput] = useState("");
  const [responseStyle, setResponseStyle] =
    useState<AssistantResponseStyle>("balanced");
  const [streaming, setStreaming] = useState(false);
  const [elapsedMs, setElapsedMs] = useState<number>();
  const [error, setError] = useState<string>();
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || status) return;
    getAssistantStatus()
      .then(setStatus)
      .catch(() => setStatus(undefined));
  }, [open, status]);

  useEffect(() => {
    if (typeof endRef.current?.scrollIntoView === "function") {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  if (!open) return null;

  const submit = async (prompt = input) => {
    const content = prompt.trim();
    if (!content || streaming) return;

    const userMessage: AssistantMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    const assistantId = crypto.randomUUID();
    const history = [
      ...messages.filter(
        (message) =>
          message.id !== "welcome" && message.content.trim().length > 0,
      ),
      userMessage,
    ];
    setMessages((current) => [
      ...current,
      userMessage,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setError(undefined);
    setElapsedMs(undefined);
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamAssistantResponse(
        history,
        responseStyle,
        (event) => {
          if (event.type === "delta") {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? { ...message, content: message.content + event.content }
                  : message,
              ),
            );
          }
          if (event.type === "tool") {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? {
                      ...message,
                      tools: [
                        ...(message.tools ?? []),
                        { name: event.name, label: event.label },
                      ],
                    }
                  : message,
              ),
            );
          }
          if (event.type === "done") setElapsedMs(event.elapsedMs);
          if (event.type === "error") setError(event.message);
        },
        controller.signal,
      );
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Nexa AI could not complete the request.",
        );
      }
    } finally {
      setMessages((current) =>
        current.filter(
          (message) =>
            message.id !== assistantId || message.content.trim().length > 0,
        ),
      );
      setStreaming(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/75 p-0 backdrop-blur-sm sm:p-4">
      <button
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close Nexa AI"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Nexa AI assistant"
        className="glass relative flex h-full w-full flex-col overflow-hidden sm:max-w-xl sm:rounded-[2rem]"
      >
        <header className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
          <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-400 to-electric-300 text-ink-950 shadow-glow">
            <Bot size={23} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold">Nexa AI</h2>
              <span className="rounded-full bg-lime-300/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-lime-300">
                {status?.provider.toLowerCase() === "ollama"
                  ? "Local"
                  : "Cloud"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {status
                ? `${status.provider} · ${status.model}`
                : "Connecting to AI provider…"}
            </p>
          </div>
          <button
            onClick={() => {
              abortRef.current?.abort();
              setMessages([welcome]);
              setError(undefined);
              setElapsedMs(undefined);
            }}
            className="ml-auto rounded-full p-2 text-slate-400 hover:bg-white/8 hover:text-white"
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/8 hover:text-white"
            aria-label="Close assistant"
          >
            <X size={19} />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/7 text-electric-300">
                {message.role === "assistant" ? (
                  <Sparkles size={15} />
                ) : (
                  <UserRound size={15} />
                )}
              </div>
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "rounded-tr-sm bg-electric-300 text-ink-950"
                    : "rounded-tl-sm border border-white/8 bg-white/5 text-slate-300"
                }`}
              >
                {message.tools?.map((tool, index) => (
                  <div
                    key={`${message.id}-${tool.name}-${index}`}
                    className="mb-2 flex items-center gap-2 rounded-lg border border-lime-300/15 bg-lime-300/5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-lime-200"
                  >
                    <DatabaseZap size={12} />
                    {tool.label}
                  </div>
                ))}
                {message.content ? (
                  message.role === "assistant" ? (
                    <MarkdownMessage content={message.content} />
                  ) : (
                    <span className="whitespace-pre-wrap">
                      {message.content}
                    </span>
                  )
                ) : (
                  <span className="inline-flex gap-1 py-2">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="size-1.5 animate-pulse rounded-full bg-electric-300"
                      />
                    ))}
                  </span>
                )}
              </div>
            </div>
          ))}
          {messages.length === 1 && (
            <div className="grid gap-2 pt-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => submit(suggestion)}
                  className="rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-left text-xs font-semibold text-slate-400 transition hover:border-electric-300/30 hover:text-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-rose-400/20 bg-rose-400/8 px-4 py-3 text-xs leading-5 text-rose-200">
              {error}
            </div>
          )}
          {elapsedMs !== undefined && !streaming && !error && (
            <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              Generated in {(elapsedMs / 1000).toFixed(1)}s
            </p>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="border-t border-white/8 p-4"
        >
          <div
            className="mb-3 flex items-center gap-2"
            aria-label="Response style"
          >
            <SlidersHorizontal size={14} className="mr-1 text-slate-500" />
            {responseStyles.map((style) => (
              <button
                key={style.value}
                type="button"
                disabled={streaming}
                onClick={() => setResponseStyle(style.value)}
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                  responseStyle === style.value
                    ? "bg-violet-400/20 text-violet-200"
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                }`}
                aria-pressed={responseStyle === style.value}
              >
                {style.label}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-ink-950/70 p-2 focus-within:border-electric-300/40">
            <Cpu className="mb-2.5 ml-2 shrink-0 text-violet-300" size={17} />
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              maxLength={4_000}
              rows={1}
              placeholder="Ask about developer and AI hardware…"
              className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none"
            />
            {streaming ? (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                className="grid size-10 place-items-center rounded-xl bg-rose-400/15 text-rose-300"
                aria-label="Stop response"
              >
                <CircleStop size={18} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="grid size-10 place-items-center rounded-xl bg-electric-300 text-ink-950 transition hover:bg-white disabled:opacity-30"
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            )}
          </div>
          <p className="mt-2 text-center text-[10px] text-slate-600">
            Live commerce tools and cited knowledge-base documents ground
            answers.
          </p>
        </form>
      </section>
    </div>
  );
}
