import * as LucideIcons from 'lucide-react-native';
import { Tag } from 'lucide-react-native';

// The backend's Category.icon field mostly stores real lucide icon slugs
// (e.g. "smartphone", "car", "graduation-cap"). A few custom subcategories
// (Hens, Aseel, Fancy, Misri, Livestokes, Animals) store their own display
// name instead, since they don't map to a real icon - those fall back below.
const MANUAL_OVERRIDES = {
  home: 'House', // lucide renamed Home -> House; keep old data working
  hens: 'PawPrint',
  aseel: 'PawPrint',
  fancy: 'PawPrint',
  misri: 'PawPrint',
  livestokes: 'PawPrint',
  animals: 'PawPrint',
};

function toPascalCase(slug) {
  return slug
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

// A friendly, varied palette so category icons don't all look the same
// (OLX-style colorful category tiles rather than one flat brand color).
const PALETTE = [
  '#0f766e', // teal
  '#ea580c', // orange
  '#2563eb', // blue
  '#c026d3', // fuchsia
  '#16a34a', // green
  '#d97706', // amber
  '#dc2626', // red
  '#7c3aed', // violet
  '#0891b2', // cyan
  '#db2777', // pink
];

// Simple deterministic hash so the same category always gets the same color.
function colorForKey(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

// Returns { Icon, color } for a category. `iconSlug` is the raw string from
// the backend (category.icon); `key` (e.g. category._id or name) drives the
// color so it stays stable across renders.
export function getCategoryVisual(iconSlug, key = '') {
  const normalized = (iconSlug || '').toLowerCase().trim();
  const override = MANUAL_OVERRIDES[normalized];
  const pascalName = override || toPascalCase(normalized);
  const Icon = LucideIcons[pascalName] || Tag;
  const color = colorForKey(key || normalized || 'default');
  return { Icon, color };
}
