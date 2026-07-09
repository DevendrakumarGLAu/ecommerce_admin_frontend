import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';

import { ConfirmDialogComponent, ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog.component';

/** Convenience wrapper around MatDialog for the app's confirm/delete dialog. */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialog = inject(MatDialog);

  /** Opens a generic yes/no confirmation dialog. Resolves `true` only if the user confirmed. */
  confirm(data: ConfirmDialogData): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialogComponent, { data, width: '420px', autoFocus: 'dialog' })
      .afterClosed()
      .pipe(map((result) => result === true));
  }

  /** Preconfigured danger-toned confirmation for destructive actions. */
  confirmDelete(entityLabel: string): Observable<boolean> {
    return this.confirm({
      title: `Delete ${entityLabel}?`,
      message: `This will permanently delete ${entityLabel}. This action cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger'
    });
  }
}
