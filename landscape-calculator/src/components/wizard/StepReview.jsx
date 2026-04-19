import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { PROJECT_TYPES, formatCurrency, totalCost } from '../../utils/calculations';

export default function StepReview() {
  const { state } = useProject();
  const cfg = PROJECT_TYPES[state.projectType] ?? {};
  const total = totalCost(state.materials);

  return (
    <div className="fade-in">
      <div className="section-title">Summary</div>
      <div className="section-subtitle">Review your project details before printing or displaying.</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        {/* Project info */}
        <div className="materials-card">
          <div className="materials-card-header">
            <span className="materials-card-title">Project Details</span>
          </div>
          <div style={{ padding: 'var(--sp-4) var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {[
              ['Project', state.projectName],
              ['Type', cfg.name ?? '—'],
              ['Area', state.dimensions.area > 0 ? `${state.dimensions.area.toFixed(1)} sq ft` : '—'],
              ['Perimeter', state.dimensions.perimeter > 0 ? `${state.dimensions.perimeter.toFixed(1)} lf` : '—'],
              ['Pattern', state.options.pattern?.replace('_', ' ') ?? '—'],
              ['Waste Factor', `${state.options.wastePercent}%`],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--color-text-3)' }}>{label}</span>
                <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Material count */}
        <div
          style={{
            background: 'var(--color-accent-bg)',
            border: '1px solid var(--green-100)',
            borderRadius: 'var(--r-lg)',
            padding: 'var(--sp-4) var(--sp-5)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent-text)' }}>
              {state.materials.length} material{state.materials.length !== 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 2 }}>
              Estimated materials total
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-accent)', letterSpacing: '-.6px' }}>
            {formatCurrency(total)}
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--color-text-3)', lineHeight: 1.6, padding: '0 var(--sp-1)' }}>
          * Pricing is an estimate based on current product rates. Final pricing confirmed at point of sale. Delivery, compaction equipment, and installation labor not included.
        </div>
      </div>
    </div>
  );
}
