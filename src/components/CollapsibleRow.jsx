export default function CollapsibleRow({
  title,
  weight,
  open,
  onToggle,
  children,
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg border border-steel-200 bg-white px-3 py-2 text-left"
      >
        <span className="text-sm font-bold text-steel-800">
          {open ? "▼" : "▶"} {title || "Row"}
        </span>
        <span className="font-mono text-xs font-bold text-steel-600">
          {weight} KG
        </span>
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}
