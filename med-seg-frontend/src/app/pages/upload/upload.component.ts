import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dataset } from '@interfaces/dataset.interface';
import { DatasetService } from '@shared/services/dataset.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  datasets: Dataset[] = [];
  isDragging = false;

  constructor(private datasetService: DatasetService) {}

  ngOnInit(): void {
    this.loadDatasets();
  }

  loadDatasets(): void {
    this.datasetService.getAllDatasets().subscribe({
      next: (datasets) => {
        this.datasets = datasets;
      },
      error: (error) => {
        console.error('Error loading datasets:', error);
      }
    });
  }

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
    if (!file.name.endsWith('.zip')) {
      alert('Please upload a ZIP file');
      return;
    }

    const datasetName = prompt('Enter dataset name:');
    if (!datasetName || datasetName.trim().length === 0) {
      return;
    }

    this.datasetService.uploadDataset(file, datasetName.trim()).subscribe({
      next: (dataset) => {
        console.log('Upload successful:', dataset);
        this.loadDatasets();
      },
      error: (error) => {
        console.error('Upload failed:', error);
        const errorMessage =
          error.error?.message || 'Upload failed. Please try again.';
        alert(`Error: ${errorMessage}`);
      }
    });
  }

  uploadFromUrl(input: HTMLInputElement): void {
    const url = input.value.trim();

    if (url) {
      console.log('Uploading from URL:', url);
      // TODO: Implement URL upload logic
      input.value = '';
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }
}
