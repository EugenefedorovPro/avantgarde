import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";

type VerseBoxProps = {
  titleMd?: string;
  textMd?: string | ReactNode;   // 👈 changed
  className?: string;
  childrenTop?: ReactNode;
  childrenBottom?: ReactNode;
};

export const VerseBox = ({
  titleMd,
  textMd,
  className = "verseBox",
  childrenTop,
  childrenBottom,
}: VerseBoxProps) => {
  const hasTitle = Boolean(titleMd && titleMd.trim());

  // text exists if:
  // - string with non-whitespace
  // - OR any ReactNode
  const hasText =
    typeof textMd === "string"
      ? Boolean(textMd.trim())
      : textMd != null;

  return (
    <section className={className}>
      {hasTitle && (
        <h5 className="verseTitle">
          <ReactMarkdown>{titleMd!}</ReactMarkdown>
        </h5>
      )}

      {hasText && (
        <div className="verseText">
          {typeof textMd === "string" ? (
            <ReactMarkdown>{textMd}</ReactMarkdown>
          ) : (
            textMd
          )}
        </div>
      )}

      {childrenTop && <div className="verseTop">{childrenTop}</div>}
      {childrenBottom && <div className="verseBottom">{childrenBottom}</div>}
    </section>
  );
};
