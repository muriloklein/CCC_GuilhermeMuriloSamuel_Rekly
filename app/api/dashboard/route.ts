import { NextRequest, NextResponse } from 'next/server'
import { getSessao } from '@/src/lib/auth'
import * as svc from '@/src/lib/services/dashboardService'

async function auth() {
  const sessao = await getSessao()
  if (!sessao) return null
  return sessao
}

export async function GET(req: NextRequest) {
  const sessao = await auth()
  if (!sessao) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const hoje = new Date()
  const mes = searchParams.get('mes') ? Number(searchParams.get('mes')) : hoje.getMonth() + 1
  const ano = searchParams.get('ano') ? Number(searchParams.get('ano')) : hoje.getFullYear()
  const categoriaId = searchParams.get('categoriaId') ? Number(searchParams.get('categoriaId')) : undefined

  const dados = await svc.obterDadosDashboard(sessao.id, mes, ano, categoriaId)
  return NextResponse.json(dados)
}