import { cookies } from 'next/headers';
import { verificarToken } from './services/authService';
import * as usuarioRepo from './repositories/usuarioRepository';

export const COOKIE_NAME = 'rekly_token';

// Pegar sessão atual (uso em Server Components e API Routes)
export async function getSessao() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verificarToken(token);
  if (!payload?.sub) return null;

  const usuario = await usuarioRepo.findById(Number(payload.sub));
  if (!usuario) return null;

  return { id: usuario.id, nome: usuario.nome, email: usuario.email };
}

// Setar cookie de sessão
export function cookieOpcoes() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 30 * 60, // 30 minutos
  };
}
