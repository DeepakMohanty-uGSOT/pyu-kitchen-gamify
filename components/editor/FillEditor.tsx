"use client";

type Props = {
  template: string;
  values: string[];
  onChange: (v: string[]) => void;
  execLine: number;
  errorLine: number | null;
  onCook: () => void;
};

/** Real Python with editable blanks. The filled-in script is exactly what runs. */
export default function FillEditor({ template, values, onChange, execLine, errorLine, onCook }: Props) {
  let blank = 0;
  const lines = template.split("\n");
  return (
    <div className="overflow-x-auto rounded-xl border py-2 font-mono text-[15px]" style={{ borderColor: "var(--line)", background: "var(--panel-2)" }}>
      {lines.map((line, li) => {
        const parts = line.split("[[]]");
        const n = li + 1;
        const cls = n === errorLine ? "bg-red-500/15" : n === execLine ? "bg-yellow-400/25" : "";
        return (
          <div key={li} className={`flex min-h-[26px] items-center whitespace-pre ${cls}`}>
            <span className="w-9 shrink-0 select-none pr-2 text-right text-xs opacity-50">{n === execLine ? "▶" : n}</span>
            {parts.map((part, pi) => {
              const idx = pi < parts.length - 1 ? blank++ : -1;
              const isComment = part.trimStart().startsWith("#");
              return (
                <span key={pi} className="flex items-center">
                  <span className={isComment ? "italic opacity-60" : ""}>{part}</span>
                  {idx >= 0 && (
                    <input
                      aria-label={`Blank ${idx + 1} on line ${n}`}
                      value={values[idx] ?? ""}
                      onChange={(e) => { const next = values.slice(); next[idx] = e.target.value; onChange(next); }}
                      onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onCook(); }}
                      spellCheck={false}
                      autoCapitalize="off"
                      autoComplete="off"
                      placeholder="?"
                      className="mx-0.5 rounded-md border-2 border-dashed px-1.5 py-0.5 font-mono text-[15px] outline-none focus:border-solid"
                      style={{ width: `${Math.max(6, (values[idx] ?? "").length + 2)}ch`, borderColor: "var(--accent)", background: "var(--panel)", color: "var(--ink)" }}
                    />
                  )}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
