import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as AdmZip from 'adm-zip';
import { ValidationException } from '@common/exceptions/validation.exception';

@Injectable()
export class FileValidationService {
  private readonly ALLOWED_IMAGE_EXTENSIONS = [
    '.png',
    '.jpg',
    '.jpeg',
    '.dcm',
    '.nii',
    '.nii.gz'
  ];
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

  validateFileSize(filePath: string): void {
    const stats = fs.statSync(filePath);
    if (stats.size > this.MAX_FILE_SIZE) {
      throw new ValidationException('File size exceeds 5GB limit');
    }
  }

  extractZip(zipPath: string, extractPath: string): void {
    try {
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractPath, true);
    } catch (error) {
      throw new ValidationException('Invalid ZIP file format');
    }
  }

  validateZipStructure(extractPath: string): {
    imagesDir: string;
    masksDir: string;
  } {
    const contents = fs.readdirSync(extractPath);

    // Check if images and masks folders exist at root level
    let imagesDir: string;
    let masksDir: string;

    // Case 1: Direct structure (images/ and masks/ at root)
    if (contents.includes('images') && contents.includes('masks')) {
      imagesDir = path.join(extractPath, 'images');
      masksDir = path.join(extractPath, 'masks');
    }
    // Case 2: Nested in a single folder
    else if (
      contents.length === 1 &&
      fs.statSync(path.join(extractPath, contents[0])).isDirectory()
    ) {
      const nestedPath = path.join(extractPath, contents[0]);
      const nestedContents = fs.readdirSync(nestedPath);

      if (nestedContents.includes('images') && nestedContents.includes('masks')) {
        imagesDir = path.join(nestedPath, 'images');
        masksDir = path.join(nestedPath, 'masks');
      } else {
        throw new ValidationException(
          'ZIP must contain "images" and "masks" folders'
        );
      }
    } else {
      throw new ValidationException('ZIP must contain "images" and "masks" folders');
    }

    // Verify they are directories
    if (
      !fs.statSync(imagesDir).isDirectory() ||
      !fs.statSync(masksDir).isDirectory()
    ) {
      throw new ValidationException('"images" and "masks" must be directories');
    }

    return { imagesDir, masksDir };
  }

  validateFileExtension(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();

    // Special handling for .nii.gz
    if (filename.toLowerCase().endsWith('.nii.gz')) {
      return true;
    }

    return this.ALLOWED_IMAGE_EXTENSIONS.includes(ext);
  }

  getFileBasename(filename: string): string {
    // Handle .nii.gz files
    if (filename.toLowerCase().endsWith('.nii.gz')) {
      return filename.slice(0, -7);
    }
    return path.parse(filename).name;
  }

  validateDatasetContents(
    imagesDir: string,
    masksDir: string
  ): {
    fileCount: number;
    unpairedFiles: string[];
  } {
    const imageFiles = fs.readdirSync(imagesDir).filter((file) => {
      const filePath = path.join(imagesDir, file);
      return fs.statSync(filePath).isFile() && this.validateFileExtension(file);
    });

    const maskFiles = fs.readdirSync(masksDir).filter((file) => {
      const filePath = path.join(masksDir, file);
      return fs.statSync(filePath).isFile() && this.validateFileExtension(file);
    });

    if (imageFiles.length === 0) {
      throw new ValidationException('No valid image files found in images folder');
    }

    if (maskFiles.length === 0) {
      throw new ValidationException('No valid mask files found in masks folder');
    }

    // Check for matching pairs
    const imageBasenames = new Set(imageFiles.map((f) => this.getFileBasename(f)));
    const maskBasenames = new Set(maskFiles.map((f) => this.getFileBasename(f)));

    const unpairedFiles: string[] = [];

    // Check for images without masks
    imageFiles.forEach((img) => {
      const basename = this.getFileBasename(img);
      if (!maskBasenames.has(basename)) {
        unpairedFiles.push(`Image without mask: ${img}`);
      }
    });

    // Check for masks without images
    maskFiles.forEach((mask) => {
      const basename = this.getFileBasename(mask);
      if (!imageBasenames.has(basename)) {
        unpairedFiles.push(`Mask without image: ${mask}`);
      }
    });

    if (unpairedFiles.length > 0) {
      throw new ValidationException('Found unpaired files', { unpairedFiles });
    }

    return {
      fileCount: imageFiles.length,
      unpairedFiles: []
    };
  }

  cleanupDirectory(dirPath: string): void {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }
}
