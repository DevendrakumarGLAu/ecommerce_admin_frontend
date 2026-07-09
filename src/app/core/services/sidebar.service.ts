import { Injectable, effect, signal } from '@angular/core';

const STORAGE_KEY = 'fb_admin_sidebar_collapsed';
const MOBILE_BREAKPOINT_PX = 991.98;

/**
 * Drives the AdminLTE sidebar's collapse/expand/mobile-drawer behavior by
 * toggling `sidebar-collapse`/`sidebar-open` on <body> — the same classes
 * AdminLTE's own PushMenu widget uses, reimplemented natively here so it
 * plays correctly with Angular's rendering lifecycle (loading admin-lte.js
 * as a global script would race Angular's own DOM updates on first paint).
 *
 * A single `collapsed` boolean drives both behaviors: on desktop, true means
 * the mini icon-only sidebar; on mobile (<992px), true means fully hidden and
 * false means the overlay drawer is open.
 */
@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly collapsedSignal = signal(this.resolveInitialState());
  readonly collapsed = this.collapsedSignal.asReadonly();

  constructor() {
    // sidebar-mini: collapsing shows an icon-only rail (that expands on hover)
    // instead of hiding the sidebar entirely.
    document.body.classList.add('sidebar-expand-lg', 'sidebar-mini', 'layout-fixed', 'fixed-header');

    effect(() => {
      const isCollapsed = this.collapsedSignal();
      document.body.classList.toggle('sidebar-collapse', isCollapsed);
      document.body.classList.toggle('sidebar-open', !isCollapsed && this.isMobileSize());
    });
  }

  toggle(): void {
    this.setCollapsed(!this.collapsedSignal());
  }

  close(): void {
    this.setCollapsed(true);
  }

  private setCollapsed(value: boolean): void {
    this.collapsedSignal.set(value);
    if (!this.isMobileSize()) {
      localStorage.setItem(STORAGE_KEY, String(value));
    }
  }

  private isMobileSize(): boolean {
    return window.innerWidth <= MOBILE_BREAKPOINT_PX;
  }

  private resolveInitialState(): boolean {
    if (typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT_PX) {
      return true;
    }
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }
}
