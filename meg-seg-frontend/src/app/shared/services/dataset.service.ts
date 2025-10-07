import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dataset } from '@interfaces/dataset.interface';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatasetService {
  private apiUrl = `${environment.apiUrl}/datasets`;

  constructor(private http: HttpClient) {}

  getAllDatasets(): Observable<Dataset[]> {
    return this.http.get<Dataset[]>(this.apiUrl);
  }

  createDataset(
    dataset: Omit<Dataset, 'id' | 'uploadedAt'>
  ): Observable<Dataset> {
    return this.http.post<Dataset>(this.apiUrl, dataset);
  }
}
