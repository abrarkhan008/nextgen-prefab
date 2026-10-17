// src/components/DrawingSheets.jsx
// Renders each drawing sheet as an A3-landscape SVG (1190 x 842) styled like a CAD proposal drawing.
import { geom, ROW_LETTERS, EXTRA_KINDS } from "../utils/drawing";

const INK = "#111";
const FONT = "Arial, Helvetica, sans-serif";
const mm = (n) => String(Math.round(n));

/* ---------- tiny drawing helpers ---------- */
function T({ x, y, size = 9, anchor = "middle", rot, bold, underline, fill = INK, children }) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      fontFamily={FONT}
      fontWeight={bold ? 700 : 400}
      fill={fill}
      textDecoration={underline ? "underline" : undefined}
      transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}
    >
      {children}
    </text>
  );
}

function HDim({ x1, x2, y, label, fs }) {
  const size = fs || Math.max(4, Math.min(9, (x2 - x1) / 3.2));
  return (
    <g stroke={INK} strokeWidth=".6">
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1 - 2.5} y1={y + 2.5} x2={x1 + 2.5} y2={y - 2.5} strokeWidth="1" />
      <line x1={x2 - 2.5} y1={y + 2.5} x2={x2 + 2.5} y2={y - 2.5} strokeWidth="1" />
      <T x={(x1 + x2) / 2} y={y - 3} size={size}>{label}</T>
    </g>
  );
}

function VDim({ x, y1, y2, label, fs }) {
  const size = fs || Math.max(4, Math.min(9, Math.abs(y2 - y1) / 3.2));
  const my = (y1 + y2) / 2;
  return (
    <g stroke={INK} strokeWidth=".6">
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <line x1={x - 2.5} y1={y1 + 2.5} x2={x + 2.5} y2={y1 - 2.5} strokeWidth="1" />
      <line x1={x - 2.5} y1={y2 + 2.5} x2={x + 2.5} y2={y2 - 2.5} strokeWidth="1" />
      <T x={x - 3} y={my} size={size} rot={-90}>{label}</T>
    </g>
  );
}

function Bubble({ cx, cy, label, r = 9 }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={INK} strokeWidth=".8" />
      <T x={cx} y={cy + 3.2} size={r > 8 ? 9 : 7.5}>{label}</T>
    </g>
  );
}

/* ---------- sheet frame + title block ---------- */
function Frame({ d, company, no, total, title, children }) {
  const bx = 835;
  const by = 678;
  const notes = (d.notes || "").split("\n").filter(Boolean);
  const cells = [
    ["Q-NO:", d.docNo, 55],
    ["DATE:", d.date, 55],
    ["DRAWN BY:", d.drawnBy, 55],
    ["DESIGN BY:", d.designBy, 55],
    ["REV. NO:", d.rev, 45],
    ["SCALE:", d.scale, 60],
  ];
  let cx = bx;
  const nh = 14 + notes.length * 11;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 1190 842" style={{ width: "100%", background: "#fff", display: "block" }}>
      <rect x="0" y="0" width="1190" height="842" fill="#fff" />
      <rect x="15" y="15" width="1160" height="812" fill="none" stroke={INK} strokeWidth="1.6" />
      <rect x="20" y="20" width="1150" height="802" fill="none" stroke={INK} strokeWidth=".8" />

      {/* top boxes */}
      <rect x="20" y="20" width="250" height="26" fill="none" stroke={INK} />
      <T x="26" y="38" size="13" anchor="start">{`${d.docNo}/DE/PD/R${String(d.rev).padStart(2, "0")}`}</T>
      <rect x="20" y="46" width="250" height="20" fill="none" stroke={INK} />
      <T x="26" y="60" size="12" anchor="start">{`SHEET-${no} OF ${total}`}</T>
      <rect x="880" y="20" width="290" height="26" fill="none" stroke={INK} />
      <T x="1025" y="38" size="12">{d.formatNo}</T>

      {children}

      {/* notes + dimension line note */}
      {notes.length > 0 && (
        <g>
          <T x="24" y={790 - nh - 6} size="12" anchor="start">NOTE:</T>
          <rect x="20" y={790 - nh} width="310" height={nh} fill="none" stroke={INK} />
          {notes.map((n, i) => (
            <T key={i} x="26" y={790 - nh + 12 + i * 11} size="8" anchor="start">{n}</T>
          ))}
        </g>
      )}
      <rect x="20" y="790" width="310" height="32" fill="none" stroke={INK} />
      <T x="26" y="811" size="13" anchor="start">ALL DIMENSIONS ARE IN MM.</T>

      {/* sheet title */}
      <T x="580" y="800" size="14" underline>{title}</T>

      {/* title block */}
      <g stroke={INK} fill="none">
        <rect x={bx} y={by} width="325" height="54" />
        <line x1={bx} y1={by + 18} x2={bx + 325} y2={by + 18} />
        <line x1={bx} y1={by + 36} x2={bx + 325} y2={by + 36} />
        <rect x={bx} y={by + 54} width="325" height="56" />
        <line x1={bx + 78} y1={by + 54} x2={bx + 78} y2={by + 110} />
      </g>
      <T x={bx + 4} y={by + 13} size="9.5" anchor="start">{`CLIENT NAME: ${d.clientName}`}</T>
      <T x={bx + 4} y={by + 31} size="9.5" anchor="start">{`BUILDING NAME: ${d.buildingName}`}</T>
      <T x={bx + 4} y={by + 49} size="9.5" anchor="start">{`BUILDING LOCATION: ${d.location}`}</T>
      {company?.logoDataUrl && (
        <image href={company.logoDataUrl} x={bx + 6} y={by + 58} width="66" height="48" preserveAspectRatio="xMidYMid meet" />
      )}
      <T x={bx + 78 + 123} y={by + 74} size="10" bold>{company?.name}</T>
      <T x={bx + 78 + 123} y={by + 87} size="7">{company?.addressLine1}</T>
      <T x={bx + 78 + 123} y={by + 97} size="7">{company?.addressLine2}</T>
      <g stroke={INK} fill="none">
        <rect x={bx} y={by + 110} width="325" height="34" />
      </g>
      {cells.map(([k, v, w]) => {
        const x0 = cx;
        cx += w;
        return (
          <g key={k}>
            {x0 !== bx && <line x1={x0} y1={by + 110} x2={x0} y2={by + 144} stroke={INK} />}
            <T x={x0 + 3} y={by + 121} size="7.5" anchor="start">{k}</T>
            <T x={x0 + 3} y={by + 136} size="7.5" anchor="start">{v}</T>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- SHEET: PLAN ---------- */
function Plan({ d }) {
  const { L, W, n, bw, m, rs } = geom(d);
  const s = Math.min(880 / L, 330 / W);
  const pw = L * s;
  const ph = W * s;
  const ox = 270 + (870 - pw) / 2;
  const oy = 195 + (330 - ph) / 2;
  const X = (v) => ox + v * s;
  const Y = (v) => oy + ph - v * s; // v = distance from front (line A)
  const canopies = d.canopies || [];
  const cpx = (c) => Math.max(16, (+c.width || 0) * s);
  const leftPx = Math.max(0, ...canopies.filter((c) => c.side === "left").map(cpx));
  const frontPx = Math.max(0, ...canopies.filter((c) => c.side === "front").map(cpx));
  const dx = ox - leftPx;
  const bracedBays = [...new Set([1, Math.ceil(n / 3), n - Math.ceil(n / 3) + 1, n])].filter((b) => b >= 1 && b <= n);

  return (
    <g>
      {/* grid bubbles + bay dims */}
      {Array.from({ length: n + 1 }).map((_, i) => (
        <g key={i}>
          <line x1={X(i * bw)} y1={oy - 69} x2={X(i * bw)} y2={oy - 6} stroke={INK} strokeWidth=".5" />
          <Bubble cx={X(i * bw)} cy={oy - 78} label={i + 1} r={n > 20 ? 6 : 9} />
        </g>
      ))}
      <HDim x1={X(0)} x2={X(L)} y={oy - 50} label={`${mm(L)} OUTER TO OUTER OF STEEL LINE`} fs={9} />
      {Array.from({ length: n }).map((_, i) => (
        <HDim key={i} x1={X(i * bw)} x2={X((i + 1) * bw)} y={oy - 28} label={mm(bw)} />
      ))}

      {/* grid lines */}
      <g stroke="#444" strokeWidth=".5" strokeDasharray="9 3 2 3" fill="none">
        {Array.from({ length: n - 1 }).map((_, i) => (
          <line key={i} x1={X((i + 1) * bw)} y1={oy} x2={X((i + 1) * bw)} y2={oy + ph} />
        ))}
        {Array.from({ length: m - 1 }).map((_, i) => (
          <line key={i} x1={ox} y1={Y((i + 1) * rs)} x2={ox + pw} y2={Y((i + 1) * rs)} />
        ))}
      </g>

      {/* row bubbles + left dims */}
      {Array.from({ length: m + 1 }).map((_, k) => (
        <g key={k}>
          <line x1={dx - 109} y1={Y(k * rs)} x2={ox - 4} y2={Y(k * rs)} stroke="#777" strokeWidth=".4" />
          <Bubble cx={dx - 118} cy={Y(k * rs)} label={ROW_LETTERS[k] || k} r={m > 14 ? 6 : 9} />
        </g>
      ))}
      <line x1={dx - 109} y1={Y(W / 2)} x2={ox - 4} y2={Y(W / 2)} stroke="#777" strokeWidth=".4" />
      <VDim x={dx - 90} y1={Y(0)} y2={Y(W)} label={`${mm(W)} OUTER TO OUTER OF STEEL LINE`} fs={9} />
      <VDim x={dx - 66} y1={Y(0)} y2={Y(W / 2)} label={`${mm(W / 2)} OUTER TO RIDGE`} fs={8} />
      <VDim x={dx - 66} y1={Y(W / 2)} y2={Y(W)} label={`${mm(W / 2)} RIDGE TO OUTER`} fs={8} />
      {Array.from({ length: m }).map((_, k) => (
        <VDim key={k} x={dx - 42} y1={Y(k * rs)} y2={Y((k + 1) * rs)} label={mm(rs)} />
      ))}

      {/* canopies */}
      {canopies.map((c) => {
        const cw = cpx(c);
        const label = `${(((+c.width) || 0) / 1000).toFixed(3)}M WIDE CANOPY WITH SOFFIT`;
        if (c.side === "front" || c.side === "back") {
          const x1 = X((Math.max(1, c.fromBay) - 1) * bw);
          const x2 = X(Math.min(n, c.toBay) * bw);
          const y = c.side === "front" ? oy + ph : oy - cw;
          return (
            <g key={c.id}>
              <rect x={x1} y={y} width={x2 - x1} height={cw} fill="#fff" stroke={INK} strokeWidth=".8" />
              <T x={(x1 + x2) / 2} y={y + cw / 2 + 1} size="4.5">{label}</T>
            </g>
          );
        }
        const x = c.side === "left" ? ox - cw : ox + pw;
        return (
          <g key={c.id}>
            <rect x={x} y={oy} width={cw} height={ph} fill="#fff" stroke={INK} strokeWidth=".8" />
            <T x={x + cw / 2 + 2} y={oy + ph / 2} size="7" rot={-90}>{label}</T>
          </g>
        );
      })}

      {/* building outline */}
      <rect x={ox} y={oy} width={pw} height={ph} fill="none" stroke={INK} strokeWidth="1.8" />

      {/* ridge line */}
      <line x1={ox} y1={Y(W / 2)} x2={ox + pw} y2={Y(W / 2)} stroke={INK} strokeWidth="1" />

      {/* jack beams */}
      {d.jackBeam &&
        Array.from({ length: n }).map((_, i) => {
          const b = i + 1;
          if (b % 2 !== 0 || b === n) return null;
          const x1 = X(i * bw + bw * 0.15);
          const x2 = X(i * bw + bw * 0.85);
          return (
            <g key={b}>
              <line x1={x1} y1={Y(W / 2)} x2={x2} y2={Y(W / 2)} stroke={INK} strokeWidth="3" />
              <T x={(x1 + x2) / 2} y={Y(W / 2) - 6} size="7" underline>JACK BEAM</T>
            </g>
          );
        })}

      <rect x={ox + pw / 2 - 38} y={Y(W / 2) - 8} width="76" height="14" fill="#fff" />
      <T x={ox + pw / 2} y={Y(W / 2) + 3} size="11">C/L OF RIDGE</T>

      {/* cross bracing labels */}
      {d.crossBracing &&
        bracedBays.map((b) => (
          <g key={b}>
            <T x={X((b - 1) * bw) + 3} y={oy + 8} size="5" anchor="start">CROSS BRACING</T>
            <T x={X((b - 1) * bw) + 3} y={oy + ph - 3} size="5" anchor="start">CROSS BRACING</T>
          </g>
        ))}

      {/* framed openings */}
      {(d.openings || []).map((o) => {
        const cx = X((o.bay - 0.5) * bw);
        const ow = (+o.width || 0) * s;
        const yy = o.wall === "back" ? oy : oy + ph;
        const cy = o.wall === "back" ? oy + 16 : oy + ph - 16;
        return (
          <g key={o.id}>
            <rect x={cx - ow / 2} y={yy - 2.5} width={ow} height="5" fill="#fff" />
            <circle cx={cx} cy={cy} r="8" fill="#fff" stroke={INK} strokeWidth=".8" />
            <T x={cx} y={cy + 2.5} size="6.5">{o.label || "F.O"}</T>
          </g>
        );
      })}

      {/* extras: pillars, stairs, walkways, pipes, angles */}
      {(d.extras || []).map((e) => {
        const k = EXTRA_KINDS[e.kind] || EXTRA_KINDS.pillar;
        const x = X(+e.x);
        const w = Math.max(3, (+e.length || 0) * s);
        const h = Math.max(3, (+e.width || 0) * s);
        const y = Y(+e.y) - h;
        return (
          <g key={e.id}>
            <rect x={x} y={y} width={w} height={h} fill={k.color} stroke={INK} strokeWidth=".8" rx={e.kind === "pipe" ? 2 : 0} />
            {e.kind === "staircase" &&
              Array.from({ length: Math.max(2, Math.floor(h / 3)) }).map((_, i) => (
                <line key={i} x1={x} x2={x + w} y1={y + (i + 1) * 3} y2={y + (i + 1) * 3} stroke={INK} strokeWidth=".3" />
              ))}
            {e.kind === "walkway" && <line x1={x} y1={y} x2={x + w} y2={y + h} stroke={INK} strokeWidth=".3" />}
            {e.kind === "angle" && <path d={`M${x},${y} L${x},${y + h} L${x + w},${y + h}`} fill="none" stroke={INK} strokeWidth="1.4" />}
            <T x={x + w + 3} y={y + 7} size="6" anchor="start" underline>{e.label}</T>
          </g>
        );
      })}

      {/* brick wall text */}
      {+d.brickWall > 0 && (
        <T x={ox + pw / 2} y={oy + ph + frontPx + 36} size="13">
          {`ALL AROUND ${(d.brickWall / 1000).toFixed(3)}M BRICK WALL AND ABOVE SHEETING`}
        </T>
      )}
    </g>
  );
}

/* ---------- SHEET: CROSS SECTION ---------- */
function Section({ d }) {
  const { W, m, rs, rise, H, Hr, slope } = geom(d);
  const s = Math.min(780 / W, 300 / Hr);
  const pw = W * s;
  const ox = 595 - pw / 2;
  const gy = 520;
  const Xp = (v) => ox + v * s;
  const Yp = (v) => gy - v * s;
  const roofY = (u) => Yp(H + (u <= W / 2 ? u : W - u) / slope);
  const mid = ox + pw / 2;
  const canopies = d.canopies || [];
  const fc = canopies.find((c) => c.side === "front");
  const bc = canopies.find((c) => c.side === "back");
  const cz = Math.min(+d.canopyHeight || 4500, H - 600);
  const letters = [ROW_LETTERS[0], ROW_LETTERS[Math.round(m / 2)], ROW_LETTERS[m]];
  const pts = [[ox, Yp(H)], [mid, Yp(Hr)], [ox + pw, Yp(H)]];
  const lower = pts.map(([x, y]) => `${x},${y + 7}`).join(" ");
  const interior = [];
  for (let i = 2; i <= Math.max(2, geom(d).n); i++) interior.push(i);

  return (
    <g>
      {/* floor */}
      <line x1={ox - 10} y1={gy} x2={ox + pw + 10} y2={gy} stroke={INK} strokeWidth=".8" />
      <T x={mid + 120} y={gy - 4} size="6.5" underline>FFL</T>

      {/* columns */}
      {[ox - 2.5, ox + pw - 2.5].map((x) => (
        <rect key={x} x={x} y={Yp(H)} width="5" height={gy - Yp(H)} fill="#e4e4e4" stroke={INK} strokeWidth=".9" />
      ))}

      {/* rafters */}
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={INK} strokeWidth="1.6" />
      <polyline points={lower} fill="none" stroke={INK} strokeWidth=".8" />
      {Array.from({ length: m + 1 }).map((_, k) => {
        const u = k * rs;
        const y = roofY(u);
        return <rect key={k} x={Xp(u) - 2} y={y - 4} width="4" height="4" fill="#fff" stroke={INK} strokeWidth=".7" />;
      })}

      {/* jack beam */}
      {d.jackBeam && (
        <g>
          <polygon points={`${mid - 7},${Yp(Hr) + 8} ${mid + 7},${Yp(Hr) + 8} ${mid + 3},${Yp(Hr) + 20} ${mid - 3},${Yp(Hr) + 20}`} fill="#ddd" stroke={INK} strokeWidth=".8" />
          <line x1={mid + 8} y1={Yp(Hr) + 18} x2={mid + 30} y2={Yp(Hr) + 24} stroke={INK} strokeWidth=".5" />
          <T x={mid + 32} y={Yp(Hr) + 27} size="7" anchor="start" underline>JACK BEAM</T>
        </g>
      )}

      {/* centre line */}
      <line x1={mid} y1={Yp(Hr) - 28} x2={mid} y2={gy + 74} stroke={INK} strokeWidth=".6" strokeDasharray="14 3 2 3" />
      <T x={mid} y={Yp(Hr) - 32} size="10">C/L OF RIDGE</T>

      {/* labels */}
      <T x={Xp(W * 0.25)} y={roofY(W * 0.25) - 18} size="7.5" underline>ROOF SHEETING</T>
      <line x1={Xp(W * 0.25)} y1={roofY(W * 0.25) - 15} x2={Xp(W * 0.25) + 6} y2={roofY(W * 0.25) - 2} stroke={INK} strokeWidth=".5" />
      <T x={Xp(W * 0.75)} y={roofY(W * 0.75) - 18} size="7.5" underline>ROOF SHEETING</T>
      <line x1={Xp(W * 0.75)} y1={roofY(W * 0.75) - 15} x2={Xp(W * 0.75) - 6} y2={roofY(W * 0.75) - 2} stroke={INK} strokeWidth=".5" />
      <T x={ox - 12} y={Yp(H) - 14} size="7.5" anchor="end" underline>EAVE GUTTER W/</T>
      <T x={ox - 12} y={Yp(H) - 5} size="7.5" anchor="end">STD. DOWNSPOT</T>
      <T x={ox + pw + 12} y={Yp(H) - 14} size="7.5" anchor="start" underline>EAVE GUTTER W/</T>
      <T x={ox + pw + 12} y={Yp(H) - 5} size="7.5" anchor="start">STD. DOWNSPOT</T>
      <T x={ox - 14} y={Yp(H) + 32} size="7.5" anchor="end" underline>WALL SHEETING</T>
      <T x={ox + pw + 14} y={Yp(H) + 32} size="7.5" anchor="start" underline>WALL SHEETING</T>
      <T x={ox + 18} y={Yp(H) - 6} size="6">{`1:${slope}`}</T>

      {/* canopies */}
      {fc && (
        <g>
          <line x1={ox - (+fc.width) * s} y1={Yp(cz) + 3} x2={ox} y2={Yp(cz)} stroke={INK} strokeWidth="1.5" />
          <T x={ox - (+fc.width) * s - 2} y={Yp(cz) + 14} size="6" anchor="end">{`${mm(fc.width)} WIDE CANOPY TYP`}</T>
        </g>
      )}
      {bc && (
        <g>
          <line x1={ox + pw + (+bc.width) * s} y1={Yp(cz) + 3} x2={ox + pw} y2={Yp(cz)} stroke={INK} strokeWidth="1.5" />
          <T x={ox + pw + (+bc.width) * s + 2} y={Yp(cz) + 14} size="6" anchor="start">{`${mm(bc.width)} WIDE CANOPY TYP`}</T>
        </g>
      )}

      {/* extras (shown dashed) */}
      {(d.extras || []).map((e) => {
        const k = EXTRA_KINDS[e.kind] || EXTRA_KINDS.pillar;
        const x = Xp(+e.y);
        const w = Math.max(2, (+e.width || 0) * s);
        const h = Math.max(2, (+e.height || 0) * s);
        return (
          <g key={e.id}>
            <rect x={x} y={Yp((+e.z || 0) + (+e.height || 0))} width={w} height={h} fill={k.color} fillOpacity=".7" stroke={INK} strokeWidth=".7" strokeDasharray="3 2" />
            <T x={x + w / 2} y={Yp((+e.z || 0) + (+e.height || 0)) - 3} size="6">{e.label}</T>
          </g>
        );
      })}

      {/* height dims */}
      <VDim x={ox + 28} y1={Yp(0)} y2={Yp(H)} label={`${mm(H)} CLEAR HT`} fs={9} />
      <line x1={ox + 6} y1={Yp(H)} x2={ox + 32} y2={Yp(H)} stroke={INK} strokeWidth=".4" />
      {+d.brickWall > 0 && (
        <g>
          <VDim x={ox - 18} y1={Yp(0)} y2={Yp(+d.brickWall)} label={`${mm(d.brickWall)} B/W`} fs={9} />
          <VDim x={ox + pw + 18} y1={Yp(0)} y2={Yp(+d.brickWall)} label={`${mm(d.brickWall)} B/W`} fs={9} />
        </g>
      )}

      {/* bottom dims + bubbles */}
      {[ox, mid, ox + pw].map((x) => (
        <line key={x} x1={x} y1={gy + 4} x2={x} y2={gy + 62} stroke={INK} strokeWidth=".4" />
      ))}
      <HDim x1={ox} x2={mid} y={gy + 32} label={`${mm(W / 2)} OUTER TO RIDGE`} fs={10} />
      <HDim x1={mid} x2={ox + pw} y={gy + 32} label={`${mm(W / 2)} RIDGE TO OUTER`} fs={10} />
      <HDim x1={ox} x2={ox + pw} y={gy + 56} label={`${mm(W)} OUTER TO OUTER OF STEEL LINE`} fs={10} />
      {[ox, mid, ox + pw].map((x, i) => (
        <g key={x}>
          <line x1={x} y1={gy + 62} x2={x} y2={gy + 75} stroke={INK} strokeWidth=".5" />
          <Bubble cx={x} cy={gy + 84} label={letters[i]} />
        </g>
      ))}
    </g>
  );
}

/* ---------- SHEET: FRONT ELEVATION ---------- */
function Elevation({ d }) {
  const { L, n, bw, H, Hr } = geom(d);
  const s = Math.min(900 / L, 300 / Hr);
  const pw = L * s;
  const ox = 595 - pw / 2 + 20;
  const gy = 430;
  const X = (v) => ox + v * s;
  const Yp = (v) => gy - v * s;
  const patId = "brick-el";
  const canopies = (d.canopies || []).filter((c) => c.side === "front");
  const cz = Math.min(+d.canopyHeight || 4500, H - 600);

  return (
    <g>
      <defs>
        <pattern id={patId} width="8" height="4" patternUnits="userSpaceOnUse">
          <rect width="8" height="4" fill="#f3e3d8" />
          <path d="M0 0H8M0 4H8M4 0V4" stroke="#b98a70" strokeWidth=".4" fill="none" />
        </pattern>
      </defs>
      {/* roof beyond */}
      <rect x={ox} y={Yp(Hr)} width={pw} height={(Hr - H) * s} fill="#eef2f6" stroke={INK} strokeWidth=".8" />
      <T x={ox + pw / 2} y={Yp(Hr) + (Hr - H) * s / 2 + 3} size="7">ROOF SHEETING</T>
      {/* wall */}
      <rect x={ox} y={Yp(H)} width={pw} height={H * s} fill="#fff" stroke={INK} strokeWidth="1.6" />
      {+d.brickWall > 0 && <rect x={ox} y={Yp(+d.brickWall)} width={pw} height={d.brickWall * s} fill={`url(#${patId})`} stroke={INK} strokeWidth=".6" />}
      {Array.from({ length: n + 1 }).map((_, i) => (
        <line key={i} x1={X(i * bw)} y1={Yp(H)} x2={X(i * bw)} y2={gy} stroke={INK} strokeWidth=".9" />
      ))}
      <line x1={ox - 15} y1={gy} x2={ox + pw + 15} y2={gy} stroke={INK} strokeWidth="1" />
      <T x={ox - 18} y={gy - 3} size="6.5" anchor="end" underline>FFL</T>

      {/* openings */}
      {(d.openings || []).filter((o) => o.wall !== "back").map((o) => {
        const cx = X((o.bay - 0.5) * bw);
        const w = (+o.width || 0) * s;
        const h = (+o.height || 0) * s;
        return (
          <g key={o.id}>
            <rect x={cx - w / 2} y={gy - h} width={w} height={h} fill="#fff" stroke={INK} strokeWidth="1" />
            <T x={cx} y={gy - h - 3} size="6">{`${o.label || "F.O"} ${(o.width / 1000).toFixed(1)}M(W) x ${(o.height / 1000).toFixed(1)}M(H)`}</T>
          </g>
        );
      })}
      {/* canopies */}
      {canopies.map((c) => (
        <g key={c.id}>
          <line x1={X((c.fromBay - 1) * bw)} y1={Yp(cz)} x2={X(c.toBay * bw)} y2={Yp(cz)} stroke={INK} strokeWidth="2.4" />
          <T x={(X((c.fromBay - 1) * bw) + X(c.toBay * bw)) / 2} y={Yp(cz) - 3} size="5.5">CANOPY</T>
        </g>
      ))}
      {/* extras */}
      {(d.extras || []).map((e) => {
        const k = EXTRA_KINDS[e.kind] || EXTRA_KINDS.pillar;
        return (
          <g key={e.id}>
            <rect x={X(+e.x)} y={Yp((+e.z || 0) + (+e.height || 0))} width={Math.max(2, (+e.length || 0) * s)} height={Math.max(2, (+e.height || 0) * s)} fill={k.color} fillOpacity=".7" stroke={INK} strokeWidth=".7" strokeDasharray="3 2" />
          </g>
        );
      })}

      {/* dims */}
      <VDim x={ox - 34} y1={Yp(0)} y2={Yp(H)} label={`${mm(H)} CLEAR HT`} fs={8} />
      {+d.brickWall > 0 && <VDim x={ox - 52} y1={Yp(0)} y2={Yp(+d.brickWall)} label={`${mm(d.brickWall)} B/W`} fs={8} />}
      {Array.from({ length: n }).map((_, i) => (
        <HDim key={i} x1={X(i * bw)} x2={X((i + 1) * bw)} y={gy + 34} label={mm(bw)} />
      ))}
      <HDim x1={ox} x2={ox + pw} y={gy + 58} label={`${mm(L)} OUTER TO OUTER OF STEEL LINE`} fs={10} />
      {Array.from({ length: n + 1 }).map((_, i) => (
        <g key={i}>
          <line x1={X(i * bw)} y1={gy + 4} x2={X(i * bw)} y2={gy + 74} stroke="#888" strokeWidth=".4" />
          <Bubble cx={X(i * bw)} cy={gy + 84} label={i + 1} r={n > 20 ? 6 : 9} />
        </g>
      ))}
    </g>
  );
}

/* ---------- SHEET: 3D VIEW (isometric, see-through walls) ---------- */
function ThreeD({ d }) {
  const { L, W, n, bw, H, Hr } = geom(d);
  const canopies = d.canopies || [];
  const cwF = Math.max(0, ...canopies.filter((c) => c.side === "front").map((c) => +c.width || 0));
  const k = 0.866;
  const Wc = W + cwF;
  const s = Math.min(880 / ((L + Wc) * k), 470 / ((L + Wc) * 0.5 + Hr));
  const tx = 595 - ((L - Wc) * k * s) / 2;
  const ty = 125 + Hr * s;
  const P = (x, y, z) => `${(tx + (x - y) * k * s).toFixed(1)},${(ty + (x + y) * 0.5 * s - z * s).toFixed(1)}`;
  const poly = (pts, fill, op = 1, sw = 0.8, key) => (
    <polygon key={key} points={pts.map((p) => P(...p)).join(" ")} fill={fill} fillOpacity={op} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
  );
  const box = (x0, y0, z0, l, w, h, color, key) => {
    const x1 = x0 + l, y1 = y0 + w, z1 = z0 + h;
    return (
      <g key={key}>
        {poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], color, 1, 0.7)}
        {poly([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], color, 0.8, 0.7)}
        {poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], "#fff", 0.55, 0.7)}
      </g>
    );
  };
  const extras = [...(d.extras || [])]
    .map((e) => ({ ...e, y3: W - (+e.y + (+e.width || 0)) }))
    .sort((a, b) => +a.x + a.y3 - (+b.x + b.y3));
  const bwH = +d.brickWall || 0;
  const cz = Math.min(+d.canopyHeight || 4500, H - 600);

  return (
    <g>
      {poly([[0, 0, 0], [L, 0, 0], [L, W, 0], [0, W, 0]], "#eef1f4", 1, 0.8)}
      {/* extras first, so they show through the see-through walls */}
      {extras.map((e) => {
        const kd = EXTRA_KINDS[e.kind] || EXTRA_KINDS.pillar;
        return box(+e.x, e.y3, +e.z || 0, +e.length || 0, +e.width || 0, +e.height || 0, kd.color, e.id);
      })}
      {/* far roof + back wall + left gable */}
      {poly([[0, 0, H], [L, 0, H], [L, W / 2, Hr], [0, W / 2, Hr]], "#cfd8e0", 0.5)}
      {poly([[0, 0, 0], [L, 0, 0], [L, 0, H], [0, 0, H]], "#e6ebf0", 0.3)}
      {poly([[0, 0, 0], [0, W, 0], [0, W, H], [0, 0, H]], "#e6ebf0", 0.3)}
      {poly([[0, 0, H], [0, W, H], [0, W / 2, Hr]], "#e6ebf0", 0.3)}
      {/* front wall + right gable */}
      {poly([[0, W, 0], [L, W, 0], [L, W, H], [0, W, H]], "#e6ebf0", 0.4)}
      {poly([[L, 0, 0], [L, W, 0], [L, W, H], [L, 0, H]], "#e6ebf0", 0.45)}
      {poly([[L, 0, H], [L, W, H], [L, W / 2, Hr]], "#e6ebf0", 0.45)}
      {bwH > 0 && poly([[0, W, 0], [L, W, 0], [L, W, bwH], [0, W, bwH]], "#c98b6b", 0.55)}
      {bwH > 0 && poly([[L, 0, 0], [L, W, 0], [L, W, bwH], [L, 0, bwH]], "#c98b6b", 0.55)}
      {/* frames */}
      {Array.from({ length: n + 1 }).map((_, i) => {
        const x = i * bw;
        return <polyline key={i} points={[[x, 0, 0], [x, 0, H], [x, W / 2, Hr], [x, W, H], [x, W, 0]].map((p) => P(...p)).join(" ")} fill="none" stroke="#333" strokeWidth=".6" />;
      })}
      {/* openings on front wall */}
      {(d.openings || []).filter((o) => o.wall !== "back").map((o) => {
        const x0 = (o.bay - 0.5) * bw - (+o.width || 0) / 2;
        const x1 = x0 + (+o.width || 0);
        return poly([[x0, W, 0], [x1, W, 0], [x1, W, +o.height || 0], [x0, W, +o.height || 0]], "#3b4a57", 0.85, 0.8, o.id);
      })}
      {/* near roof */}
      {poly([[0, W / 2, Hr], [L, W / 2, Hr], [L, W, H], [0, W, H]], "#b8c7d4", 0.55)}
      <polyline points={[[0, W / 2, Hr], [L, W / 2, Hr]].map((p) => P(...p)).join(" ")} stroke={INK} strokeWidth="1.2" fill="none" />
      {/* canopies */}
      {canopies.filter((c) => c.side === "front").map((c) =>
        box((Math.max(1, c.fromBay) - 1) * bw, W, cz, (Math.min(n, c.toBay) - Math.max(1, c.fromBay) + 1) * bw, +c.width || 0, 150, "#9fb2c2", c.id)
      )}
      <text x="595" y="740" textAnchor="middle" fontSize="10" fontFamily={FONT} fill={INK}>
        {`${mm(L)} (L) x ${mm(W)} (W) x ${mm(H)} (EAVE HT)  |  RIDGE HT ${mm(Hr)}`}
      </text>
    </g>
  );
}

/* ---------- public API ---------- */
export function getSheetKeys(d) {
  const keys = ["plan", "section", "elevation"];
  if (d.show3d) keys.push("3d");
  return keys;
}

const TITLES = {
  plan: () => "PROPOSAL PLAN",
  section: (d) => `CROSS SECTION @GL: ${Array.from({ length: Math.max(0, geom(d).n - 1) }, (_, i) => i + 2).join(",")}`,
  elevation: () => "FRONT ELEVATION @ LINE A",
  "3d": () => "3D VIEW",
};

export const SHEET_LABELS = { plan: "Plan", section: "Section", elevation: "Elevation", "3d": "3D" };

export function DrawingSheet({ d, company, sheetKey, no, total }) {
  const Body = { plan: Plan, section: Section, elevation: Elevation, "3d": ThreeD }[sheetKey];
  return (
    <Frame d={d} company={company} no={no} total={total} title={TITLES[sheetKey](d)}>
      <Body d={d} />
    </Frame>
  );
}