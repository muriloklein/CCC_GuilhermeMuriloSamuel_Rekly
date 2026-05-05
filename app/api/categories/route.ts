import { NextRequest, NextResponse } from 'next/server'
import { getSessao } from '@/src/lib/auth'
import * as svc from '@/src/lib/services/categoriaService'
import * as repo from '@/src/lib/repositories/categoriaRepository'

async function auth() {
  const sessao = await getSessao()
  if (!sessao) return null
  return sessao
}

// GET /api/categories — lista categorias do usuário (padrão + personalizadas)
export async function GET() {
  const sessao = await auth()
  if (!sessao) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })

  // Garante que as categorias padrão existem no banco
  await repo.ensureCategoriasPadrao().catch(() => {})

  const categorias = await svc.listar(sessao.id)
  return NextResponse.json({ categorias })
}

// POST /api/categories — criar categoria personalizada
export async function POST(req: NextRequest) {
  const sessao = await auth()
  if (!sessao) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const resultado = await svc.criar(body.nome, sessao.id)

  if (resultado.erro) return NextResponse.json({ erro: resultado.erro }, { status: 400 })
  return NextResponse.json({ categoria: resultado.categoria }, { status: 201 })
}

// PUT /api/categories — editar categoria personalizada
export async function PUT(req: NextRequest) {
  const sessao = await auth()
  if (!sessao) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  if (!body.id) return NextResponse.json({ erro: 'ID é obrigatório.' }, { status: 400 })

  const resultado = await svc.editar(Number(body.id), body.nome, sessao.id)
  if (resultado.erro) return NextResponse.json({ erro: resultado.erro }, { status: 400 })
  return NextResponse.json({ categoria: resultado.categoria })
}

// DELETE /api/categories?id=X — excluir categoria personalizada
export async function DELETE(req: NextRequest) {
  const sessao = await auth()
  if (!sessao) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })

  const id = Number(req.nextUrl.searchParams.get('id'))
  if (!id) return NextResponse.json({ erro: 'ID é obrigatório.' }, { status: 400 })

  const resultado = await svc.excluir(id, sessao.id)
  if (resultado.erro) return NextResponse.json({ erro: resultado.erro }, { status: 400 })
  return NextResponse.json({ ok: true })
}
