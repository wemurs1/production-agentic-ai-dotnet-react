import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      skipHtml
      components={{
        h1: ({ children }) => <h1 className="mb-3 mt-1 text-lg font-bold text-white">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-2 mt-4 text-base font-bold text-white">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-2 mt-3 text-sm font-bold text-white">{children}</h3>,
        p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
        li: ({ children }) => <li className="pl-1 marker:text-electric-300">{children}</li>,
        strong: ({ children }) => <strong className="font-bold text-slate-100">{children}</strong>,
        blockquote: ({ children }) => (
          <blockquote className="my-3 border-l-2 border-violet-300 pl-3 text-slate-400">{children}</blockquote>
        ),
        code: ({ children, className }) =>
          className ? (
            <code className={`${className} block overflow-x-auto rounded-xl bg-ink-950 p-3 text-xs text-lime-200`}>
              {children}
            </code>
          ) : (
            <code className="rounded bg-ink-950 px-1.5 py-0.5 text-xs text-lime-200">{children}</code>
          ),
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold text-electric-300 underline decoration-electric-300/40 underline-offset-2 hover:text-white"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="my-3 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full border-collapse text-left text-xs">{children}</table>
          </div>
        ),
        th: ({ children }) => <th className="border-b border-white/10 bg-white/5 px-3 py-2 text-white">{children}</th>,
        td: ({ children }) => <td className="border-b border-white/5 px-3 py-2 align-top">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}