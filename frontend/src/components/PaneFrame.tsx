import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyNode?: ReactNode; // custom "no data" / "not found"
};

export function PaneFrame({ children, loading, empty, emptyNode }: Props) {
  return (
    <div style={{ position: "relative" }}>
      {children}

      {loading && (
        <div
          className="verseLoadingOverlay"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.0)",
            pointerEvents: "none",
          }}
        />
      )}

      {empty && (emptyNode ?? <div>no data</div>)}
    </div>
  );
}
