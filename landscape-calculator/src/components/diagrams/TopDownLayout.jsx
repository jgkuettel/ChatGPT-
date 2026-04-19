import React, { useMemo } from 'react';

const CLIP_ID = 'layout-clip';

function generateRunningBond(aW, aH, bW, bH, joint = 2) {
  const rects = [];
  const cellW = bW + joint;
  const cellH = bH + joint;
  const rows = Math.ceil(aH / cellH) + 1;
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : -(cellW / 2);
    const cols = Math.ceil(aW / cellW) + 2;
    for (let col = -1; col < cols; col++) {
      rects.push({ x: col * cellW + offset, y: row * cellH, w: bW, h: bH });
    }
  }
  return rects;
}

function generateHerringbone(aW, aH, bW, bH, joint = 2) {
  const rects = [];
  const unitW = bW + bH + joint * 2;
  const unitH = bW + bH + joint * 2;
  const cols = Math.ceil(aW / unitW) + 2;
  const rows = Math.ceil(aH / unitH) + 2;
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const bx = col * unitW;
      const by = row * unitH;
      // Horizontal brick
      rects.push({ x: bx, y: by, w: bW, h: bH });
      // Vertical brick
      rects.push({ x: bx + bW + joint, y: by, w: bH, h: bW });
      // Second row in unit
      rects.push({ x: bx, y: by + bH + joint, w: bH, h: bW });
      rects.push({ x: bx + bH + joint, y: by + bH + joint, w: bW, h: bH });
    }
  }
  return rects;
}

function generateBasketweave(aW, aH, bW, bH, joint = 2) {
  const rects = [];
  const cellW = bW + joint;
  const cellH = bH + joint;
  const cols = Math.ceil(aW / (cellW * 2)) + 2;
  const rows = Math.ceil(aH / (cellH * 2)) + 2;
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const bx = col * cellW * 2;
      const by = row * cellH * 2;
      const flip = (row + col) % 2 === 0;
      if (flip) {
        rects.push({ x: bx, y: by, w: bW, h: bH });
        rects.push({ x: bx + cellW, y: by, w: bW, h: bH });
        rects.push({ x: bx, y: by + cellH, w: bH, h: bW });
        rects.push({ x: bx + cellW, y: by + cellH, w: bH, h: bW });
      } else {
        rects.push({ x: bx, y: by, w: bH, h: bW });
        rects.push({ x: bx, y: by + cellH, w: bH, h: bW });
        rects.push({ x: bx + cellW, y: by, w: bW, h: bH });
        rects.push({ x: bx + cellW, y: by + cellH, w: bW, h: bH });
      }
    }
  }
  return rects;
}

function generateRandom(aW, aH, baseW, baseH, joint = 3) {
  const rects = [];
  const sizes = [
    [baseW, baseH], [baseW * 1.5, baseH], [baseW, baseH * 1.5],
    [baseW * 0.6, baseH * 0.9], [baseW * 1.2, baseH * 0.6],
  ];
  let y = 0;
  while (y < aH + baseH) {
    let x = 0;
    const rowH = baseH * (0.8 + Math.random() * 0.5);
    while (x < aW + baseW) {
      const [w, h] = sizes[Math.floor(Math.random() * sizes.length)];
      rects.push({ x, y, w: w - joint, h: rowH - joint });
      x += w;
    }
    y += rowH;
  }
  return rects;
}

export default function TopDownLayout({ dimensions, surface, edging, pattern }) {
  const CANVAS_W = 500;
  const CANVAS_H = 380;
  const PAD = 40;

  const dW = dimensions?.displayW || 0;
  const dL = dimensions?.displayL || 0;

  const { dispW, dispH, originX, originY } = useMemo(() => {
    if (!dW || !dL) return { dispW: 0, dispH: 0, originX: 0, originY: 0 };
    const maxW = CANVAS_W - PAD * 2;
    const maxH = CANVAS_H - PAD * 2;
    const scale = Math.min(maxW / dW, maxH / dL);
    const dispW = dW * scale;
    const dispH = dL * scale;
    return {
      dispW,
      dispH,
      scale,
      originX: (CANVAS_W - dispW) / 2,
      originY: (CANVAS_H - dispH) / 2,
    };
  }, [dW, dL]);

  const product = surface?.product;
  const hasArea = dispW > 0 && dispH > 0;

  const paverColor = product?.color ?? '#D0C8B8';
  const jointColor = 'rgba(0,0,0,.18)';
  const edgingColor = edging?.product?.color ?? '#1A1A1A';

  const paverRects = useMemo(() => {
    if (!hasArea || !product?.paverW) return null;
    const scale = dispW / (dW * 12); // px per inch
    const bW = product.paverW * scale;
    const bH = product.paverH * scale;
    const joint = 2;

    switch (pattern) {
      case 'herringbone': return generateHerringbone(dispW, dispH, bW, bH, joint);
      case 'basketweave': return generateBasketweave(dispW, dispH, bW, bH, joint);
      case 'random':      return generateRandom(dispW, dispH, bW, bH, joint);
      default:            return generateRunningBond(dispW, dispH, bW, bH, joint);
    }
  }, [hasArea, product, dispW, dispH, dW, pattern]);

  if (!hasArea) {
    return (
      <div className="empty-state" style={{ padding: '32px 16px' }}>
        <div className="empty-state-icon">🗺️</div>
        <div className="empty-state-title">Enter dimensions</div>
        <div className="empty-state-body">Set project dimensions to see the top-down layout.</div>
      </div>
    );
  }

  // For non-paver surfaces (mulch, rock, etc.) just show a solid fill
  const isSolidFill = !product?.paverW;

  return (
    <svg
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      style={{ width: '100%', height: 'auto', maxHeight: 380 }}
      aria-label="Top-down layout"
    >
      <defs>
        <clipPath id={CLIP_ID}>
          <rect x={originX} y={originY} width={dispW} height={dispH} />
        </clipPath>
      </defs>

      {/* Background */}
      <rect width={CANVAS_W} height={CANVAS_H} fill="var(--color-bg)" />

      {/* Base fill or paver pattern */}
      {isSolidFill && (
        <rect x={originX} y={originY} width={dispW} height={dispH} fill={paverColor} rx="1" />
      )}

      {!isSolidFill && paverRects && (
        <g clipPath={`url(#${CLIP_ID})`} transform={`translate(${originX},${originY})`}>
          {/* Background joint color */}
          <rect x={0} y={0} width={dispW} height={dispH} fill={jointColor} />
          {paverRects.map((r, i) => (
            <rect
              key={i}
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              fill={paverColor}
              rx="0.5"
            />
          ))}
        </g>
      )}

      {/* Area border / edging */}
      <rect
        x={originX}
        y={originY}
        width={dispW}
        height={dispH}
        fill="none"
        stroke={edgingColor}
        strokeWidth={edging ? 4 : 1.5}
        rx="1"
      />

      {/* Dimension arrows & labels */}
      {/* Width arrow */}
      <g>
        <line x1={originX} y1={originY - 14} x2={originX + dispW} y2={originY - 14} stroke="var(--color-text-3)" strokeWidth="1" />
        <line x1={originX} y1={originY - 18} x2={originX} y2={originY - 10} stroke="var(--color-text-3)" strokeWidth="1" />
        <line x1={originX + dispW} y1={originY - 18} x2={originX + dispW} y2={originY - 10} stroke="var(--color-text-3)" strokeWidth="1" />
        <text
          x={originX + dispW / 2}
          y={originY - 18}
          textAnchor="middle"
          fontSize="11"
          fontFamily="var(--font)"
          fill="var(--color-text-2)"
          fontWeight="600"
        >
          {dW.toFixed(1)}′
        </text>
      </g>

      {/* Height arrow */}
      <g>
        <line x1={originX - 14} y1={originY} x2={originX - 14} y2={originY + dispH} stroke="var(--color-text-3)" strokeWidth="1" />
        <line x1={originX - 18} y1={originY} x2={originX - 10} y2={originY} stroke="var(--color-text-3)" strokeWidth="1" />
        <line x1={originX - 18} y1={originY + dispH} x2={originX - 10} y2={originY + dispH} stroke="var(--color-text-3)" strokeWidth="1" />
        <text
          x={originX - 22}
          y={originY + dispH / 2}
          textAnchor="middle"
          fontSize="11"
          fontFamily="var(--font)"
          fill="var(--color-text-2)"
          fontWeight="600"
          transform={`rotate(-90, ${originX - 22}, ${originY + dispH / 2})`}
        >
          {dL.toFixed(1)}′
        </text>
      </g>

      {/* Area label in center */}
      {dispW > 80 && dispH > 40 && (
        <text
          x={originX + dispW / 2}
          y={originY + dispH / 2 + 5}
          textAnchor="middle"
          fontSize="13"
          fontFamily="var(--font)"
          fill="rgba(255,255,255,.6)"
          fontWeight="700"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,.5)' }}
        >
          {(dW * dL).toFixed(0)} sq ft
        </text>
      )}

      {/* Compass rose */}
      <g transform={`translate(${CANVAS_W - 24}, 20)`}>
        <circle r="10" fill="rgba(0,0,0,.08)" />
        <text x="0" y="-2" textAnchor="middle" fontSize="10" fill="var(--color-text-3)" fontFamily="var(--font)" fontWeight="700">N</text>
        <line x1="0" y1="-10" x2="0" y2="10" stroke="var(--color-text-3)" strokeWidth=".8" />
        <line x1="-10" y1="0" x2="10" y2="0" stroke="var(--color-text-3)" strokeWidth=".8" />
      </g>
    </svg>
  );
}
