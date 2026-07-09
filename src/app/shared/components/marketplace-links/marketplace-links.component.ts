import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { MARKETPLACE_PLATFORM_LABELS, MarketplacePlatform } from '../../../products/models/product.model';
import { urlValidator } from '../../utils/validators.util';
import { FormErrorComponent } from '../form-error/form-error.component';

export interface MarketplaceLinkEntry {
  /** Stable client-side key — see the same pattern/rationale in ImageUploadComponent. */
  id: string;
  platform: MarketplacePlatform;
  customLabel: string | null;
  url: string;
  /** Present once this link is persisted as a ProductMarketplaceLink row on the backend. */
  backendId?: string;
}

const PLATFORM_OPTIONS: MarketplacePlatform[] = ['amazon', 'flipkart', 'meesho', 'myntra', 'snapdeal', 'other'];

/** Manages the "buy it here" links for a product (Amazon, Flipkart, Meesho, etc.). */
@Component({
  selector: 'app-marketplace-links',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    FormErrorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './marketplace-links.component.html',
  styleUrl: './marketplace-links.component.scss'
})
export class MarketplaceLinksComponent {
  private readonly fb = inject(FormBuilder);

  readonly links = model<MarketplaceLinkEntry[]>([]);
  readonly platforms = PLATFORM_OPTIONS;
  readonly platformLabels = MARKETPLACE_PLATFORM_LABELS;

  readonly addForm = this.fb.group({
    platform: this.fb.control<MarketplacePlatform>('amazon', Validators.required),
    customLabel: [''],
    url: ['', [Validators.required, urlValidator()]]
  });

  constructor() {
    this.addForm.controls.platform.valueChanges.subscribe((platform) => {
      const customLabelControl = this.addForm.controls.customLabel;
      if (platform === 'other') {
        customLabelControl.addValidators(Validators.required);
      } else {
        customLabelControl.clearValidators();
        customLabelControl.setValue('');
      }
      customLabelControl.updateValueAndValidity();
    });
  }

  isOtherPlatform(): boolean {
    return this.addForm.controls.platform.value === 'other';
  }

  addLink(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    const raw = this.addForm.getRawValue();
    this.links.update((links) => [
      ...links,
      {
        id: crypto.randomUUID(),
        platform: raw.platform!,
        customLabel: raw.platform === 'other' ? raw.customLabel || null : null,
        url: raw.url!
      }
    ]);

    this.addForm.reset({ platform: 'amazon', customLabel: '', url: '' });
  }

  removeLink(entry: MarketplaceLinkEntry): void {
    this.links.update((links) => links.filter((link) => link.id !== entry.id));
  }

  labelFor(entry: MarketplaceLinkEntry): string {
    return entry.platform === 'other' ? entry.customLabel || 'Other' : this.platformLabels[entry.platform];
  }
}
