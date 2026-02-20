// src/components/TypewriterRepeat.tsx
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

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

  const [i, setI] = useState(0);

  useEffect(() => setI(0), [fullText]);

  useEffect(() => {
    if (i >= fullText.length) return;
    const t = window.setTimeout(() => setI((v) => v + 1), msPerChar);
    return () => window.clearTimeout(t);
  }, [i, fullText, msPerChar]);

  return (
    <div className={className} style={{ whiteSpace: "normal" }}>
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
        {fullText.slice(0, i)}
      </ReactMarkdown>
    </div>
  );
}
