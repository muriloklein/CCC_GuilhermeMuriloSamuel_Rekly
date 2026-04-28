'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [form, setForm] = useState({ novaSenha: '', confirmarSenha: '' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!token) setErro('Link inválido. Solicite uma nova recuperação de senha.');
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (form.novaSenha !== form.confirmarSenha) {
      setErro('As senhas não conferem.');
      return;
    }
    if (form.novaSenha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-password', token, ...form }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro ?? 'Erro ao redefinir senha.');
        return;
      }

      setSucesso(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-600">Rekly</h1>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">Redefinir senha</h2>

        {sucesso ? (
          <div className="rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
            Senha redefinida com sucesso! Redirecionando para o login...
          </div>
        ) : (
          <>
            {erro && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {erro}
              </div>
            )}

            {token && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
                  <input
                    type="password"
                    required
                    value={form.novaSenha}
                    onChange={(e) => setForm((f) => ({ ...f, novaSenha: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
                  <input
                    type="password"
                    required
                    value={form.confirmarSenha}
                    onChange={(e) => setForm((f) => ({ ...f, confirmarSenha: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-sm transition disabled:opacity-60"
                >
                  {carregando ? 'Salvando...' : 'Salvar nova senha'}
                </button>
              </form>
            )}

            <p className="text-center text-sm text-gray-500 mt-6">
              <Link href="/forgot-password" className="text-indigo-600 hover:underline">
                Solicitar novo link
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
