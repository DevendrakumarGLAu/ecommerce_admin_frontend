import { AbstractControl } from '@angular/forms';

/**
 * Turns an Angular Forms validation error object into a single friendly
 * message, so every feature form shows consistent copy instead of
 * hand-rolling its own per-field strings.
 */
export function getErrorMessage(control: AbstractControl | null, fieldLabel = 'This field'): string | null {
  if (!control || !control.errors || (!control.touched && !control.dirty)) {
    return null;
  }

  const errors = control.errors;

  if (errors['required']) {
    return `${fieldLabel} is required`;
  }
  if (errors['email']) {
    return 'Enter a valid email address';
  }
  if (errors['url']) {
    return 'Enter a valid URL (must start with http:// or https://)';
  }
  if (errors['pattern']) {
    return `${fieldLabel} format is invalid`;
  }
  if (errors['min']) {
    return `${fieldLabel} must be at least ${errors['min'].min}`;
  }
  if (errors['max']) {
    return `${fieldLabel} must be at most ${errors['max'].max}`;
  }
  if (errors['minlength']) {
    return `${fieldLabel} must be at least ${errors['minlength'].requiredLength} characters`;
  }
  if (errors['maxlength']) {
    return `${fieldLabel} must be at most ${errors['maxlength'].requiredLength} characters`;
  }
  if (errors['slugFormat']) {
    return 'Use lowercase letters, numbers, and hyphens only (e.g. my-product-name)';
  }
  if (errors['priceFormat']) {
    return 'Enter a valid price (up to 2 decimal places)';
  }
  if (errors['mustMatch']) {
    return `${fieldLabel} does not match`;
  }
  if (errors['invalidJson']) {
    return 'Enter valid JSON (or leave this field empty)';
  }

  return `${fieldLabel} is invalid`;
}
