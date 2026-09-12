/**
 * Processador automático de imagens de placas para bancada técnica.
 * Executa rotação, corte (crop) e filtros de estilo (Raio-X, Blueprint, Bordas, Nitidez).
 */

export function rotateImage90(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = dataUrl;
  });
}

export function flipImageHorizontal(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = dataUrl;
  });
}

export function cropImage(
  dataUrl: string,
  cropX: number,
  cropY: number,
  cropWidth: number,
  cropHeight: number
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(50, cropWidth);
      canvas.height = Math.max(50, cropHeight);
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = dataUrl;
  });
}

export function applyAutoXRay(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = 255 - data[i];
        const g = 255 - data[i + 1];
        const b = 255 - data[i + 2];
        const avg = 0.299 * r + 0.587 * g + 0.114 * b;

        data[i] = Math.floor(avg * 0.25);
        data[i + 1] = Math.min(255, Math.floor(avg * 1.35)); // Neon green
        data[i + 2] = Math.min(255, Math.floor(avg * 1.15)); // Cyan
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = dataUrl;
  });
}

export function applyAutoBlueprint(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const avg = 0.299 * r + 0.587 * g + 0.114 * b;

        data[i] = Math.min(255, Math.floor(avg * 0.15 + 10));
        data[i + 1] = Math.min(255, Math.floor(avg * 0.75 + 35));
        data[i + 2] = Math.min(255, Math.floor(avg * 0.95 + 85));
      }
      ctx.putImageData(imageData, 0, 0);

      // Malha quadriculada de engenharia
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      const step = 28;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.restore();

      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = dataUrl;
  });
}

export function applyAutoEdgeEnhancement(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const edge = avg > 115 ? 240 : 25;
        data[i] = edge > 100 ? 251 : 15;
        data[i + 1] = edge > 100 ? 191 : 23;
        data[i + 2] = edge > 100 ? 36 : 42;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = dataUrl;
  });
}
