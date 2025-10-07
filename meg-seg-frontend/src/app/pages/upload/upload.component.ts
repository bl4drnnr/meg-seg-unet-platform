import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dataset } from '@interfaces/dataset.interface';
import { DatasetService } from '@shared/services/dataset.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  datasets: Dataset[] = [];
  datasetUrl = '';
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
