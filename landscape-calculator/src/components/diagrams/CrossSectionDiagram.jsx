import React from 'react';

const HATCH_DEFS = {
  pavers: (id, color) => (
    <pattern id={id} x="0" y="0" width="20" height="14" patternUnits="userSpaceOnUse">
      <rect width="20" height="14" fill={color} />
      <rect x="1" y="1" width="8" height="6" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth=".5" rx="0.5" />
      <rect x="11" y="1" width="8" height="6" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth=".5" rx="0.5" />
      <rect x="1" y="8" width="8" height="5" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth=".5" rx="0.5" />
      <rect x="11" y="8" width="8" height="5" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth=".5" rx="0.5" />
    </pattern>
  ),
  sand: (id, color) => (
    <pattern id={id} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill={color} />
      <circle cx="1" cy="1" r=".6" fill="rgba(0,0,0,.15)" />
      <circle cx="4" cy="4" r=".6" fill="rgba(0,0,0,.15)" />
      <circle cx="1" cy="4" r=".4" fill="rgba(0,0,0,.1)" />
    </pattern>
  ),
  gravel: (id, color) => (
    <pattern id={id} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill={color} />
      <circle cx="2" cy="2" r="1.2" fill="rgba(0,0,0,.2)" />
      <circle cx="7" cy="5" r="1.5" fill="rgba(0,0,0,.15)" />
      <circle cx="3" cy="8" r="1" fill="rgba(0,0,0,.18)" />
      <circle cx="8" cy="2" r="0.8" fill="rgba(0,0,0,.12)" />
    </pattern>
  ),
  soil: (id, color) => (
    <pattern id={id} x="0" y="0" width="12" height="8" patternUnits="userSpaceOnUse">
      <rect width="12" height="8" fill={color} />
      <line x1="0" y1="4" x2="12" y2="4" stroke="rgba(0,0,0,.15)" strokeWidth=".8" strokeDasharray="3,3" />
      <circle cx="3" cy="2" r=".8" fill="rgba(0,0,0,.15)" />
      <circle cx="9" cy="6" r=".8" fill="rgba(0,0,0,.15)" />
    </pattern>
  ),
  mulch: (id, color) => (
    <pattern id={id} x="0" y="0" width="16" height="10" patternUnits="userSpaceOnUse">
      <rect width="16" height="10" fill={color} />
      <line x1="0" y1="3" x2="8" y2="6" stroke="rgba(255,255,255,.15)" strokeWidth=".8" />
      <line x1="4" y1="0" x2="12" y2="5" stroke="rgba(255,255,255,.12)" strokeWidth=".8" />
      <line x1="8" y1="4" x2="16" y2="9" stroke="rgba(255,255,255,.15)" strokeWidth=".8" />
    </pattern>
  ),
};

export default function CrossSectionDiagram({ layers }) {
  if (!layers || layers.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '32px 16px' }}>
        <div className="empty-state-icon">📐</div>
        <div className="empty-state-title">No layers configured</div>
        <div className="empty-state-body">Select materials in the wizard to see the cross-section.</div>
      </div>
    );
  }

  const SVG_W = 560;
  const DIAGRAM_X = 90;
  const DIAGRAM_W = 380;
  const LABEL_X = DIAGRAM_X + DIAGRAM_W + 12;
  const TOP_PAD = 16;
  const BOTTOM_PAD = 16;
  const PX_PER_INCH = 9;
  const MIN_LAYER_H = 22;

  const layerHeights = layers.map(l => Math.max(l.depth * PX_PER_INCH, MIN_LAYER_H));
  const totalH = layerHeights.reduce((a, b) => a + b, 0);
  const SVG_H = totalH + TOP_PAD + BOTTOM_PAD + 32;

  let currentY = TOP_PAD;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ width: '100%', height: 'auto', maxHeight: 420 }}
      aria-label="Cross-section diagram"
    >
      <defs>
        {layers.map((layer, i) => {
          const fn = HATCH_DEFS[layer.pattern] ?? HATCH_DEFS.gravel;
          return fn(`pat-${i}`, layer.color);
        })}
      </defs>

      {/* Ground line label */}
      <text
        x={DIAGRAM_X - 8}
        y={TOP_PAD - 4}
        textAnchor="end"
        fontSize="9"
        fontFamily="var(--font)"
        fill="var(--color-text-3)"
        fontWeight="500"
      >
        GRADE
      </text>

      {layers.map((layer, i) => {
        const h = layerHeights[i];
        const y = currentY;
        currentY += h;

        const midY = y + h / 2;
        const isLast = i === layers.length - 1;
        const isSubgrade = layer.role === 'subgrade';

        return (
          <g key={i}>
            {/* Layer fill */}
            <rect
              x={DIAGRAM_X}
              y={y}
              width={DIAGRAM_W}
              height={h}
              fill={`url(#pat-${i})`}
              stroke="rgba(0,0,0,.2)"
              strokeWidth=".8"
            />

            {/* Depth annotation – left side */}
            <line
              x1={DIAGRAM_X - 10}
              y1={y}
              x2={DIAGRAM_X - 10}
              y2={y + h}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
            <line x1={DIAGRAM_X - 14} y1={y} x2={DIAGRAM_X - 6} y2={y} stroke="var(--color-border)" strokeWidth="1" />
            {!isLast && <line x1={DIAGRAM_X - 14} y1={y + h} x2={DIAGRAM_X - 6} y2={y + h} stroke="var(--color-border)" strokeWidth="1" />}

            {h >= 18 && (
              <text
                x={DIAGRAM_X - 16}
                y={midY + 4}
                textAnchor="end"
                fontSize="10"
                fontFamily="var(--font)"
                fill="var(--color-text-2)"
                fontWeight="600"
              >
                {layer.depth}"
              </text>
            )}

            {/* Right-side label connector */}
            <line
              x1={DIAGRAM_X + DIAGRAM_W}
              y1={midY}
              x2={LABEL_X + 4}
              y2={midY}
              stroke="var(--color-border)"
              strokeWidth=".8"
              strokeDasharray={isSubgrade ? '3,3' : 'none'}
            />

            {/* Product name */}
            <text
              x={LABEL_X + 8}
              y={midY - (h >= 28 ? 5 : 2)}
              fontSize="11"
              fontFamily="var(--font)"
              fill="var(--color-text)"
              fontWeight="600"
            >
              {truncate(layer.label, 24)}
            </text>
            {layer.sublabel && h >= 28 && (
              <text
                x={LABEL_X + 8}
                y={midY + 9}
                fontSize="9"
                fontFamily="var(--font)"
                fill="var(--color-text-3)"
              >
                {layer.sublabel}
              </text>
            )}
          </g>
        );
      })}

      {/* Top grade line */}
      <line
        x1={DIAGRAM_X - 20}
        y1={TOP_PAD}
        x2={DIAGRAM_X + DIAGRAM_W + 20}
        y2={TOP_PAD}
        stroke="var(--color-text-2)"
        strokeWidth="1.5"
        strokeDasharray="5,4"
      />

      {/* Scale bar */}
      <g transform={`translate(${DIAGRAM_X}, ${currentY + 14})`}>
        <line x1="0" y1="0" x2={PX_PER_INCH * 12} y2="0" stroke="var(--color-text-3)" strokeWidth="1" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="var(--color-text-3)" strokeWidth="1" />
        <line x1={PX_PER_INCH * 12} y1="-4" x2={PX_PER_INCH * 12} y2="4" stroke="var(--color-text-3)" strokeWidth="1" />
        <text x={PX_PER_INCH * 6} y="-6" textAnchor="middle" fontSize="9" fontFamily="var(--font)" fill="var(--color-text-3)">
          1 foot
        </text>
      </g>
    </svg>
  );
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}
