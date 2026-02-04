import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";

type VerseBoxProps = {
  titleMd?: string;
  textMd?: string;
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
  const hasTitle = Boolean(titleMd?.trim());
  const hasText = Boolean(textMd?.trim());


  return (
    <section className={className}>
      {hasTitle && (
        <h5 className="verseTitle">
          <ReactMarkdown>{titleMd!}</ReactMarkdown>
        </h5>
      )}

      {hasText && (
        <div className="verseText">
          <ReactMarkdown>{textMd!}</ReactMarkdown>
        </div>
      )}

      {childrenTop && <div className="verseTop">{childrenTop}</div>}
      {childrenBottom && <div className="verseBottom">{childrenBottom}</div>}
    </section>
  );
};
