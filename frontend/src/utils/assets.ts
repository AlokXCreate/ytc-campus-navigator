/// <reference types="vite/client" />

/**
 * Utility to resolve asset URLs correctly across local development,
 * Docker containers, GitHub Pages (with sub-path routing), and
 * native Android Capacitor WebView environments.
 */
export function getAssetUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `./${cleanPath}`;
}
