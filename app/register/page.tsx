'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (form.senha !== form.confirmarSenha) {
      setErro('As senhas não conferem.');
      return;
    }

    if (form.senha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cadastrar', ...form }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro ?? 'Erro ao criar conta.');
        return;
      }

      router.push('/dashboard');
      router.refresh();
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
          <p className="text-gray-500 mt-1 text-sm">Controle de assinaturas pessoais</p>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">Criar conta</h2>

        {erro && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Nome completo', name: 'nome', type: 'text', placeholder: 'Seu nome', auto: 'name' },
            { label: 'E-mail', name: 'email', type: 'email', placeholder: 'seu@email.com', auto: 'email' },
            { label: 'Senha', name: 'senha', type: 'password', placeholder: 'Mínimo 8 caracteres', auto: 'new-password' },
            { label: 'Confirmar senha', name: 'confirmarSenha', type: 'password', placeholder: '••••••••', auto: 'new-password' },
          ].map(({ label, name, type, placeholder, auto }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                name={name}
                required
                autoComplete={auto}
                value={(form as Record<string, string>)[name]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={placeholder}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-sm transition disabled:opacity-60"
          >
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
