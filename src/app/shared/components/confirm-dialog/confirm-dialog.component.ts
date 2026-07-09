import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
}

/** Generic yes/no confirmation dialog. Use `DialogService.confirm()`/`confirmDelete()` to open it. */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="confirm-dialog" [class.confirm-dialog--danger]="data.tone === 'danger'">
      <mat-icon class="confirm-dialog__icon">
        {{ data.tone === 'danger' ? 'warning' : 'help_outline' }}
      </mat-icon>
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>{{ data.message }}</mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close(false)">
          {{ data.cancelLabel ?? 'Cancel' }}
        </button>
        <button
          mat-flat-button
          type="button"
          [color]="data.tone === 'danger' ? 'warn' : 'primary'"
          (click)="dialogRef.close(true)"
        >
          {{ data.confirmLabel ?? 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: `
    .confirm-dialog {
      display: flex;
      flex-direction: column;
      min-width: 320px;
    }

    .confirm-dialog__icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--mat-sys-primary);
      margin-bottom: 0.25rem;
    }

    .confirm-dialog--danger .confirm-dialog__icon {
      color: var(--mat-sys-error);
    }

    h2[mat-dialog-title] {
      margin: 0 0 0.25rem;
    }
  `
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent, boolean>);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
