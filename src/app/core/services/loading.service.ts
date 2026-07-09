import { Injectable, computed, signal } from '@angular/core';

/**
 * Tracks the number of in-flight HTTP requests (incremented/decremented by
 * `loading.interceptor.ts`) so a single top-level progress bar can reflect
 * "something is loading" without every component managing its own flag.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly pendingRequests = signal(0);
  readonly isLoading = computed(() => this.pendingRequests() > 0);

  start(): void {
    this.pendingRequests.update((count) => count + 1);
  }

  stop(): void {
    this.pendingRequests.update((count) => Math.max(0, count - 1));
  }
}
