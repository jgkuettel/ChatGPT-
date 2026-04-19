import React, { useState, useEffect } from 'react';
import { STORAGE_KEY } from '../context/ProjectContext';
import { PROJECT_TYPES, buildCrossSectionLayers, formatCurrency, totalCost } from '../utils/calculations';
import CrossSectionDiagram from './diagrams/CrossSectionDiagram';
import TopDownLayout from './diagrams/TopDownLayout';

const ROLE_ORDER = ['surface', 'sand', 'base', 'drain', 'wall_block', 'joints', 'edging', 'fabric'];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function CustomerView() {
  const [project, setProject] = useState(loadState);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY) {
        try {
          setProject(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Poll as fallback for same-tab dev
  useEffect(() => {
    const id = setInterval(() => {
      const fresh = loadState();
      if (fresh) setProject(fresh);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const hasMaterials = project?.materials?.length > 0;
  const cfg = PROJECT_TYPES[project?.projectType] ?? {};
  const crossLayers = project ? buildCrossSectionLayers(project, project.materials ?? []) : [];
  const total = project ? totalCost(project.materials ?? []) : 0;
  const sortedMaterials = project?.materials
    ? [...project.materials].sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role))
    : [];

  return (
    <div className="customer-shell">
      {/* ── Header ── */}
      <header className="customer-header">
        <div className="customer-logo">🌿</div>
        <div>
          <div className="customer-header-title">
            {project?.projectName || 'Landscape Materials'}
          </div>
          <div className="customer-header-sub">
            {cfg.name
              ? `${cfg.name} · ${project?.dimensions?.area?.toFixed(0) ?? 0} sq ft`
              : 'Your custom material estimate'}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {total > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 4 }}>
              Estimated Total
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#34c759', letterSpacing: '-1px' }}>
              {formatCurrency(total)}
            </div>
          </div>
        )}
      </header>

      {/* ── Body ── */}
      {!hasMaterials ? (
        <div className="customer-no-data" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <div style={{ fontSize: 96, opacity: .12 }}>🌿</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(255,255,255,.3)' }}>
            Waiting for project data…
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.2)', maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>
            Use the staff calculator on the other screen to configure a project. Results appear here in real time.
          </div>
        </div>
      ) : (
        <div className="customer-body">
          {/* ── Left column: diagrams ── */}
          <div className="customer-col">
            <div>
              <div className="customer-section-title">Cross-Section View</div>
              <div
                style={{
                  background: '#0d0d0d',
                  borderRadius: 16,
                  padding: '20px 16px',
                  border: '1px solid #1a1a1a',
                }}
              >
                <CrossSectionDiagram layers={crossLayers} />
              </div>
            </div>

            <div>
              <div className="customer-section-title">Top-Down Layout</div>
              <div
                style={{
                  background: '#0d0d0d',
                  borderRadius: 16,
                  padding: '16px',
                  border: '1px solid #1a1a1a',
                }}
              >
                <TopDownLayout
                  dimensions={project.dimensions}
                  surface={project.layers?.find(l => l.role === 'surface')}
                  edging={project.layers?.find(l => l.role === 'edging')}
                  pattern={project.options?.pattern}
                />
              </div>
            </div>
          </div>

          {/* ── Right column: materials ── */}
          <div className="customer-col">
            <div>
              <div className="customer-section-title">Your Materials</div>

              {sortedMaterials.map(m => (
                <div className="customer-material-row" key={m.id}>
                  <div
                    className="customer-material-swatch"
                    style={{ background: m.product.color }}
                  />
                  <div className="customer-material-info">
                    <div className="customer-material-name">{m.product.name}</div>
                    <div className="customer-material-qty">
                      {m.qty.toLocaleString()} {m.unit} · {m.label}
                    </div>
                  </div>
                  <div className="customer-material-price">
                    {formatCurrency(m.subtotal)}
                  </div>
                </div>
              ))}

              <div className="customer-total">
                <div>
                  <div className="customer-total-label">Materials Total</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 4 }}>
                    Excludes delivery & installation
                  </div>
                </div>
                <div className="customer-total-value">{formatCurrency(total)}</div>
              </div>
            </div>

            {/* Project spec pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                project.dimensions.area > 0 && `${project.dimensions.area.toFixed(0)} sq ft`,
                project.dimensions.perimeter > 0 && `${project.dimensions.perimeter.toFixed(0)} lf perimeter`,
                cfg.name,
                project.options?.pattern?.replace('_', ' '),
                project.options?.wastePercent && `${project.options.wastePercent}% waste`,
              ].filter(Boolean).map((tag, i) => (
                <span
                  key={i}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: '#141414',
                    border: '1px solid #222',
                    fontSize: 12,
                    color: 'rgba(255,255,255,.45)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.2)', lineHeight: 1.6 }}>
              * Estimate only. Final pricing confirmed at point of sale. Prices do not include delivery, installation labor, or equipment rental.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
