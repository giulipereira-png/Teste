/**
 * ACEDEP Image Optimizer Utility
 * Automatically compresses, scales, and cleans uploaded images (avatars, banners, gallery photos)
 * so they save instantly in Firestore without exceeding the 1MB document limit.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number; // target max bytes for the base64 string
}

export async function optimizeImage(
  input: string | File,
  options: OptimizeImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.72,
    maxSizeBytes = 500 * 1024, // 500 KB safe ceiling
  } = options;

  // 1. Convert File to Data URL if needed
  let dataUrl: string;
  if (typeof input !== 'string') {
    dataUrl = await fileToDataUrl(input);
  } else {
    dataUrl = input;
  }

  // If not a data URL (e.g. standard http/https link or static path), return as is
  if (!dataUrl.startsWith('data:image')) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scale
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Draw to canvas
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return resolve(dataUrl);
        }

        // Clean white background for transparency fallback
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let currentQuality = quality;
        let result = canvas.toDataURL('image/jpeg', currentQuality);

        // If string is still over maxSizeBytes, downscale further
        if (result.length > maxSizeBytes) {
          const secondCanvas = document.createElement('canvas');
          const scale = 0.75;
          secondCanvas.width = Math.round(width * scale);
          secondCanvas.height = Math.round(height * scale);
          const secondCtx = secondCanvas.getContext('2d');
          if (secondCtx) {
            secondCtx.fillStyle = '#FFFFFF';
            secondCtx.fillRect(0, 0, secondCanvas.width, secondCanvas.height);
            secondCtx.drawImage(img, 0, 0, secondCanvas.width, secondCanvas.height);
            result = secondCanvas.toDataURL('image/jpeg', 0.62);
          }
        }

        resolve(result);
      } catch (err) {
        console.warn('Image optimization canvas error, returning original dataUrl:', err);
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      console.warn('Image failed to load in optimization, returning input');
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
