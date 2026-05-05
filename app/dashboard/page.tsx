import { getSessao } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const sessao = await getSessao()
  if (!sessao) redirect('/login')

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-semibold text-gray-800 mb-1">Olá, {sessao.nome} 👋</h2>
      <p className="text-gray-400 text-sm mb-8">Bem-vindo ao Rekly. Gerencie suas assinaturas abaixo.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Assinaturas ativas', valor: '—', cor: 'text-indigo-600' },
          { label: 'Gasto mensal', valor: '—', cor: 'text-emerald-600' },
          { label: 'Vencimentos próximos', valor: '—', cor: 'text-amber-600' },
        ].map(({ label, valor, cor }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${cor}`}>{valor}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/subscriptions"
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-5 transition flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg">Assinaturas</p>
            <p className="text-indigo-200 text-sm">Cadastre e gerencie seus serviços</p>
          </div>
          <span className="text-3xl">📋</span>
        </Link>
        <Link href="/categories"
          className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-5 transition flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg text-gray-800">Categorias</p>
            <p className="text-gray-400 text-sm">Organize por tipo de serviço</p>
          </div>
          <span className="text-3xl">🏷️</span>
        </Link>
      </div>
    </div>
  )
}
