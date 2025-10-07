export type Music = {
  id: string;
  nome: string;
  artista: string;
  genero?: string;
  ano?: string;
};

export type Playlist = {
  id: string;
  nome: string;
  usuarioId: string;
  musicas: Music[];
};

export type User = {
  id: string;
  email: string;
};
