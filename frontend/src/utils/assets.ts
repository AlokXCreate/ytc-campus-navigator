/// <reference types="vite/client" />

/**
 * Utility to resolve asset URLs correctly across local development,
 * Docker containers, and GitHub Pages (with sub-path routing).
 */
export function getAssetUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const base: string = (import.meta as any).env?.BASE_URL || '/ytc-campus-navigator/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
}
