import React from 'react';
import { formatCurrency, totalCost } from '../utils/calculations';

const ROLE_ORDER = ['surface', 'sand', 'base', 'drain', 'wall_block', 'joints', 'edging', 'fabric'];

export default function MaterialsList({ materials, compact = false }) {
  if (!materials || materials.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <div className="empty-state-title">No materials yet</div>
        <div className="empty-state-body">
          Complete the project type and dimensions steps to see your material list.
        </div>
      </div>
    );
  }

  const sorted = [...materials].sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role)
  );

  const total = totalCost(materials);

  return (
    <div className="materials-card">
      <div className="materials-card-header">
        <span className="materials-card-title">Material List</span>
        <span className="badge badge-green">{materials.length} items</span>
      </div>

      {!compact && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 88px 88px',
            padding: '6px 20px',
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.5px',
            color: 'var(--color-text-3)',
            borderBottom: '1px solid var(--color-border-light)',
          }}
        >
          <span>Product</span>
          <span style={{ textAlign: 'right' }}>Qty</span>
          <span style={{ textAlign: 'right' }}>Subtotal</span>
        </div>
      )}

      {sorted.map((m) => (
        <div className="materials-row" key={m.id}>
          <div
            className="materials-row-swatch"
            style={{ background: m.product.color }}
          />
          <div className="materials-row-info">
            <div className="materials-row-name">{m.product.name}</div>
            <div className="materials-row-note">{m.label} · {m.note}</div>
          </div>
          <div className="materials-row-qty">
            {m.qty.toLocaleString()}
            <br />
            <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--color-text-3)' }}>
              {m.unit}
            </span>
          </div>
          {!compact && (
            <div className="materials-row-subtotal">
              {formatCurrency(m.subtotal)}
            </div>
          )}
        </div>
      ))}

      <div className="materials-total-row">
        <span className="materials-total-label">Estimated Total</span>
        <span className="materials-total-value">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
