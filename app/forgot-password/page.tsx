'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forgot-password', email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro ?? 'Erro ao processar solicitação.');
        return;
      }

      setEnviado(true);
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

        <h2 className="text-xl font-semibold text-gray-800 mb-2">Recuperar senha</h2>

        {enviado ? (
          <div className="mt-4">
            <div className="rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm mb-4">
              Se este e-mail estiver cadastrado, você receberá um link de redefinição em breve.
            </div>
            <Link href="/login" className="text-indigo-600 hover:underline text-sm">
              ← Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Informe seu e-mail e enviaremos um link para redefinição de senha.
            </p>

            {erro && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {erro}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="seu@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-sm transition disabled:opacity-60"
              >
                {carregando ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              <Link href="/login" className="text-indigo-600 hover:underline">
                ← Voltar para o login
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
