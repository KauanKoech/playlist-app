// Tipo que representa uma música
export type Music = {
  id: string;
  nome: string;
  artista: string;
  genero?: string;
  ano?: string;
};

// Tipo que representa uma playlist de um usuário
export type Playlist = {
  id: string;
  nome: string;
  usuarioId: string;
  musicas: Music[];
};

// Tipo básico de usuário do sistema
export type User = {
  id: string;
  email: string;
};
