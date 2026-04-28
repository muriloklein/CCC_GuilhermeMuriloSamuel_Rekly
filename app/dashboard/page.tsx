import { getSessao } from '@/src/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from './LogoutButton';

export default async function DashboardPage() {
  const sessao = await getSessao();
  if (!sessao) redirect('/login');

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-600">Rekly</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Olá, <strong>{sessao.nome}</strong></span>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-500 text-sm mb-8">
          Bem-vindo ao Rekly! As próximas funcionalidades serão implementadas nas próximas entregas.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Assinaturas ativas', valor: '—', cor: 'indigo' },
            { label: 'Gasto mensal', valor: '—', cor: 'emerald' },
            { label: 'Vencimentos próximos', valor: '—', cor: 'amber' },
          ].map(({ label, valor, cor }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold text-${cor}-600`}>{valor}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
