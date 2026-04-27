export const THUMB_MAX_DIM = 320;
export const FULL_MAX_DIM = 1200;
const ENCODE_TYPE = 'image/webp';
const ENCODE_QUALITY = 0.8;

async function resizeBitmapToBlob(bitmap, maxDim) {
  let { width, height } = bitmap;
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }
  const canvas = new OffscreenCanvas(width, height);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  return canvas.convertToBlob({ type: ENCODE_TYPE, quality: ENCODE_QUALITY });
}

export async function processImage(file) {
  const bitmap = await createImageBitmap(file);
  try {
    const [thumb, full] = await Promise.all([
      resizeBitmapToBlob(bitmap, THUMB_MAX_DIM),
      resizeBitmapToBlob(bitmap, FULL_MAX_DIM),
    ]);
    return { thumb, full };
  } finally {
    bitmap.close();
  }
}
