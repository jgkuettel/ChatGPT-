export const PROJECT_TYPES = {
  paver_patio: {
    name: 'Paver Patio',
    description: 'Outdoor paved seating or entertainment area',
    emoji: '⬛',
    dimensionType: 'area',
    defaultBaseDepth: 4,
    defaultSandDepth: 1,
    hasEdging: true,
    hasPolyJoints: true,
    hasFabric: false,
    surfaceCategories: ['Pavers & Stone'],
  },
  walkway: {
    name: 'Walkway / Path',
    description: 'Paved or natural-surface pedestrian path',
    emoji: '⬜',
    dimensionType: 'area',
    defaultBaseDepth: 4,
    defaultSandDepth: 1,
    hasEdging: true,
    hasPolyJoints: true,
    hasFabric: true,
    surfaceCategories: ['Pavers & Stone', 'Sand & Aggregates', 'Mulch & Organic'],
  },
  driveway: {
    name: 'Driveway',
    description: 'Vehicle-rated paved surface',
    emoji: '🚗',
    dimensionType: 'area',
    defaultBaseDepth: 6,
    defaultSandDepth: 1,
    hasEdging: true,
    hasPolyJoints: true,
    hasFabric: false,
    surfaceCategories: ['Pavers & Stone'],
  },
  garden_bed: {
    name: 'Garden Bed',
    description: 'Planting area with mulch or decorative rock topping',
    emoji: '🌱',
    dimensionType: 'area',
    defaultBaseDepth: 0,
    defaultSandDepth: 0,
    hasEdging: true,
    hasPolyJoints: false,
    hasFabric: true,
    surfaceCategories: ['Mulch & Organic', 'Decorative Rock', 'Soil & Amendments'],
    defaultSurfaceDepth: 3,
  },
  rock_garden: {
    name: 'Rock / Gravel Area',
    description: 'Decorative rock or gravel landscape feature',
    emoji: '🪨',
    dimensionType: 'area',
    defaultBaseDepth: 0,
    defaultSandDepth: 0,
    hasEdging: true,
    hasPolyJoints: false,
    hasFabric: true,
    surfaceCategories: ['Decorative Rock', 'Sand & Aggregates'],
    defaultSurfaceDepth: 3,
  },
  decomposed_granite: {
    name: 'Decomposed Granite',
    description: 'Compacted DG surface for paths, patios, or xeriscaping',
    emoji: '🟤',
    dimensionType: 'area',
    defaultBaseDepth: 3,
    defaultSandDepth: 0,
    hasEdging: true,
    hasPolyJoints: false,
    hasFabric: true,
    surfaceCategories: ['Sand & Aggregates'],
    defaultSurfaceDepth: 3,
  },
  retaining_wall: {
    name: 'Retaining Wall',
    description: 'Structural wall for grade transitions',
    emoji: '🧱',
    dimensionType: 'wall',
    defaultBaseDepth: 6,
    hasEdging: false,
    hasPolyJoints: false,
    hasFabric: true,
    surfaceCategories: ['Wall Block & Boulders'],
  },
};

function roundUpToNearest(value, nearest) {
  return Math.ceil(value / nearest) * nearest;
}

function cft(depthInches, areasqft) {
  return (depthInches / 12) * areasqft;
}

function cubicYards(cubicFeet) {
  return cubicFeet / 27;
}

export function computeDimensions(shape, w, l, r) {
  if (shape === 'circle') {
    const radius = r || 0;
    return {
      area: Math.PI * radius * radius,
      perimeter: 2 * Math.PI * radius,
      displayW: radius * 2,
      displayL: radius * 2,
    };
  }
  const width = w || 0;
  const length = l || 0;
  return {
    area: width * length,
    perimeter: 2 * (width + length),
    displayW: width,
    displayL: length,
  };
}

export function calculateMaterials(project) {
  const { projectType, dimensions, layers, options } = project;
  if (!projectType || !dimensions || dimensions.area <= 0) return [];

  const typeConfig = PROJECT_TYPES[projectType];
  const area = dimensions.area;
  const perimeter = dimensions.perimeter;
  const results = [];

  // Surface layer
  const surfaceLayer = layers.find(l => l.role === 'surface');
  if (surfaceLayer?.product) {
    const p = surfaceLayer.product;
    const wastePct = options?.wastePercent ?? 5;
    const wasteFactor = 1 + wastePct / 100;

    if (p.unit === 'sqft') {
      const raw = area * wasteFactor;
      const qty = Math.ceil(raw);
      results.push({
        id: 'surface',
        role: 'surface',
        label: 'Surface Material',
        product: p,
        rawQty: raw,
        qty,
        unit: 'sq ft',
        pricePerUnit: p.price,
        subtotal: qty * p.price,
        note: `${area.toFixed(1)} sq ft + ${wastePct}% waste`,
      });
    } else if (p.unit === 'ton') {
      const depth = surfaceLayer.depth ?? typeConfig.defaultSurfaceDepth ?? 3;
      const cf = cft(depth, area);
      const cy = cubicYards(cf);
      const tons = cy * (p.density ?? 1.40);
      const qty = roundUpToNearest(tons, 0.5);
      results.push({
        id: 'surface',
        role: 'surface',
        label: 'Surface Material',
        product: p,
        rawQty: tons,
        qty,
        unit: 'tons',
        depth,
        pricePerUnit: p.price,
        subtotal: qty * p.price,
        note: `${depth}" depth × ${area.toFixed(0)} sq ft = ${cy.toFixed(2)} cy`,
      });
    } else if (p.unit === 'yard') {
      const depth = surfaceLayer.depth ?? typeConfig.defaultSurfaceDepth ?? 3;
      const cf = cft(depth, area);
      const cy = cubicYards(cf);
      const qty = roundUpToNearest(cy, 0.5);
      results.push({
        id: 'surface',
        role: 'surface',
        label: 'Surface Material',
        product: p,
        rawQty: cy,
        qty,
        unit: 'cu yds',
        depth,
        pricePerUnit: p.price,
        subtotal: qty * p.price,
        note: `${depth}" depth × ${area.toFixed(0)} sq ft`,
      });
    }
  }

  // Bedding sand layer
  const sandLayer = layers.find(l => l.role === 'sand');
  if (sandLayer?.product && sandLayer.depth > 0) {
    const p = sandLayer.product;
    const depth = sandLayer.depth;
    const cf = cft(depth, area);
    const cy = cubicYards(cf);
    const tons = cy * (p.density ?? 1.35);
    const qty = roundUpToNearest(tons, 0.5);
    results.push({
      id: 'sand',
      role: 'sand',
      label: `Bedding Sand (${depth}")`,
      product: p,
      rawQty: tons,
      qty,
      unit: 'tons',
      depth,
      pricePerUnit: p.price,
      subtotal: qty * p.price,
      note: `${depth}" depth, ${cy.toFixed(2)} cy`,
    });
  }

  // Base aggregate layer
  const baseLayer = layers.find(l => l.role === 'base');
  if (baseLayer?.product && baseLayer.depth > 0) {
    const p = baseLayer.product;
    const depth = baseLayer.depth;
    const cf = cft(depth, area);
    const cy = cubicYards(cf);
    const tons = cy * (p.density ?? 1.50);
    const qty = roundUpToNearest(tons, 0.5);
    results.push({
      id: 'base',
      role: 'base',
      label: `Compactible Base (${depth}")`,
      product: p,
      rawQty: tons,
      qty,
      unit: 'tons',
      depth,
      pricePerUnit: p.price,
      subtotal: qty * p.price,
      note: `${depth}" depth, ${cy.toFixed(2)} cy`,
    });
  }

  // Drain rock (retaining wall)
  const drainLayer = layers.find(l => l.role === 'drain');
  if (drainLayer?.product) {
    const p = drainLayer.product;
    const wallLength = dimensions.displayW || 0;
    const wallHeight = dimensions.displayL || 0;
    const cf = wallLength * wallHeight * 0.5 * (1 / 3);
    const cy = cubicYards(cf);
    const tons = cy * (p.density ?? 1.35);
    const qty = roundUpToNearest(tons, 0.5);
    results.push({
      id: 'drain',
      role: 'drain',
      label: 'Drainage Rock (backfill)',
      product: p,
      rawQty: tons,
      qty,
      unit: 'tons',
      pricePerUnit: p.price,
      subtotal: qty * p.price,
      note: 'Estimated behind-wall drainage backfill',
    });
  }

  // Wall blocks
  const wallLayer = layers.find(l => l.role === 'wall_block');
  if (wallLayer?.product) {
    const p = wallLayer.product;
    const wallLength = dimensions.displayW || 0;
    const wallHeight = dimensions.displayL || 0;
    const faceSqFt = wallLength * wallHeight;

    if (p.unit === 'each' && p.sqftPerBlock) {
      const raw = faceSqFt / p.sqftPerBlock;
      const qty = Math.ceil(raw * 1.05);
      results.push({
        id: 'wall_block',
        role: 'wall_block',
        label: 'Wall Blocks',
        product: p,
        rawQty: raw,
        qty,
        unit: 'blocks',
        pricePerUnit: p.price,
        subtotal: qty * p.price,
        note: `${faceSqFt.toFixed(0)} sq ft face area + 5% waste`,
      });
    } else if (p.unit === 'ton' && p.sqftPerTon) {
      const raw = faceSqFt / p.sqftPerTon;
      const qty = roundUpToNearest(raw, 0.5);
      results.push({
        id: 'wall_block',
        role: 'wall_block',
        label: 'Wall Stone',
        product: p,
        rawQty: raw,
        qty,
        unit: 'tons',
        pricePerUnit: p.price,
        subtotal: qty * p.price,
        note: `${faceSqFt.toFixed(0)} sq ft face, ~${p.sqftPerTon} sqft/ton`,
      });
    }
  }

  // Polymeric joint sand
  const jointsLayer = layers.find(l => l.role === 'joints');
  if (jointsLayer?.product) {
    const p = jointsLayer.product;
    const coverage = p.coveragePerUnit ?? 55;
    const raw = area / coverage;
    const qty = Math.ceil(raw);
    results.push({
      id: 'joints',
      role: 'joints',
      label: 'Polymeric Joint Sand',
      product: p,
      rawQty: raw,
      qty,
      unit: 'bags',
      pricePerUnit: p.price,
      subtotal: qty * p.price,
      note: `1 bag per ~${coverage} sq ft`,
    });
  }

  // Edging
  const edgingLayer = layers.find(l => l.role === 'edging');
  if (edgingLayer?.product) {
    const p = edgingLayer.product;
    const lf = edgingLayer.linearFeet ?? perimeter;
    const qty = Math.ceil(lf);
    results.push({
      id: 'edging',
      role: 'edging',
      label: 'Edging',
      product: p,
      rawQty: lf,
      qty,
      unit: 'lf',
      pricePerUnit: p.price,
      subtotal: qty * p.price,
      note: `${perimeter.toFixed(1)} lf perimeter`,
    });
  }

  // Landscape fabric
  const fabricLayer = layers.find(l => l.role === 'fabric');
  if (fabricLayer?.product) {
    const p = fabricLayer.product;
    const fabricArea = area * 1.10; // 10% overlap
    const raw = fabricArea;
    const qty = Math.ceil(raw);
    results.push({
      id: 'fabric',
      role: 'fabric',
      label: 'Landscape Fabric',
      product: p,
      rawQty: raw,
      qty,
      unit: 'sq ft',
      pricePerUnit: p.price,
      subtotal: qty * p.price,
      note: `${area.toFixed(0)} sq ft + 10% overlap`,
    });
  }

  return results;
}

export function buildCrossSectionLayers(project, materials) {
  const { projectType } = project;
  const layers = [];

  const surface = materials.find(m => m.role === 'surface');
  if (surface?.product) {
    const p = surface.product;
    const thickness = p.thickness ?? 2.375;
    layers.push({
      label: p.name,
      sublabel: surface.role === 'surface' ? formatQty(surface.qty, surface.unit) : '',
      depth: thickness,
      color: p.color,
      pattern: 'pavers',
      role: 'surface',
    });
  }

  const sand = materials.find(m => m.role === 'sand');
  if (sand) {
    layers.push({
      label: sand.product.name,
      sublabel: formatQty(sand.qty, sand.unit),
      depth: sand.depth ?? 1,
      color: sand.product.color,
      pattern: 'sand',
      role: 'sand',
    });
  }

  const base = materials.find(m => m.role === 'base');
  if (base) {
    layers.push({
      label: base.product.name,
      sublabel: formatQty(base.qty, base.unit),
      depth: base.depth ?? 4,
      color: base.product.color,
      pattern: 'gravel',
      role: 'base',
    });
  }

  if (projectType === 'retaining_wall') {
    const drain = materials.find(m => m.role === 'drain');
    if (drain) {
      layers.push({
        label: drain.product.name,
        sublabel: formatQty(drain.qty, drain.unit),
        depth: 4,
        color: drain.product.color,
        pattern: 'gravel',
        role: 'drain',
      });
    }
  }

  // Always include native subgrade
  layers.push({
    label: 'Compacted Subgrade',
    sublabel: 'Native soil',
    depth: 4,
    color: '#8B7355',
    pattern: 'soil',
    role: 'subgrade',
  });

  return layers;
}

export function formatQty(qty, unit) {
  if (!qty) return '';
  return `${qty.toLocaleString()} ${unit}`;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function totalCost(materials) {
  return materials.reduce((sum, m) => sum + (m.subtotal ?? 0), 0);
}
