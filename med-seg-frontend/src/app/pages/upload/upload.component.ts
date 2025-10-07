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
  editingDatasetId: number | null = null;
  selectedFile: File | null = null;
  datasetName = '';

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
      this.selectFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectFile(input.files[0]);
    }
  }

  selectFile(file: File): void {
    if (!file.name.endsWith('.zip')) {
      alert('Please upload a ZIP file');
      return;
    }
    this.selectedFile = file;
  }

  onNameChange(): void {
    const nameInput = document.getElementById(
      'dataset-name'
    ) as HTMLInputElement;
    this.datasetName = nameInput?.value?.trim() || '';
  }

  canUpload(): boolean {
    return this.selectedFile !== null && this.datasetName.length > 0;
  }

  submitUpload(): void {
    if (!this.canUpload()) {
      return;
    }

    this.datasetService
      .uploadDataset(this.selectedFile!, this.datasetName)
      .subscribe({
        next: (dataset) => {
          console.log('Upload successful:', dataset);
          this.resetForm();
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

  resetForm(): void {
    this.selectedFile = null;
    this.datasetName = '';
    const nameInput = document.getElementById(
      'dataset-name'
    ) as HTMLInputElement;
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (nameInput) nameInput.value = '';
    if (fileInput) fileInput.value = '';
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  startEdit(datasetId: number): void {
    this.editingDatasetId = datasetId;
  }

  saveEdit(datasetId: number): void {
    const inputElement = document.getElementById(
      `edit-input-${datasetId}`
    ) as HTMLInputElement;

    if (!inputElement) {
      alert('Error: Could not find input element');
      return;
    }

    const trimmedName = inputElement.value.trim();
    if (!trimmedName || trimmedName.length === 0) {
      alert('Dataset name cannot be empty');
      return;
    }

    this.datasetService.updateDataset(datasetId, trimmedName).subscribe({
      next: (updatedDataset) => {
        console.log('Dataset renamed successfully:', updatedDataset);
        this.editingDatasetId = null;
        this.loadDatasets();
      },
      error: (error) => {
        console.error('Failed to rename dataset:', error);
        const errorMessage =
          error.error?.message || 'Failed to rename dataset. Please try again.';
        alert(`Error: ${errorMessage}`);
      }
    });
  }

  cancelEdit(): void {
    this.editingDatasetId = null;
  }

  deleteDataset(datasetId: number, datasetName: string): void {
    const confirmed = confirm(
      `Are you sure you want to delete "${datasetName}"? This will permanently remove the dataset from both the database and AWS S3.`
    );

    if (!confirmed) {
      return;
    }

    this.datasetService.deleteDataset(datasetId).subscribe({
      next: () => {
        console.log('Dataset deleted successfully');
        this.loadDatasets();
      },
      error: (error) => {
        console.error('Failed to delete dataset:', error);
        const errorMessage =
          error.error?.message || 'Failed to delete dataset. Please try again.';
        alert(`Error: ${errorMessage}`);
      }
    });
  }
}
