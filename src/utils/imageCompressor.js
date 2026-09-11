/**
 * Client-side lightweight image compressor using HTML5 Canvas.
 * Resizes max dimension to 1000px and encodes to JPEG at 0.75 quality,
 * easily targeting well under 1MB (typically 60KB - 200KB).
 */
export async function compressImage(file, maxDimension = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file selected'));
    }

    if (file.size === 0) {
      return reject(new Error('The selected image file is empty (0 bytes).'));
    }

    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('The selected file is not an image.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () =>
        reject(
          new Error(
            'The file could not be decoded as a valid image (it may be corrupted or a renamed non-image file).'
          )
        );
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (!width || !height) {
          return reject(new Error('The image has invalid dimensions or could not be decoded.'));
        }

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
