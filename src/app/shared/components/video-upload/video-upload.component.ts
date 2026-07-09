import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, model, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { NotificationService } from '../../../core/services/notification.service';
import { UploadFolder, UploadService } from '../../../core/services/upload.service';

export interface UploadedVideo {
  /** Stable client-side key — object identity is lost once the array is copied, so match on this instead. */
  id: string;
  url: string;
  caption?: string | null;
  /** Present once this video is persisted as a ProductVideo row on the backend. */
  backendId?: string;
  isUploading?: boolean;
  progress?: number;
}

/**
 * Drag-and-drop video upload with preview (native `<video controls>`),
 * per-file progress, removal, and reordering. Uploads directly to the
 * backend via `UploadService.uploadVideo` and exposes the resulting URLs
 * through the `videos` model. Mirrors `ImageUploadComponent` — kept as a
 * separate component since the preview markup (video vs img) and validation
 * (type/size limits) differ enough that sharing one component would need a
 * mode switch on nearly every template line.
 */
@Component({
  selector: 'app-video-upload',
  standalone: true,
  imports: [DragDropModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-upload.component.html',
  styleUrl: './video-upload.component.scss'
})
export class VideoUploadComponent {
  private readonly uploadService = inject(UploadService);
  private readonly notifications = inject(NotificationService);

  readonly multiple = input(true);
  readonly folder = input<UploadFolder>('products');
  readonly maxSizeMb = input(50);
  readonly label = input('Drag & drop a video, or click to browse');

  readonly videos = model<UploadedVideo[]>([]);
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

  onReorderDrop(event: CdkDragDrop<UploadedVideo[]>): void {
    const reordered = [...this.videos()];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    this.videos.set(reordered);
  }

  removeVideo(video: UploadedVideo): void {
    this.videos.update((vids) => vids.filter((v) => v.id !== video.id));
  }

  private handleFiles(fileList: FileList): void {
    const files = this.multiple() ? Array.from(fileList) : [fileList[0]];
    for (const file of files) {
      this.uploadFile(file);
    }
  }

  private uploadFile(file: File): void {
    if (!file.type.startsWith('video/')) {
      this.notifications.warning(`"${file.name}" is not a video file.`);
      return;
    }
    if (file.size > this.maxSizeMb() * 1024 * 1024) {
      this.notifications.warning(`"${file.name}" exceeds the ${this.maxSizeMb()}MB limit.`);
      return;
    }

    const entry: UploadedVideo = {
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      isUploading: true,
      progress: 0
    };

    this.videos.update((vids) => (this.multiple() ? [...vids, entry] : [entry]));

    this.uploadService.uploadVideo(file, this.folder()).subscribe({
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
        this.removeVideo(entry);
        this.notifications.error(`Failed to upload "${file.name}".`);
      }
    });
  }

  private patchEntry(id: string, patch: Partial<UploadedVideo>): void {
    this.videos.update((vids) => vids.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }
}
