/**
 * Resizes an image file down to a reasonable max dimension and re-encodes
 * it as a compressed JPEG, returning base64 (no data: prefix). Keeping
 * payloads small keeps the vision API call fast and cheap without a
 * noticeable quality loss for identification purposes.
 */
export function fileToResizedBase64(file, maxDim = 768, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      URL.revokeObjectURL(objectUrl);
      resolve({ base64: dataUrl.split(",")[1], mimeType: "image/jpeg" });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read that image file."));
    };

    img.src = objectUrl;
  });
}