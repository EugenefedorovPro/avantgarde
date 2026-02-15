import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { NeologizmInterface, YearType } from "../api/neologizm";
import "./NeologizmPretty.css";

type Props = { data: NeologizmInterface };
type Bucket = "prewar" | "war" | "future";

function normalizeYears(years: YearType[]): YearType[] {
  return [...years].sort((a, b) => Number(b.year) - Number(a.year));
}

function bucketForYear(yearNum: number): Bucket {
  if (yearNum >= 2022 && yearNum <= 2026) return "war";
  if (yearNum >= 2027) return "future";
  return "prewar";
}

function pickCycled(words: string[] | undefined, index: number): string {
  if (!words || words.length === 0) return "—";
  return words[index % words.length];
}

export function NeologizmPretty({ data }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [leftWidthPx, setLeftWidthPx] = useState<number>(0);

  const rows = useMemo(() => {
    const years = normalizeYears(data.years ?? []);

    let prewarIdx = 0;
    let warIdx = 0;
    let futureIdx = 0;

    return years.map((y) => {
      const yearNum = Number(y.year);
      const bucket = bucketForYear(yearNum);

      let neo = "—";
      if (bucket === "prewar")
        neo = pickCycled(data.harmony_words, prewarIdx++);
      if (bucket === "war") neo = pickCycled(data.disharmony_words, warIdx++);
      if (bucket === "future")
        neo = pickCycled(data.spontaneity_words, futureIdx++);

      return {
        key: y.pk,
        neo: neo.toUpperCase(),
        word: y.word_of_year ?? "—",
        year: y.year,
        bucket,
      };
    });
  }, [data]);

  // ✅ Measure the widest left word and lock the left column width
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const nodes = el.querySelectorAll<HTMLElement>(".neoLeft");
      let max = 0;
      nodes.forEach((n) => {
        max = Math.max(max, n.offsetWidth);
      });
      setLeftWidthPx(max);
    };

    measure();

    // keep it correct on resize / font load
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [rows]);

  return (
    <div
      ref={containerRef}
      className="neoPretty"
      style={
        leftWidthPx
          ? ({
              ["--neoLeftW" as any]: `${leftWidthPx}px`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {rows.map((r) => (
        <div className={`neoRow neoRow--${r.bucket}`} key={r.key}>
          <div className="neoLeft">{r.neo}</div>
          <div className="neoBar" aria-hidden="true" />
          <div className="neoRight">
            <div className="neoYear">{r.year}</div>
            <div className="neoWord">{r.word}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
