import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { PROJECT_TYPES } from '../../utils/calculations';

export default function StepProjectType() {
  const { state, dispatch } = useProject();

  function select(key) {
    dispatch({ type: 'SET_PROJECT_TYPE', projectType: key });
  }

  return (
    <div className="fade-in">
      <div className="section-title">Project Type</div>
      <div className="section-subtitle">What are you building? We'll load the right material stack automatically.</div>

      <div className="type-grid">
        {Object.entries(PROJECT_TYPES).map(([key, cfg]) => (
          <button
            key={key}
            className={`type-card${state.projectType === key ? ' selected' : ''}`}
            onClick={() => select(key)}
          >
            <div className="type-card-emoji">{cfg.emoji}</div>
            <div className="type-card-name">{cfg.name}</div>
            <div className="type-card-desc">{cfg.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
