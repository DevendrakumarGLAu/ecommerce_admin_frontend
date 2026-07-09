import { Injectable, effect, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'fb_admin_theme';

/**
 * Light/dark theme toggle, persisted in localStorage.
 *
 * Sets `data-bs-theme` on <html> — the same attribute Bootstrap 5.3/AdminLTE
 * use for their own dark-mode CSS, and the selector our Angular Material
 * theme (`_theme.scss`) is scoped under, so one attribute drives both.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly modeSignal = signal<ThemeMode>(this.resolveInitialMode());
  readonly mode = this.modeSignal.asReadonly();

  constructor() {
    effect(() => {
      const mode = this.modeSignal();
      document.documentElement.setAttribute('data-bs-theme', mode);
      localStorage.setItem(STORAGE_KEY, mode);
    });
  }

  toggle(): void {
    this.modeSignal.update((mode) => (mode === 'light' ? 'dark' : 'light'));
  }

  setMode(mode: ThemeMode): void {
    this.modeSignal.set(mode);
  }

  private resolveInitialMode(): ThemeMode {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
