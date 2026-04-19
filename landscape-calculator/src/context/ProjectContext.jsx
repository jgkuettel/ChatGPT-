import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { PROJECT_TYPES, computeDimensions, calculateMaterials } from '../utils/calculations';
import PRODUCTS from '../data/products';

const STORAGE_KEY = 'lmc_project_v1';

const defaultLayers = (projectType) => {
  const cfg = PROJECT_TYPES[projectType];
  if (!cfg) return [];

  const layers = [
    { role: 'surface', product: null, depth: cfg.defaultSurfaceDepth ?? null },
  ];

  if (cfg.defaultSandDepth > 0) {
    const defaultSand = PRODUCTS.find(p => p.id === 'bedding-sand');
    layers.push({ role: 'sand', product: defaultSand ?? null, depth: cfg.defaultSandDepth });
  }

  if (cfg.defaultBaseDepth > 0) {
    const defaultBase = PRODUCTS.find(p => p.id === 'class-2-base');
    layers.push({ role: 'base', product: defaultBase ?? null, depth: cfg.defaultBaseDepth });
  }

  if (cfg.hasPolyJoints) {
    const defaultPoly = PRODUCTS.find(p => p.id === 'poly-sand-tan');
    layers.push({ role: 'joints', product: defaultPoly ?? null });
  }

  if (cfg.hasEdging) {
    const defaultEdging = PRODUCTS.find(p => p.id === 'steel-edging-4in');
    layers.push({ role: 'edging', product: defaultEdging ?? null });
  }

  if (cfg.hasFabric) {
    const defaultFabric = PRODUCTS.find(p => p.id === 'fabric-3oz-woven');
    layers.push({ role: 'fabric', product: defaultFabric ?? null });
  }

  if (projectType === 'retaining_wall') {
    const defaultDrain = PRODUCTS.find(p => p.id === 'drain-rock-1in');
    layers.push({ role: 'drain', product: defaultDrain ?? null });
    layers.push({ role: 'wall_block', product: null });
  }

  return layers;
};

const initialState = {
  wizardStep: 0,
  projectType: null,
  projectName: 'My Project',
  shape: 'rectangle',
  width: '',
  length: '',
  radius: '',
  dimensions: { area: 0, perimeter: 0, displayW: 0, displayL: 0 },
  layers: [],
  options: { wastePercent: 5, pattern: 'running_bond' },
  materials: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, wizardStep: action.step };

    case 'SET_PROJECT_TYPE': {
      const layers = defaultLayers(action.projectType);
      return {
        ...state,
        projectType: action.projectType,
        layers,
        wizardStep: 1,
      };
    }

    case 'SET_PROJECT_NAME':
      return { ...state, projectName: action.name };

    case 'SET_SHAPE':
      return { ...state, shape: action.shape, width: '', length: '', radius: '' };

    case 'SET_DIMENSION': {
      const next = { ...state, [action.field]: action.value };
      const dims = computeDimensions(
        next.shape,
        parseFloat(next.width) || 0,
        parseFloat(next.length) || 0,
        parseFloat(next.radius) || 0
      );
      const materials = calculateMaterials({ ...next, dimensions: dims });
      return { ...next, dimensions: dims, materials };
    }

    case 'SET_LAYER_PRODUCT': {
      const layers = state.layers.map(l =>
        l.role === action.role ? { ...l, product: action.product } : l
      );
      const materials = calculateMaterials({ ...state, layers });
      return { ...state, layers, materials };
    }

    case 'SET_LAYER_DEPTH': {
      const layers = state.layers.map(l =>
        l.role === action.role ? { ...l, depth: action.depth } : l
      );
      const materials = calculateMaterials({ ...state, layers });
      return { ...state, layers, materials };
    }

    case 'TOGGLE_LAYER': {
      let layers;
      const exists = state.layers.find(l => l.role === action.role);
      if (exists) {
        layers = state.layers.filter(l => l.role !== action.role);
      } else {
        layers = [...state.layers, { role: action.role, product: null, depth: action.defaultDepth }];
      }
      const materials = calculateMaterials({ ...state, layers });
      return { ...state, layers, materials };
    }

    case 'SET_OPTION': {
      const options = { ...state.options, [action.key]: action.value };
      const materials = calculateMaterials({ ...state, options });
      return { ...state, options, materials };
    }

    case 'LOAD_STATE':
      return { ...action.state };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist to localStorage for cross-window sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // ignore
    }
  }, [state]);

  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}

export { STORAGE_KEY };
