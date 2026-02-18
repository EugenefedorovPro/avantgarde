import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";

type VerseBoxProps = {
  titleMd?: string;
  textMd?: string | ReactNode;
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
  const title = titleMd?.trim() ?? "";
  const hasTitle = title.length > 0;

  const hasText =
    typeof textMd === "string" ? textMd.trim().length > 0 : textMd != null;

  return (
    <section className={className}>
      {/* Top slot (signature, etc.) */}
      {childrenTop && <div className="verseTop">{childrenTop}</div>}

      {/* Optional title */}
      {hasTitle && (
        <h5 className="verseTitle">
          <ReactMarkdown>{title}</ReactMarkdown>
        </h5>
      )}

      {/* Main body: markdown string OR custom ReactNode */}
      {hasText && (
        <div className="verseText">
          {typeof textMd === "string" ? (
            <ReactMarkdown>{textMd}</ReactMarkdown>
          ) : (
            textMd
          )}
        </div>
      )}

      {/* Bottom slot (controls, etc.) */}
      {childrenBottom && <div className="verseBottom">{childrenBottom}</div>}
    </section>
  );

};
