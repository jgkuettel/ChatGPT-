import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { PROJECT_TYPES } from '../../utils/calculations';
import ProductSearch from '../ProductSearch';
import PRODUCTS from '../../data/products';

const LAYER_META = {
  surface:    { label: 'Surface Material', color: '#2db87d', required: true },
  sand:       { label: 'Bedding Sand',      color: '#E8D5A3', required: false },
  base:       { label: 'Compactible Base',  color: '#B0A090', required: false },
  joints:     { label: 'Polymeric Joint Sand', color: '#D4C49A', required: false },
  edging:     { label: 'Edging',            color: '#1A1A1A', required: false },
  fabric:     { label: 'Landscape Fabric',  color: '#2A2A2A', required: false },
  drain:      { label: 'Drain Rock',        color: '#9E9E9E', required: false },
  wall_block: { label: 'Wall Blocks',       color: '#8A8278', required: true },
  soil:       { label: 'Soil / Compost',    color: '#2D1F10', required: false },
};

const PATTERNS = [
  { key: 'running_bond', label: 'Running Bond', icon: '▤' },
  { key: 'herringbone',  label: 'Herringbone',  icon: '▧' },
  { key: 'basketweave',  label: 'Basketweave',  icon: '▦' },
  { key: 'random',       label: 'Random Flag',  icon: '▨' },
];

const ROLE_FILTER = {
  surface:    null,
  sand:       'sand',
  base:       'base',
  joints:     'joints',
  edging:     'edging',
  fabric:     'fabric',
  drain:      'drain',
  wall_block: 'wall_block',
  soil:       'soil',
};

export default function StepMaterials() {
  const { state, dispatch } = useProject();
  const cfg = PROJECT_TYPES[state.projectType] ?? {};

  function setProduct(role, product) {
    dispatch({ type: 'SET_LAYER_PRODUCT', role, product });
  }

  function setDepth(role, depth) {
    dispatch({ type: 'SET_LAYER_DEPTH', role, depth: parseFloat(depth) || 0 });
  }

  function toggleLayer(role, defaultDepth) {
    dispatch({ type: 'TOGGLE_LAYER', role, defaultDepth });
  }

  const activeLayers = state.layers;
  const hasLayer = (role) => activeLayers.some(l => l.role === role);
  const getLayer = (role) => activeLayers.find(l => l.role === role);

  const showPattern = activeLayers.some(l => l.role === 'surface' && l.product?.unit === 'sqft');

  const optionalRoles = ['sand', 'base', 'joints', 'edging', 'fabric', 'drain'];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <div>
        <div className="section-title">Materials</div>
        <div className="section-subtitle">
          Select your surface product and adjust base layers as needed.
        </div>
      </div>

      {activeLayers.map((layer) => {
        const meta = LAYER_META[layer.role];
        if (!meta) return null;
        const hasDepth = ['sand', 'base', 'drain'].includes(layer.role);
        const filterRole = ROLE_FILTER[layer.role];
        const filterCat = layer.role === 'surface' ? (cfg.surfaceCategories?.[0] ?? null) : null;

        return (
          <div className="layer-section" key={layer.role}>
            <div className="layer-header">
              <div
                className="layer-header-dot"
                style={{ background: meta.color }}
              />
              <div className="layer-header-title">{meta.label}</div>
              {!meta.required && (
                <button
                  className={`layer-toggle enabled`}
                  onClick={() => toggleLayer(layer.role, layer.depth)}
                >
                  Remove
                </button>
              )}
            </div>
            <div className="layer-body">
              <ProductSearch
                value={layer.product}
                onChange={(p) => setProduct(layer.role, p)}
                filterRole={filterRole}
                placeholder={`Search ${meta.label.toLowerCase()}…`}
              />
              {hasDepth && (
                <div className="depth-row">
                  <span className="depth-label">Depth</span>
                  <input
                    className="depth-input"
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={layer.depth ?? ''}
                    onChange={e => setDepth(layer.role, e.target.value)}
                  />
                  <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>inches</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Optional layers not yet added */}
      {optionalRoles
        .filter(role => !hasLayer(role) && shouldShowOptional(role, cfg, state.projectType))
        .map(role => {
          const meta = LAYER_META[role];
          if (!meta) return null;
          return (
            <button
              key={role}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--sp-3)',
                padding: 'var(--sp-3) var(--sp-4)',
                border: '1.5px dashed var(--color-border)',
                borderRadius: 'var(--r-md)',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-3)',
                fontSize: 13,
                fontFamily: 'var(--font)',
                transition: 'all var(--dur-fast)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-3)'; }}
              onClick={() => toggleLayer(role, defaultDepthFor(role))}
            >
              <span style={{ fontSize: 16 }}>＋</span>
              Add {meta.label}
            </button>
          );
        })}

      {showPattern && (
        <div className="diagram-card" style={{ marginTop: 'var(--sp-2)' }}>
          <div className="diagram-card-title">Lay Pattern</div>
          <div className="pattern-grid">
            {PATTERNS.map(p => (
              <button
                key={p.key}
                className={`pattern-btn${state.options.pattern === p.key ? ' active' : ''}`}
                onClick={() => dispatch({ type: 'SET_OPTION', key: 'pattern', value: p.key })}
              >
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="field-row" style={{ marginTop: 'var(--sp-2)' }}>
        <div className="field">
          <div className="field-label">Waste Factor</div>
          <div className="field-suffix">
            <input
              className="field-input"
              type="number"
              min="0"
              max="25"
              step="1"
              value={state.options.wastePercent}
              onChange={e => dispatch({ type: 'SET_OPTION', key: 'wastePercent', value: parseInt(e.target.value) || 0 })}
            />
            <span className="field-suffix-label">%</span>
          </div>
          <div className="field-hint">Typically 5–10% for standard, 10–15% for complex patterns.</div>
        </div>
      </div>
    </div>
  );
}

function shouldShowOptional(role, cfg, projectType) {
  if (role === 'sand' && cfg.defaultSandDepth > 0) return false; // already in by default
  if (role === 'base' && cfg.defaultBaseDepth > 0) return false;
  if (role === 'joints' && !cfg.hasPolyJoints) return false;
  if (role === 'edging' && !cfg.hasEdging) return false;
  if (role === 'fabric' && !cfg.hasFabric) return false;
  if (role === 'drain' && projectType !== 'retaining_wall') return false;
  return true;
}

function defaultDepthFor(role) {
  const depths = { sand: 1, base: 4, drain: 6 };
  return depths[role] ?? null;
}
