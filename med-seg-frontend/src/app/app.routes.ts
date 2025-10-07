import { Routes } from '@angular/router';
import { LayoutComponent } from '@components/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { UploadComponent } from './pages/upload/upload.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'upload',
        component: UploadComponent
      }
    ]
  }
];
