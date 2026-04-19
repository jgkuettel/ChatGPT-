import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { buildCrossSectionLayers } from '../utils/calculations';
import StepProjectType from './wizard/StepProjectType';
import StepDimensions from './wizard/StepDimensions';
import StepMaterials from './wizard/StepMaterials';
import StepReview from './wizard/StepReview';
import CrossSectionDiagram from './diagrams/CrossSectionDiagram';
import TopDownLayout from './diagrams/TopDownLayout';
import MaterialsList from './MaterialsList';

const STEPS = [
  { label: 'Type',       component: StepProjectType },
  { label: 'Size',       component: StepDimensions  },
  { label: 'Materials',  component: StepMaterials   },
  { label: 'Review',     component: StepReview      },
];

export default function StaffView() {
  const { state, dispatch } = useProject();
  const [previewTab, setPreviewTab] = useState('cross');

  const step = state.wizardStep;
  const StepComponent = STEPS[step]?.component ?? StepProjectType;

  function goTo(s) {
    if (s < step || (s > 0 && state.projectType) || (s > 1 && state.dimensions.area > 0)) {
      dispatch({ type: 'SET_STEP', step: s });
    }
  }

  function next() {
    if (step < STEPS.length - 1) dispatch({ type: 'SET_STEP', step: step + 1 });
  }

  function back() {
    if (step > 0) dispatch({ type: 'SET_STEP', step: step - 1 });
  }

  function canNext() {
    if (step === 0) return !!state.projectType;
    if (step === 1) return state.dimensions.area > 0;
    return true;
  }

  function openCustomerDisplay() {
    window.open('?view=customer', 'LMC_Customer',
      'width=1280,height=800,toolbar=0,menubar=0,location=0');
  }

  const crossLayers = buildCrossSectionLayers(state, state.materials);

  return (
    <div className="staff-shell">
      {/* ── Header ── */}
      <header className="staff-header">
        <div className="staff-header-logo">
          <div className="logo-icon">🌿</div>
          Landscape Materials Calculator
        </div>

        {state.projectType && (
          <span
            className="badge badge-green"
            style={{ marginLeft: 8 }}
          >
            {state.projectName || 'My Project'}
          </span>
        )}

        <div className="staff-header-spacer" />

        <button className="btn btn-secondary btn-sm" onClick={() => dispatch({ type: 'RESET' })}>
          New Project
        </button>
        <button className="btn btn-display btn-sm" onClick={openCustomerDisplay}>
          <span>📺</span> Customer Display
        </button>
      </header>

      {/* ── Body ── */}
      <div className="staff-body">
        {/* ── Wizard Panel ── */}
        <aside className="wizard-panel">
          {/* Stepper */}
          <div className="wizard-stepper">
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <div className="wizard-step-wrapper">
                  <button
                    className={`wizard-step-dot${i === step ? ' active' : i < step ? ' done' : ''}`}
                    onClick={() => goTo(i)}
                    style={{ cursor: i <= step || state.projectType ? 'pointer' : 'default' }}
                  >
                    {i < step ? '✓' : i + 1}
                  </button>
                  <div className={`wizard-step-label${i === step ? ' active' : ''}`}>
                    {s.label}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`wizard-step-line${i < step ? ' done' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step content */}
          <div className="wizard-content scroll" key={step}>
            <StepComponent />
          </div>

          {/* Footer nav */}
          <div className="wizard-footer">
            {step > 0 && (
              <button className="btn btn-ghost" onClick={back}>← Back</button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={next}
                disabled={!canNext()}
                style={{ opacity: canNext() ? 1 : .4 }}
              >
                Continue →
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => window.print()}>
                🖨️ Print Quote
              </button>
            )}
          </div>
        </aside>

        {/* ── Preview Panel ── */}
        <main className="preview-panel">
          <div className="preview-tabs">
            {[
              { key: 'cross',   label: '📐 Cross-Section' },
              { key: 'topdown', label: '🗺️ Top-Down View'  },
              { key: 'list',    label: '📋 Materials'      },
            ].map(t => (
              <button
                key={t.key}
                className={`preview-tab${previewTab === t.key ? ' active' : ''}`}
                onClick={() => setPreviewTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="preview-body scroll">
            {previewTab === 'cross' && (
              <>
                <div className="diagram-card fade-in">
                  <div className="diagram-card-title">Cross-Section View</div>
                  <CrossSectionDiagram layers={crossLayers} />
                </div>
                <MaterialsList materials={state.materials} compact />
              </>
            )}

            {previewTab === 'topdown' && (
              <div className="diagram-card fade-in">
                <div className="diagram-card-title">Top-Down Layout</div>
                <TopDownLayout
                  dimensions={state.dimensions}
                  surface={state.layers?.find(l => l.role === 'surface')}
                  edging={state.layers?.find(l => l.role === 'edging')}
                  pattern={state.options.pattern}
                />
              </div>
            )}

            {previewTab === 'list' && (
              <div className="fade-in">
                <MaterialsList materials={state.materials} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
