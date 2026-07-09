import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { NotificationService } from '../../../core/services/notification.service';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { PageToolbarComponent } from '../../../shared/components/page-toolbar/page-toolbar.component';
import { SeoPreviewComponent } from '../../../shared/components/seo-preview/seo-preview.component';
import { DialogService } from '../../../shared/services/dialog.service';
import { MARKETPLACE_PLATFORM_LABELS, Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-view',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    ErrorStateComponent,
    LoaderComponent,
    PageToolbarComponent,
    SeoPreviewComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-view.component.html',
  styleUrl: './product-view.component.scss'
})
export class ProductViewComponent {
  private readonly productService = inject(ProductService);
  private readonly dialogService = inject(DialogService);
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly loadFailed = signal(false);
  readonly activeImageIndex = signal(0);
  readonly platformLabels = MARKETPLACE_PLATFORM_LABELS;

  constructor() {
    this.load();
  }

  load(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.loadFailed.set(true);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.loadFailed.set(false);
    this.productService.getBySlug(slug).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: () => {
        this.loadFailed.set(true);
        this.loading.set(false);
      }
    });
  }

  deleteProduct(): void {
    const product = this.product();
    if (!product) {
      return;
    }
    this.dialogService.confirmDelete(`"${product.title}"`).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.productService.delete(product.id).subscribe(() => {
        this.notifications.success('Product deleted');
        void this.router.navigate(['/products']);
      });
    });
  }
}
