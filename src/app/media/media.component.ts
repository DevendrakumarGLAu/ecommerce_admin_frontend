import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EmptyStateComponent } from '../shared/components/empty-state/empty-state.component';
import { PageToolbarComponent } from '../shared/components/page-toolbar/page-toolbar.component';

/**
 * Placeholder: a media library needs a backend endpoint that lists
 * previously-uploaded Supabase Storage objects. The backend only exposes
 * `POST /uploads/image` (upload one file, get its URL back) — there's no
 * `GET /uploads` to enumerate what's already been uploaded. Product/category
 * images and settings logo/favicon are all managed inline in their own
 * forms via `ImageUploadComponent`, which doesn't need a media library.
 */
@Component({
  selector: 'app-media',
  standalone: true,
  imports: [EmptyStateComponent, PageToolbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <app-page-toolbar title="Media" subtitle="Browse previously uploaded images." />
      <app-empty-state
        icon="perm_media"
        title="Media library not available yet"
        description="This needs a backend endpoint that lists previously uploaded files (the API currently only supports uploading a new file and getting its URL back). Product images, category images, and the site logo/favicon are all uploaded directly from their own forms in the meantime."
      />
    </div>
  `
})
export class MediaComponent {}
