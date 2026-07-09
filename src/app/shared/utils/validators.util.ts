import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

/** http(s):// URL. */
export function urlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    return URL_PATTERN.test(control.value) ? null : { url: true };
  };
}

/** Lowercase, hyphen-separated slug (e.g. "gold-plated-bangle-set"). */
export function slugValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    return SLUG_PATTERN.test(control.value) ? null : { slugFormat: true };
  };
}

/** Non-negative number with at most 2 decimal places. */
export function priceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }
    return PRICE_PATTERN.test(String(control.value)) ? null : { priceFormat: true };
  };
}

/** Validates that the control's string value is either empty or parseable JSON. */
export function jsonValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    try {
      JSON.parse(control.value);
      return null;
    } catch {
      return { invalidJson: true };
    }
  };
}

/** Cross-field validator: asserts `controlName` equals `matchingControlName`. Apply on the FormGroup. */
export function mustMatchValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const control = group.get(controlName);
    const matchingControl = group.get(matchingControlName);
    if (!control || !matchingControl || matchingControl.errors && !matchingControl.errors['mustMatch']) {
      return null;
    }
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ ...matchingControl.errors, mustMatch: true });
    } else {
      const { mustMatch, ...rest } = matchingControl.errors ?? {};
      matchingControl.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  };
}
