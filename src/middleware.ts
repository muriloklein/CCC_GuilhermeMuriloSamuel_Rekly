import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback_dev_secret_troque_em_producao'
);

// Rotas que não precisam de autenticação
const ROTAS_PUBLICAS = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const ehPublica = ROTAS_PUBLICAS.some(
    (rota) => pathname === rota || pathname.startsWith('/api/auth')
  );

  const token = request.cookies.get('rekly_token')?.value;

  // Rota protegida sem token -> redireciona para login
  if (!ehPublica && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Tem token -> valida
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      // Usuário logado tentando acessar página pública -> redireciona para dashboard
      if (ehPublica && pathname !== '/' && !pathname.startsWith('/api')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      // Token inválido/expirado -> limpa cookie e redireciona para login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('rekly_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
