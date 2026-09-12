// SafePlaca - Sistema de Segurança e Proteção de Propriedade Intelectual

export interface SecurityEventDetail {
  action: string;
  timestamp: string;
  message: string;
}

type SecurityListener = (detail: SecurityEventDetail) => void;
const listeners: SecurityListener[] = [];

export function subscribeSecurityAlert(listener: SecurityListener) {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function notifySecurityViolation(action: string, message: string) {
  const detail: SecurityEventDetail = {
    action,
    timestamp: new Date().toLocaleTimeString('pt-BR'),
    message,
  };
  listeners.forEach((l) => l(detail));
}

export function initWorkbenchProtection(): () => void {
  // 1. Bloqueio de Botão Direito (Context Menu)
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    notifySecurityViolation(
      'context_menu',
      'Download e clique com botão direito bloqueados pela política SafePlaca.'
    );
  };

  // 2. Bloqueio de Teclas de Atalho (Ctrl+S, Ctrl+P, Ctrl+U, F12, etc.)
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+S (Salvar página/imagem)
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 's')) {
      e.preventDefault();
      notifySecurityViolation(
        'save_shortcut',
        'Download direto bloqueado. Os esquemas são protegidos para visualização em bancada.'
      );
      return;
    }

    // Ctrl+P (Imprimir / Salvar em PDF não autorizado)
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'p')) {
      e.preventDefault();
      notifySecurityViolation(
        'print_pdf_shortcut',
        'Exportação direta de PDF bloqueada. Projetos possuem proteção de confidencialidade.'
      );
      return;
    }

    // Ctrl+U (Ver código-fonte)
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'u')) {
      e.preventDefault();
      notifySecurityViolation('view_source', 'Código-fonte de diagramas protegido.');
      return;
    }
  };

  // 3. Bloqueio de arrastar imagens (drag & drop para desktop/outra aba)
  const handleDragStart = (e: DragEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'IMG' || target.tagName === 'svg' || target.classList.contains('protected-media'))) {
      e.preventDefault();
      notifySecurityViolation('drag_media', 'Arrastar imagens para download está desabilitado.');
    }
  };

  window.addEventListener('contextmenu', handleContextMenu);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('dragstart', handleDragStart);

  return () => {
    window.removeEventListener('contextmenu', handleContextMenu);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('dragstart', handleDragStart);
  };
}

export function generateWatermarkString(boardCode: string = 'GERAL'): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR');
  return `SAFEPLACA • BANCADA PROTEGIDA • ${boardCode} • ${dateStr} ${timeStr} • CÓPIA & DOWNLOAD PROIBIDOS`;
}
