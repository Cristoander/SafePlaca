export type NewsBadge = 'novidade' | 'esquema_novo' | 'dica_reparo' | 'aviso';

export interface NewsAnnouncement {
  id: string;
  title: string;
  content: string;
  badge: NewsBadge;
  date: string;
  author?: string;
  linkModel?: string;
}

export type UserRole = 'admin' | 'user';
