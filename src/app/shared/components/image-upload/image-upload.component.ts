import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, model, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { NotificationService } from '../../../core/services/notification.service';
import { UploadFolder, UploadService } from '../../../core/services/upload.service';

export interface UploadedImage {
  /** Stable client-side key — object identity is lost once the array is copied, so match on this instead. */
  id: string;
  url: string;
  altText?: string | null;
  /** Present once this image is persisted as a ProductImage row on the backend (multi-image/product use case only). */
  backendId?: string;
  isUploading?: boolean;
  progress?: number;
}

/**
 * Drag-and-drop image upload with preview, per-file progress, removal, and
 * (in multi mode) reordering. Uploads directly to the backend via
 * `UploadService` and exposes the resulting URLs through the `images` model.
 *
 * Single mode (category image, settings logo/favicon, profile avatar): keeps
 * at most one entry. Multi mode (product images): unlimited, reorderable.
 */
@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [DragDropModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss'
})
export class ImageUploadComponent {
  private readonly uploadService = inject(UploadService);
  private readonly notifications = inject(NotificationService);

  readonly multiple = input(false);
  readonly folder = input<UploadFolder>('products');
  readonly maxSizeMb = input(5);
  readonly label = input('Drag & drop an image, or click to browse');

  readonly images = model<UploadedImage[]>([]);
  readonly isDragOver = signal(false);

  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  openFilePicker(): void {
    this.fileInput().nativeElement.click();
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFiles(input.files);
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    if (event.dataTransfer?.files?.length) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onReorderDrop(event: CdkDragDrop<UploadedImage[]>): void {
    const reordered = [...this.images()];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    this.images.set(reordered);
  }

  removeImage(image: UploadedImage): void {
    this.images.update((imgs) => imgs.filter((img) => img.id !== image.id));
  }

  private handleFiles(fileList: FileList): void {
    const files = this.multiple() ? Array.from(fileList) : [fileList[0]];
    for (const file of files) {
      this.uploadFile(file);
    }
  }

  private uploadFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.notifications.warning(`"${file.name}" is not an image file.`);
      return;
    }
    if (file.size > this.maxSizeMb() * 1024 * 1024) {
      this.notifications.warning(`"${file.name}" exceeds the ${this.maxSizeMb()}MB limit.`);
      return;
    }

    const entry: UploadedImage = {
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      isUploading: true,
      progress: 0
    };

    this.images.update((imgs) => (this.multiple() ? [...imgs, entry] : [entry]));

    this.uploadService.uploadImage(file, this.folder()).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.patchEntry(entry.id, { progress: Math.round((event.loaded / event.total) * 100) });
        } else if (event.type === HttpEventType.Response) {
          const url = event.body?.data.url;
          if (url) {
            this.patchEntry(entry.id, { url, isUploading: false, progress: 100 });
          }
        }
      },
      error: () => {
        this.removeImage(entry);
        this.notifications.error(`Failed to upload "${file.name}".`);
      }
    });
  }

  private patchEntry(id: string, patch: Partial<UploadedImage>): void {
    this.images.update((imgs) => imgs.map((img) => (img.id === id ? { ...img, ...patch } : img)));
  }
}
