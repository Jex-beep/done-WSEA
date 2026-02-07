import { Injectable } from '@angular/core';
import { NgxImageCompressService, DataUrl } from 'ngx-image-compress';

@Injectable({
  providedIn: 'root'
})
export class ImageOptimizationService {

  constructor(private imageCompress: NgxImageCompressService) {}

  // Standard settings for M&J Quality Cars: 
  // Max 1200px wide (HD) and 75% JPEG quality
  async compressImage(image: DataUrl): Promise<string> {
    const orientation = -1; // Default orientation
    const quality = 75;     // 75% quality is the "sweet spot" for SEO vs. Visuals
    const ratio = 100;      // Keep original ratio
    const maxWidth = 1200;  // Standard width for blog/product headers

    try {
      const result = await this.imageCompress.compressFile(image, orientation, ratio, quality, maxWidth);
      console.log('Size before:', this.imageCompress.byteCount(image), 'bytes');
      console.log('Size after:', this.imageCompress.byteCount(result), 'bytes');
      return result;
    } catch (error) {
      console.error('Compression failed', error);
      return image; // Fallback to original if compression fails
    }
  }
}