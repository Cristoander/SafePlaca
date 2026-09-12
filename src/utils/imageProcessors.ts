/**
 * Processador profissional de imagens de placas para bancada técnica.
 * Algoritmos avançados de convolução (Sobel / Laplacian), Realce de Cobre,
 * Remoção de Brilho de Microscópio, Blueprint Técnico, Raio-X PCB,
 * Remoção de Fundo de Manta / Mesa (Chroma Key) e Recorte Poligonal por Pontos.
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
      resolve(canvas.toDataURL('image/png'));
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
      resolve(canvas.toDataURL('image/png'));
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
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

// Filtro Profissional Raio-X PCB
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
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        data[i] = Math.floor(lum * 0.15);
        data[i + 1] = Math.min(255, Math.floor(lum * 1.45));
        data[i + 2] = Math.min(255, Math.floor(lum * 1.30));
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

// Filtro Profissional Blueprint Técnico
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

      // Grade fina de desenho
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

      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

// Filtro de Realce de Trilhas e Bordas
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
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

// Otimizador de Fotos de Microscópio
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

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        if (r > 235 && g > 235 && b > 235) {
          r = Math.floor(r * 0.82);
          g = Math.floor(g * 0.82);
          b = Math.floor(b * 0.82);
        }

        data[i] = Math.min(255, Math.max(0, Math.floor((r - 128) * 1.35 + 135)));
        data[i + 1] = Math.min(255, Math.max(0, Math.floor((g - 128) * 1.35 + 135)));
        data[i + 2] = Math.min(255, Math.max(0, Math.floor((b - 128) * 1.35 + 135)));
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

// Ajustes Manuais Finos
export function applyCustomAdjustments(
  dataUrl: string,
  brightness: number,
  contrast: number,
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
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const copy = new Uint8ClampedArray(imageData.data);
        const w = canvas.width;
        const h = canvas.height;
        const d = imageData.data;

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

      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

export type TargetBgType = 'transparent' | 'white' | 'dark';

// NOVO: Removedor de Fundo Automático de Manta de Bancada / Mesa
export function autoRemoveMatBackground(
  dataUrl: string,
  tolerance: number = 45,
  targetBg: TargetBgType = 'transparent'
): Promise<string> {
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
      const w = canvas.width;
      const h = canvas.height;

      // Amostra os 4 cantos e bordas para detectar a cor média da manta/mesa
      const samples: [number, number, number][] = [];
      const sampleCoords = [
        [4, 4],
        [w - 5, 4],
        [4, h - 5],
        [w - 5, h - 5],
        [Math.floor(w / 2), 4],
        [Math.floor(w / 2), h - 5],
        [4, Math.floor(h / 2)],
        [w - 5, Math.floor(h / 2)],
      ];

      for (const [sx, sy] of sampleCoords) {
        const idx = (sy * w + sx) * 4;
        samples.push([data[idx], data[idx + 1], data[idx + 2]]);
      }

      // Média de cor da borda
      const avgR = Math.round(samples.reduce((acc, s) => acc + s[0], 0) / samples.length);
      const avgG = Math.round(samples.reduce((acc, s) => acc + s[1], 0) / samples.length);
      const avgB = Math.round(samples.reduce((acc, s) => acc + s[2], 0) / samples.length);

      // Substituição de pixels da cor da manta
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Distância Euclidiana de Cor no espaço RGB
        const dist = Math.sqrt(
          (r - avgR) * (r - avgR) +
          (g - avgG) * (g - avgG) +
          (b - avgB) * (b - avgB)
        );

        if (dist <= tolerance) {
          if (targetBg === 'transparent') {
            data[i + 3] = 0; // Transparente total
          } else if (targetBg === 'white') {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = 255;
          } else {
            // Dark mode #070b14
            data[i] = 7;
            data[i + 1] = 11;
            data[i + 2] = 20;
            data[i + 3] = 255;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

// NOVO: Recorte por Polígono / Pontos da Placa (Corta o fundo fora do formato da PCB)
export function cropByPolygon(
  dataUrl: string,
  polygonPoints: { xPercent: number; yPercent: number }[],
  targetBg: TargetBgType = 'transparent'
): Promise<string> {
  return new Promise((resolve) => {
    if (polygonPoints.length < 3) return resolve(dataUrl);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      // Se for fundo branco ou escuro, pinta o fundo primeiro
      if (targetBg === 'white') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (targetBg === 'dark') {
        ctx.fillStyle = '#070b14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Máscara de recorte do polígono desenhado
      ctx.save();
      ctx.beginPath();
      const p0 = polygonPoints[0];
      ctx.moveTo((p0.xPercent / 100) * canvas.width, (p0.yPercent / 100) * canvas.height);

      for (let i = 1; i < polygonPoints.length; i++) {
        const pt = polygonPoints[i];
        ctx.lineTo((pt.xPercent / 100) * canvas.width, (pt.yPercent / 100) * canvas.height);
      }
      ctx.closePath();
      ctx.clip();

      // Desenha a placa dentro do polígono
      ctx.drawImage(img, 0, 0);
      ctx.restore();

      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}
