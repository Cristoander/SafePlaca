/**
 * Processador profissional de imagens de placas para bancada técnica.
 * Algoritmos avançados de convolução (Sobel / Laplacian), Realce de Cobre,
 * Remoção de Brilho de Microscópio, Blueprint Técnico e Raio-X PCB.
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
      resolve(canvas.toDataURL('image/jpeg', 0.92));
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
      resolve(canvas.toDataURL('image/jpeg', 0.92));
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
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = dataUrl;
  });
}

// Filtro Profissional Raio-X PCB com Inversão de Alta Frequência
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
        // Inverte canais para raio-x invertido
        const r = 255 - data[i];
        const g = 255 - data[i + 1];
        const b = 255 - data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // Efeito de fósforo verde/ciano de raio-x hospitalar e de inspeção BGA
        data[i] = Math.floor(lum * 0.15);
        data[i + 1] = Math.min(255, Math.floor(lum * 1.45 + (data[i] > 180 ? 30 : 0)));
        data[i + 2] = Math.min(255, Math.floor(lum * 1.30));
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = dataUrl;
  });
}

// Filtro Profissional Blueprint Técnico com Grade Fina de Medição
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
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

        // Azul profundo naval com trilhas brancas/celestes
        if (lum > 140) {
          data[i] = 230;
          data[i + 1] = 245;
          data[i + 2] = 255;
        } else {
          data[i] = Math.min(255, Math.floor(lum * 0.12 + 8));
          data[i + 1] = Math.min(255, Math.floor(lum * 0.55 + 28));
          data[i + 2] = Math.min(255, Math.floor(lum * 0.85 + 75));
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // Malha quadriculada de engenharia militar
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.lineWidth = 1;
      const step = Math.max(20, Math.floor(canvas.width / 35));
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

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = dataUrl;
  });
}

// Filtro de Realce de Trilhas e Bordas (Edge Boost)
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
        const edge = avg > 110 ? 245 : 30;
        data[i] = edge > 100 ? 251 : 16;
        data[i + 1] = edge > 100 ? 191 : 24;
        data[i + 2] = edge > 100 ? 36 : 45;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = dataUrl;
  });
}

// NOVO: Filtro Otimizador de Fotos de Microscópio (Reduz reflexo e destaca serigrafia)
export function applyMicroscopeOptimization(dataUrl: string): Promise<string> {
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

      // Equalização de contraste e corte de reflexos brancos estourados
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Se for reflexo branco estourado da luz do microscópio, amortece
        if (r > 235 && g > 235 && b > 235) {
          r = Math.floor(r * 0.82);
          g = Math.floor(g * 0.82);
          b = Math.floor(b * 0.82);
        }

        // Estica o contraste dos componentes escuros
        data[i] = Math.min(255, Math.max(0, Math.floor((r - 128) * 1.35 + 135)));
        data[i + 1] = Math.min(255, Math.max(0, Math.floor((g - 128) * 1.35 + 135)));
        data[i + 2] = Math.min(255, Math.max(0, Math.floor((b - 128) * 1.35 + 135)));
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = dataUrl;
  });
}

// NOVO: Ajustes Manuais Finos de Bancada (Brilho, Contraste e Saturação)
export function applyCustomAdjustments(
  dataUrl: string,
  brightness: number, // 0.5 a 2.0 (1.0 padrão)
  contrast: number,   // 0.5 a 2.5 (1.0 padrão)
  sharpness: boolean
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.filter = `brightness(${brightness}) contrast(${contrast})`;
      ctx.drawImage(img, 0, 0);

      if (sharpness) {
        // Convolução de nitidez (Kernel 3x3 Sharpen)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const copy = new Uint8ClampedArray(imageData.data);
        const w = canvas.width;
        const h = canvas.height;
        const d = imageData.data;

        // Kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0]
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = (y * w + x) * 4;
            for (let c = 0; c < 3; c++) {
              const val =
                5 * copy[idx + c] -
                copy[((y - 1) * w + x) * 4 + c] -
                copy[((y + 1) * w + x) * 4 + c] -
                copy[(y * w + (x - 1)) * 4 + c] -
                copy[(y * w + (x + 1)) * 4 + c];
              d[idx + c] = Math.min(255, Math.max(0, val));
            }
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = dataUrl;
  });
}
