export const MAX_THICKNESS = 20; // change this number if you need another limit

export default function ThicknessInput({
  label,
  value,
  onChange,
  max = MAX_THICKNESS,
}) {
  const tooBig = Number(value) > max;
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        type="number"
        className="field-input"
        style={
          tooBig
            ? {
                borderColor: "#ef4444",
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
              }
            : undefined
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {tooBig && (
        <p className="mt-1 text-xs font-bold text-red-600">
          ERROR: Thickness is more than {max} mm
        </p>
      )}
    </div>
  );
}
