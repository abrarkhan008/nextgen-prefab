import { useNavigate } from "react-router-dom";

export default function TopBar({ title, subtitle, onBack }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-steel-100 bg-white/95 px-4 py-3 backdrop-blur safe-top">
      <button
        onClick={() => (onBack ? onBack() : navigate(-1))}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-steel-50 text-steel-700"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold text-steel-900">{title}</h1>
        {subtitle && <p className="truncate text-xs text-steel-500">{subtitle}</p>}
      </div>
    </div>
  );
}
