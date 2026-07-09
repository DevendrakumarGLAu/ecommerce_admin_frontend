import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export type NotificationKind = 'success' | 'error' | 'warning' | 'info';

const DURATIONS_MS: Record<NotificationKind, number> = {
  success: 3500,
  info: 3500,
  warning: 5000,
  error: 6000
};

/** Thin wrapper around MatSnackBar giving the four toast kinds a consistent style. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  private show(message: string, kind: NotificationKind): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: DURATIONS_MS[kind],
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${kind}`]
    });
  }
}
