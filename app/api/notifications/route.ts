import { NextRequest, NextResponse } from 'next/server'
import { getSessao } from '@/src/lib/auth'
import { buscarPreferencias, salvarPreferencias } from '@/src/lib/services/notificacaoService'

export async function GET() {
  const sessao = await getSessao()
  if (!sessao) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })

  const preferencias = await buscarPreferencias(sessao.id)
  return NextResponse.json({ preferencias })
}

export async function PUT(req: NextRequest) {
  const sessao = await getSessao()
  if (!sessao) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })

  const body = await req.json().catch(() => ({}))

  const { notificar_vencimento, notificar_atraso, dias_antecedencia } = body

  if (
    typeof notificar_vencimento !== 'boolean' ||
    typeof notificar_atraso !== 'boolean' ||
    typeof dias_antecedencia !== 'number'
  ) {
    return NextResponse.json(
      { erro: 'Dados inválidos. Esperado: notificar_vencimento (bool), notificar_atraso (bool), dias_antecedencia (number).' },
      { status: 400 }
    )
  }

  const preferencias = await salvarPreferencias(sessao.id, {
    notificar_vencimento,
    notificar_atraso,
    dias_antecedencia,
  })

  return NextResponse.json({ preferencias })
}
