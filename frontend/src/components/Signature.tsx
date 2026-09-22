export function Signature({ className = "" }: { className?: string }) {
  return (
    <div className={`fst-italic text-end ${className}`.trim()}>
      Євген Проскуликов
    </div>
  );
}
