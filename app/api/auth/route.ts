import { NextRequest, NextResponse } from 'next/server';
import * as authService from '@/src/lib/services/authService';
import { enviarEmailRecuperacaoSenha } from '@/src/lib/services/mailService';
import { cookieOpcoes } from '@/src/lib/auth';

// POST /api/auth
// Ação determinada pelo campo "action" no body
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { action } = body;

  // Cadastro 
  if (action === 'cadastrar') {
    const { nome, email, senha, confirmarSenha } = body;
    const resultado = await authService.cadastrar(nome, email, senha, confirmarSenha);

    if (resultado.erro) {
      return NextResponse.json({ erro: resultado.erro }, { status: 400 });
    }

    const response = NextResponse.json({ usuario: resultado.usuario }, { status: 201 });
    response.cookies.set({ ...cookieOpcoes(), value: resultado.token! });
    return response;
  }

  // Login
  if (action === 'login') {
    const { email, senha } = body;
    const resultado = await authService.login(email, senha);

    if (resultado.erro) {
      return NextResponse.json({ erro: resultado.erro }, { status: 401 });
    }

    const response = NextResponse.json({ usuario: resultado.usuario }, { status: 200 });
    response.cookies.set({ ...cookieOpcoes(), value: resultado.token! });
    return response;
  }

  // Logout
  if (action === 'logout') {
    const response = NextResponse.json({ ok: true });
    response.cookies.set({ ...cookieOpcoes(), value: '', maxAge: 0 });
    return response;
  }

  // Solicitar recuperação de senha
  if (action === 'forgot-password') {
    const { email } = body;
    if (!email?.trim()) {
      return NextResponse.json({ erro: 'E-mail é obrigatório.' }, { status: 400 });
    }

    const resultado = await authService.solicitarRecuperacao(email);

    // Envia e-mail somente se encontrou usuário
    if (resultado.resetToken) {
      try {
        await enviarEmailRecuperacaoSenha(
          resultado.emailUsuario!,
          resultado.nomeUsuario!,
          resultado.resetToken
        );
      } catch {
        console.error('[MailService] Erro ao enviar e-mail de recuperação');
      }
    }

    return NextResponse.json({ ok: true });
  }

  // Redefinir senha
  if (action === 'reset-password') {
    const { token, novaSenha, confirmarSenha } = body;
    const resultado = await authService.redefinirSenha(token, novaSenha, confirmarSenha);

    if (resultado.erro) {
      return NextResponse.json({ erro: resultado.erro }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ erro: 'Ação inválida.' }, { status: 400 });
}

// GET /api/auth — retorna usuário atual
export async function GET(req: NextRequest) {
  const token = req.cookies.get('rekly_token')?.value;
  if (!token) return NextResponse.json({ usuario: null });

  const usuario = await authService.getUsuarioDoToken(token);
  if (!usuario) return NextResponse.json({ usuario: null });

  return NextResponse.json({
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  });
}
