import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dataset } from '@interfaces/dataset.interface';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  datasets: Dataset[] = [
    {
      id: 1,
      name: 'Brain MRI Dataset',
      s3Bucket: 'medseg-datasets',
      s3Key: 'datasets/brain-mri-001',
      uploadedAt: new Date('2024-10-01'),
      fileCount: 150,
      totalSizeMb: 245.5,
      status: 'ready'
    },
    {
      id: 2,
      name: 'Lung CT Scans',
      s3Bucket: 'medseg-datasets',
      s3Key: 'datasets/lung-ct-002',
      uploadedAt: new Date('2024-10-05'),
      fileCount: 320,
      totalSizeMb: 512.8,
      status: 'ready'
    },
    {
      id: 3,
      name: 'Cardiac Segmentation',
      s3Bucket: 'medseg-datasets',
      s3Key: 'datasets/cardiac-003',
      uploadedAt: new Date('2024-10-06'),
      fileCount: 89,
      totalSizeMb: 178.3,
      status: 'uploaded'
    }
  ];

  datasetUrl = '';
  isDragging = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileUpload(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileUpload(input.files[0]);
    }
  }

  handleFileUpload(file: File): void {
    console.log('File selected:', file.name);
    // TODO: Implement file upload logic
  }

  uploadFromUrl(): void {
    if (this.datasetUrl.trim()) {
      console.log('Uploading from URL:', this.datasetUrl);
      // TODO: Implement URL upload logic
      this.datasetUrl = '';
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }
}
