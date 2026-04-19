import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { PROJECT_TYPES } from '../../utils/calculations';

export default function StepDimensions() {
  const { state, dispatch } = useProject();
  const cfg = PROJECT_TYPES[state.projectType] ?? {};
  const isWall = cfg.dimensionType === 'wall';

  function set(field, value) {
    dispatch({ type: 'SET_DIMENSION', field, value });
  }

  function setShape(shape) {
    dispatch({ type: 'SET_SHAPE', shape });
  }

  const dims = state.dimensions;
  const hasArea = dims.area > 0;

  return (
    <div className="fade-in">
      <div className="section-title">{isWall ? 'Wall Size' : 'Dimensions'}</div>
      <div className="section-subtitle">
        {isWall
          ? 'Enter the length and height of your retaining wall.'
          : 'Enter the shape and dimensions of your project area.'}
      </div>

      <div className="field-group">
        {/* Project name */}
        <div className="field">
          <div className="field-label">Project Name</div>
          <input
            className="field-input"
            value={state.projectName}
            onChange={e => dispatch({ type: 'SET_PROJECT_NAME', name: e.target.value })}
            placeholder="e.g. Backyard Patio"
          />
        </div>

        {!isWall && (
          <div className="field">
            <div className="field-label">Shape</div>
            <div className="shape-selector">
              {[
                { key: 'rectangle', label: 'Rectangle' },
                { key: 'circle', label: 'Circle' },
                { key: 'custom', label: 'Custom Area' },
              ].map(s => (
                <button
                  key={s.key}
                  className={`shape-btn${state.shape === s.key ? ' active' : ''}`}
                  onClick={() => setShape(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {state.shape === 'rectangle' && !isWall && (
          <div className="field-row">
            <div className="field">
              <div className="field-label">Width</div>
              <div className="field-suffix">
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  step="0.5"
                  value={state.width}
                  onChange={e => set('width', e.target.value)}
                  placeholder="0"
                />
                <span className="field-suffix-label">ft</span>
              </div>
            </div>
            <div className="field">
              <div className="field-label">Length</div>
              <div className="field-suffix">
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  step="0.5"
                  value={state.length}
                  onChange={e => set('length', e.target.value)}
                  placeholder="0"
                />
                <span className="field-suffix-label">ft</span>
              </div>
            </div>
          </div>
        )}

        {state.shape === 'circle' && !isWall && (
          <div className="field">
            <div className="field-label">Radius</div>
            <div className="field-suffix">
              <input
                className="field-input"
                type="number"
                min="0"
                step="0.5"
                value={state.radius}
                onChange={e => set('radius', e.target.value)}
                placeholder="0"
              />
              <span className="field-suffix-label">ft</span>
            </div>
            <div className="field-hint">Diameter = {((parseFloat(state.radius) || 0) * 2).toFixed(1)} ft</div>
          </div>
        )}

        {state.shape === 'custom' && !isWall && (
          <div className="field">
            <div className="field-label">Total Area</div>
            <div className="field-suffix">
              <input
                className="field-input"
                type="number"
                min="0"
                step="1"
                value={state.width}
                onChange={e => set('width', e.target.value)}
                placeholder="0"
              />
              <span className="field-suffix-label">sq ft</span>
            </div>
            <div className="field-hint">Also enter a perimeter length for edging calculations.</div>
          </div>
        )}

        {isWall && (
          <>
            <div className="field-row">
              <div className="field">
                <div className="field-label">Wall Length</div>
                <div className="field-suffix">
                  <input
                    className="field-input"
                    type="number"
                    min="0"
                    step="0.5"
                    value={state.width}
                    onChange={e => set('width', e.target.value)}
                    placeholder="0"
                  />
                  <span className="field-suffix-label">ft</span>
                </div>
              </div>
              <div className="field">
                <div className="field-label">Wall Height</div>
                <div className="field-suffix">
                  <input
                    className="field-input"
                    type="number"
                    min="0"
                    step="0.5"
                    value={state.length}
                    onChange={e => set('length', e.target.value)}
                    placeholder="0"
                  />
                  <span className="field-suffix-label">ft</span>
                </div>
              </div>
            </div>
          </>
        )}

        {hasArea && (
          <div className="computed-area">
            <span className="computed-area-label">
              {isWall ? 'Face Area' : 'Project Area'}
            </span>
            <span className="computed-area-value">
              {dims.area.toFixed(1)} sq ft
              {!isWall && state.shape !== 'custom' && (
                <span style={{ fontSize: 13, fontWeight: 500, opacity: .7, marginLeft: 8 }}>
                  · {dims.perimeter.toFixed(1)} lf perimeter
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
