// src/components/TypewriterRepeat.tsx
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

type Props = {
  markdown: string;
  repeat: number;
  msPerChar?: number;
  className?: string;
};

export function TypewriterRepeat({
  markdown,
  repeat,
  msPerChar = 65,
  className,
}: Props) {
  const fullText = useMemo(() => {
    const r = Math.max(1, Math.floor(repeat || 1));
    const one = (markdown ?? "").trimEnd();

    // ✅ single rendered line break between repeats (no paragraph spacing)
    const sep = "  \n";

    return Array.from({ length: r }, () => one).join(sep);
  }, [markdown, repeat]);

  return (
    <Typewriter
      key={fullText}
      text={fullText}
      msPerChar={msPerChar}
      className={className}
    />
  );
}

type TypewriterProps = {
  text: string;
  msPerChar: number;
  className?: string;
};

function Typewriter({ text, msPerChar, className }: TypewriterProps) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (i >= text.length) return;
    const t = window.setTimeout(() => setI((v) => v + 1), msPerChar);
    return () => window.clearTimeout(t);
  }, [i, text, msPerChar]);

  return (
    <div className={className} style={{ whiteSpace: "normal" }}>
      <ReactMarkdown>{text.slice(0, i)}</ReactMarkdown>
    </div>
  );
}
