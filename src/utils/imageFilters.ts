import type { VisualStyle } from '../types/board';

/**
 * Aplica filtros de estilo de engenharia em um elemento Canvas ou contexto 2D.
 */
export function applyStyleToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: VisualStyle
) {
  if (style === 'normal') return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  if (style === 'blueprint') {
    // Blueprint Técnico: tons de azul escuro de fundo com traços ciano e branco
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const avg = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Realça detalhes claros em ciano e escurece o fundo para azul marinho
      data[i] = Math.min(255, Math.floor(avg * 0.15 + 10));      // R
      data[i + 1] = Math.min(255, Math.floor(avg * 0.75 + 35));  // G
      data[i + 2] = Math.min(255, Math.floor(avg * 0.95 + 85));  // B
    }
    ctx.putImageData(imageData, 0, 0);

    // Desenha grid de engenharia sobreposto
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1;
    const step = 24;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  } else if (style === 'xray') {
    // Raio-X PCB: invertido com realce fosforescente verde e ciano
    for (let i = 0; i < data.length; i += 4) {
      const r = 255 - data[i];
      const g = 255 - data[i + 1];
      const b = 255 - data[i + 2];
      const avg = 0.299 * r + 0.587 * g + 0.114 * b;

      data[i] = Math.floor(avg * 0.2);       // R baixo
      data[i + 1] = Math.min(255, Math.floor(avg * 1.3)); // G néon
      data[i + 2] = Math.min(255, Math.floor(avg * 1.1)); // B ciano
    }
    ctx.putImageData(imageData, 0, 0);
  } else if (style === 'edges') {
    // Realce de Bordas e Contornos de Componentes
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const avg = (r + g + b) / 3;
      // Alto contraste binário com tonalidade âmbar/dourada
      const edge = avg > 110 ? 240 : 20;
      data[i] = edge > 100 ? 251 : 15;
      data[i + 1] = edge > 100 ? 191 : 23;
      data[i + 2] = edge > 100 ? 36 : 42;
    }
    ctx.putImageData(imageData, 0, 0);
  }
}
