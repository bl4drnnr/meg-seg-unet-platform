# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MedSeg Platform is a medical image segmentation application using U-Net architecture. It's a full-stack TypeScript/Python project for medical researchers and students to upload datasets, train U-Net models, and perform automated image segmentation.

**Academic Context**: Master's degree project for "Architectures of Neural Networks" course, focusing on U-Net implementation, medical image processing, and MLOps fundamentals.

## Architecture

The system consists of three main components:

1. **Frontend** (`med-seg-frontend/`): Angular 17 application providing the UI
2. **Backend** (`med-seg-backend/`): NestJS API server for orchestration and business logic
3. **ML Processing**: Python scripts (to be implemented) for U-Net training and inference

### Data Flow

- Backend orchestrates all operations via REST API (global prefix: `/api`)
- NestJS spawns Python child processes for ML tasks (training/inference)
- SQLite database acts as metadata cache mirroring AWS S3 state
- AWS S3 provides persistent storage for datasets and trained models
- Backend runs on port 4201 (configurable via `API_PORT` env var)
- Frontend runs on port 4200 by default

### Database Schema

**SQLite tables** (to be implemented):
- `datasets`: Stores dataset metadata (name, s3_bucket, s3_key, file_count, total_size_mb, status)
- `models`: Stores model metadata (name, dataset_id, s3_bucket, s3_key, hyperparameters, metrics, status)
- `inference_results`: Stores inference outputs (optional)

## Development Commands

### Root Level
```bash
npm run start:backend      # Start NestJS backend in dev mode
npm run start:frontend     # Start Angular frontend
npm run format:backend     # Format backend code (Prettier + ESLint)
npm run format:frontend    # Format frontend code (Prettier + ESLint)
```

### Backend (`med-seg-backend/`)
```bash
npm run start:dev          # Start in watch mode (port 4201)
npm run build              # Build for production
npm run lint               # Lint and auto-fix TypeScript files
npm run test               # Run Jest unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests
npm run format             # Format with Prettier + ESLint
```

### Frontend (`med-seg-frontend/`)
```bash
npm start                  # Start dev server (ng serve)
npm run build              # Build for production
npm run watch              # Build in watch mode
npm test                   # Run Jasmine/Karma tests
npm run format             # Format with Prettier + ESLint
```

## Configuration

### Backend Environment Variables
- `API_PORT`: Backend port (default: 4201)
- `AWS_ACCESS_KEY_ID`: AWS credentials
- `AWS_SECRET_ACCESS_KEY`: AWS credentials
- `AWS_REGION`: AWS region
- `S3_BUCKET_NAME`: S3 bucket for datasets/models

### CORS Configuration
Backend allows CORS from: localhost:4200, localhost:4202, localhost:8080, 127.0.0.1:8080, localhost:4000

### Request Size Limits
Backend accepts JSON/URL-encoded payloads up to 50mb (configured in `med-seg-backend/src/main.ts:18-19`)

## Key Workflows

### Dataset Upload
1. User uploads dataset (ZIP with `/images` and `/masks` folders)
2. Backend validates and uploads to S3
3. Metadata stored in SQLite
4. Supported formats: PNG, JPG, DICOM, NIfTI

### Model Training
1. User selects dataset and configures hyperparameters (epochs, learning rate, batch size)
2. Backend downloads dataset from S3
3. Backend spawns Python training script via child process
4. Python trains U-Net model locally
5. Trained model uploaded to S3
6. Metrics and metadata stored in SQLite

### Inference
1. User uploads image and selects trained model
2. Backend retrieves model from S3
3. Backend spawns Python inference script
4. Segmentation result returned and visualized

## Code Architecture Notes

- **Monorepo structure**: Two separate npm projects (`med-seg-backend`, `med-seg-frontend`) with root-level convenience scripts
- **Backend**: Standard NestJS structure with modules, controllers, and services (currently minimal setup)
- **Frontend**: Angular 17 standalone components architecture
- **No authentication**: Single-user system for academic purposes
- **Synchronous operations**: Frontend polls for status updates (no WebSockets)
- **SQLite**: Chosen for simplicity over PostgreSQL/MySQL

## Development Guidelines

- Both frontend and backend use Prettier + ESLint for formatting
- Backend uses Jest for testing, frontend uses Jasmine/Karma
- TypeScript strict mode enabled
- Code must be formatted before commits (use `npm run format`)
