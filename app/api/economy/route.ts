import { NextRequest, NextResponse } from 'next/server'
import { getSessao } from '@/src/lib/auth'
import {
  listarSugestoes,
  dispensarSugestao,
  recalcularSugestoes,
} from '@/src/lib/services/economyService'

async function auth() {
  const sessao = await getSessao()
  if (!sessao) return null
  return sessao
}

// GET /api/economy lista sugestões ativas do usuário
export async function GET() {
  const sessao = await auth()
  if (!sessao) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })

  const sugestoes = await listarSugestoes(sessao.id)
  return NextResponse.json({ sugestoes })
}

// POST /api/economy recalcula sugestões manualmente
export async function POST() {
  const sessao = await auth()
  if (!sessao) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })

  await recalcularSugestoes(sessao.id)
  const sugestoes = await listarSugestoes(sessao.id)
  return NextResponse.json({ sugestoes })
}

// PATCH /api/economy dispensar sugestão individual
export async function PATCH(req: NextRequest) {
  const sessao = await auth()
  if (!sessao) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  if (!body.id) return NextResponse.json({ erro: 'ID da sugestão é obrigatório.' }, { status: 400 })

  const resultado = await dispensarSugestao(Number(body.id), sessao.id)
  if (!resultado.ok) return NextResponse.json({ erro: resultado.erro }, { status: 400 })

  return NextResponse.json({ ok: true })
}