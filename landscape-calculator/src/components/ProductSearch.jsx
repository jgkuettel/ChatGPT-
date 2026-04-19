import React, { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import PRODUCTS from '../data/products';

export default function ProductSearch({ value, onChange, filterCategory, filterRole, placeholder }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const filtered = useMemo(() => {
    let pool = PRODUCTS;
    if (filterCategory) {
      pool = pool.filter(p => p.category === filterCategory);
    }
    if (filterRole) {
      pool = pool.filter(p => p.layerRole === filterRole || p.applicableTo?.includes('all'));
    }
    return pool;
  }, [filterCategory, filterRole]);

  const fuse = useMemo(() => new Fuse(filtered, {
    keys: ['name', 'category', 'subcategory', 'description', 'colorName'],
    threshold: 0.4,
    includeScore: true,
  }), [filtered]);

  const results = useMemo(() => {
    if (!query.trim()) return filtered.slice(0, 12);
    return fuse.search(query).slice(0, 12).map(r => r.item);
  }, [query, fuse, filtered]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(product) {
    onChange(product);
    setOpen(false);
    setQuery('');
  }

  function handleFocus() {
    setFocused(true);
    setOpen(true);
  }

  function handleBlur() {
    setFocused(false);
  }

  function handleChange(e) {
    setQuery(e.target.value);
    setOpen(true);
  }

  function clear() {
    onChange(null);
    setQuery('');
    inputRef.current?.focus();
  }

  function formatUnit(p) {
    const units = { sqft: '/ sq ft', ton: '/ ton', yard: '/ cu yd', lf: '/ lf', bag: '/ bag', each: '/ each' };
    return units[p.unit] || `/ ${p.unit}`;
  }

  return (
    <div className="search-wrapper">
      {value && !open ? (
        <div className="selected-product-badge">
          <div
            className="selected-product-swatch"
            style={{ background: value.color }}
          />
          <span className="selected-product-name">{value.name}</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-3)', marginRight: 8 }}>
            ${value.price.toFixed(2)} {formatUnit(value)}
          </span>
          <button className="selected-product-change" onClick={() => { onChange(null); setOpen(true); }}>
            Change
          </button>
        </div>
      ) : (
        <div className="search-input-row">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            className="search-input"
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder ?? 'Search products…'}
            autoComplete="off"
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')}>✕</button>
          )}
        </div>
      )}

      {open && (
        <div className="search-dropdown" ref={dropdownRef}>
          {results.length === 0 ? (
            <div style={{ padding: '16px', color: 'var(--color-text-3)', fontSize: 13, textAlign: 'center' }}>
              No products found
            </div>
          ) : (
            results.map(p => (
              <div
                key={p.id}
                className={`search-result${value?.id === p.id ? ' selected' : ''}`}
                onMouseDown={() => handleSelect(p)}
              >
                <div className="search-result-swatch" style={{ background: p.color }} />
                <div className="search-result-info">
                  <div className="search-result-name">{p.name}</div>
                  <div className="search-result-meta">{p.subcategory} · {p.colorName}</div>
                </div>
                <div className="search-result-price">
                  ${p.price.toFixed(2)}<br />
                  <span style={{ fontSize: 10, fontWeight: 400 }}>{formatUnit(p)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
