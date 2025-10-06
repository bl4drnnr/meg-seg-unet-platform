<h1 align="center">MedSeg Platform</h1>

A web-based medical image segmentation platform using U-Net architecture for automated segmentation of medical images.

## Project Overview

MedSeg Platform is a full-stack web application designed for medical researchers and students to upload medical imaging datasets, train U-Net models, and perform automated image segmentation. This project demonstrates the integration of deep learning models with modern web technologies and cloud infrastructure.

## Features

- **Dataset Management**: Upload medical imaging datasets via drag-and-drop or URL
- **Model Training**: Train U-Net models with configurable hyperparameters
- **Inference**: Apply trained models to new medical images for segmentation
- **Cloud Storage**: Persistent storage of datasets and models in AWS S3
- **Result Visualization**: View segmentation results with overlay comparisons

## Architecture

### System Components

```
┌─────────────┐
│   Angular   │  Frontend (UI/UX)
│  Frontend   │
└──────┬──────┘
       │ REST API
       ↓
┌─────────────┐
│   NestJS    │  Backend (API Logic, Orchestration)
│   Backend   │
└──────┬──────┘
       │
       ├──────→ SQLite (Metadata Cache)
       │
       ├──────→ AWS S3 (Datasets & Models Storage)
       │
       └──────→ Python Scripts (ML Processing)
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Angular | User interface and interaction |
| **Backend** | NestJS (Node.js/TypeScript) | API server, request handling, orchestration |
| **ML Processing** | Python (PyTorch/TensorFlow) | Model training and inference |
| **Database** | SQLite | Metadata cache (mirrors S3 state) |
| **Storage** | AWS S3 | Persistent storage for datasets and models |
| **API** | REST | Communication between frontend and backend |

## Workflows

### 1. Dataset Upload

```
User uploads dataset (drag-and-drop or URL)
    ↓
NestJS receives and validates request
    ↓
NestJS uploads files to S3 (or downloads from URL first)
    ↓
Metadata recorded in SQLite database
    ↓
Success response returned to frontend
```

**Supported Dataset Formats:**
- ZIP archive containing `/images` and `/masks` folders
- Corresponding image-mask pairs with matching filenames
- Supported image formats: PNG, JPG, DICOM, NIfTI

### 2. Model Training

```
User selects dataset and configures training parameters
    ↓
NestJS receives training request
    ↓
NestJS downloads dataset from S3
    ↓
NestJS spawns Python training script via child process
    ↓
Python script trains U-Net model locally
    ↓
Trained model uploaded to S3
    ↓
Model metadata stored in SQLite
    ↓
Training results returned to frontend
```

**Training Parameters:**
- Number of epochs
- Learning rate
- Batch size
- Model architecture variant

### 3. Inference

```
User uploads image and selects trained model
    ↓
NestJS retrieves model from S3 (or cache)
    ↓
NestJS spawns Python inference script
    ↓
Python performs segmentation
    ↓
Segmentation result returned to frontend
    ↓
Visualization displayed to user
```

## Database Schema

### SQLite Database (Metadata Cache)

#### Table: `datasets`
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Unique dataset identifier |
| `name` | TEXT | Dataset name |
| `s3_bucket` | TEXT | S3 bucket name |
| `s3_key` | TEXT | S3 object key/path |
| `uploaded_at` | TIMESTAMP | Upload timestamp |
| `file_count` | INTEGER | Number of images in dataset |
| `total_size_mb` | REAL | Total dataset size in MB |
| `status` | TEXT | Status: 'uploaded', 'ready', 'error' |

#### Table: `models`
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Unique model identifier |
| `name` | TEXT | Model name |
| `dataset_id` | INTEGER | Foreign key to datasets table |
| `s3_bucket` | TEXT | S3 bucket name |
| `s3_key` | TEXT | S3 object key/path |
| `hyperparameters` | TEXT (JSON) | Training configuration |
| `metrics` | TEXT (JSON) | Performance metrics (Dice, IoU, etc.) |
| `trained_at` | TIMESTAMP | Training completion timestamp |
| `status` | TEXT | Status: 'training', 'completed', 'failed' |

#### Table: `inference_results` (Optional)
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Unique result identifier |
| `model_id` | INTEGER | Foreign key to models table |
| `input_image_s3_key` | TEXT | Input image S3 path |
| `output_image_s3_key` | TEXT | Segmentation result S3 path |
| `created_at` | TIMESTAMP | Inference timestamp |

## Project Scope

### Core Features (Must-Have)
- ✅ Dataset upload via file or URL
- ✅ Dataset storage in S3 with SQLite caching
- ✅ U-Net model training with basic hyperparameter configuration
- ✅ Model storage and versioning in S3
- ✅ Inference on new images using trained models
- ✅ Basic segmentation visualization

### Simplifications
- 🔸 Single-user system (no authentication required)
- 🔸 Local training only (no distributed training)
- 🔸 Synchronous operations (polling for status updates)
- 🔸 Basic error handling
- 🔸 SQLite for simplicity (no need for PostgreSQL/MySQL)

## Academic Context

**Course**: Architectures of Neural Networks
**Program**: AI & ML Master's Degree
**Focus Areas**:
- U-Net architecture implementation and variants
- Medical image preprocessing and augmentation
- Full-stack ML application development
- Cloud infrastructure for ML workflows
- MLOps fundamentals (model storage, serving, metadata management)

## Getting Started

_(To be implemented)_

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- AWS Account with S3 access
- Angular CLI

### Installation
```bash
# Clone repository
git clone <repository-url>

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install Python dependencies
cd ../ml
pip install -r requirements.txt
```

### Configuration
```bash
# Set up AWS credentials
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=your_region

# Configure S3 bucket
export S3_BUCKET_NAME=your_bucket_name
```

### Running the Application
```bash
# Start backend
cd backend
npm run start:dev

# Start frontend
cd frontend
ng serve

# Access application at http://localhost:4200
```

## Future Enhancements

- Support for multiple U-Net variants (ResNet backbone, Attention U-Net)
- Real-time training progress updates via WebSockets
- Batch inference capabilities
- Advanced metrics and evaluation tools
- Model comparison dashboard
- Export models for clinical deployment
- Multi-user support with authentication
