import { ChangeDetectionStrategy, Component, OnDestroy, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

/** Debounced search input; emits `search` only after the user pauses typing. */
@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="search-box">
      <mat-icon>search</mat-icon>
      <input
        type="text"
        [formControl]="control"
        [placeholder]="placeholder()"
        [attr.aria-label]="placeholder()"
      />
      @if (control.value) {
        <button type="button" class="search-box__clear" aria-label="Clear search" (click)="clear()">
          <mat-icon>close</mat-icon>
        </button>
      }
    </label>
  `,
  styles: `
    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      border: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface-container-lowest);
      min-width: 220px;

      mat-icon {
        color: var(--mat-sys-on-surface-variant);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      input {
        border: none;
        outline: none;
        background: transparent;
        color: var(--mat-sys-on-surface);
        flex: 1;
        font: inherit;
      }
    }

    .search-box__clear {
      display: flex;
      border: none;
      background: none;
      cursor: pointer;
      padding: 0;
      color: var(--mat-sys-on-surface-variant);
    }
  `
})
export class SearchBoxComponent implements OnDestroy {
  readonly placeholder = input('Search…');
  readonly debounceMs = input(350);
  readonly search = output<string>();

  readonly control = new FormControl('', { nonNullable: true });
  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.control.valueChanges
      .pipe(debounceTime(this.debounceMs()), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => this.search.emit(value.trim()));
  }

  clear(): void {
    this.control.setValue('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
