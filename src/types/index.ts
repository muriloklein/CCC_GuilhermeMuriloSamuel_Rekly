export interface JwtPayload {
  sub: number;   // usuario.id
  email: string;
  iat?: number;
  exp?: number;
}

export interface Sessao {
  id: number;
  nome: string;
  email: string;
}
