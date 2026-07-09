import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { getErrorMessage } from '../../utils/form-error.util';

/**
 * Renders a friendly validation message for a form control, if it has one.
 *
 * Deliberately uses a plain method (not `computed()`) for the message: a
 * FormControl's `touched`/`errors` mutate in place and aren't signals, so a
 * `computed()` here would memoize on the control *reference* and never
 * re-evaluate as the user types — a plain method re-runs on every change
 * detection pass instead, which is what we actually want.
 */
@Component({
  selector: 'app-form-error',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    @if (getMessage(); as message) {
      <div class="app-form-error">{{ message }}</div>
    }
  `,
  styles: `
    .app-form-error {
      color: var(--mat-sys-error);
      font-size: 12px;
      line-height: 1.4;
      margin-top: 4px;
    }
  `
})
export class FormErrorComponent {
  readonly control = input.required<AbstractControl | null>();
  readonly label = input('This field');

  getMessage(): string | null {
    return getErrorMessage(this.control(), this.label());
  }
}
