import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FormErrorComponent } from '../form-error/form-error.component';
import { SeoPreviewComponent } from '../seo-preview/seo-preview.component';

/**
 * Reusable SEO field set embedded in both the product and category forms.
 *
 * `advanced=true` (products) also shows meta title, canonical URL, OG image,
 * and raw JSON-LD schema — fields the Category entity doesn't have on the
 * backend. The parent form's FormGroup must already contain the relevant
 * controls (seo_title, meta_description, meta_keywords, and — when advanced
 * — meta_title, canonical_url, og_image, schema_json).
 */
@Component({
  selector: 'app-seo-form-fields',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, FormErrorComponent, SeoPreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seo-form-fields.component.html',
  styleUrl: './seo-form-fields.component.scss'
})
export class SeoFormFieldsComponent {
  readonly group = input.required<FormGroup>();
  readonly advanced = input(false);
  readonly previewUrlBase = input('https://firozabadbangles.com');
  readonly slug = input('');

  control(name: string): FormControl {
    return this.group().get(name) as FormControl;
  }

  previewTitle(): string {
    const seoTitle = this.control('seo_title')?.value as string | undefined;
    const metaTitle = this.advanced() ? (this.control('meta_title')?.value as string | undefined) : undefined;
    return seoTitle || metaTitle || 'Untitled page';
  }

  previewDescription(): string {
    return (this.control('meta_description')?.value as string | undefined) || 'No meta description provided yet.';
  }

  previewUrl(): string {
    return `${this.previewUrlBase()}/${this.slug() || 'your-page-slug'}`;
  }

  previewImage(): string | null {
    return this.advanced() ? ((this.control('og_image')?.value as string | undefined) ?? null) : null;
  }
}
