import { NextRequest, NextResponse } from 'next/server'
import { processarNotificacoes } from '@/src/lib/services/notificacaoService'

/*
 * Exemplo de chamada:
 *   curl -X POST https://rekly.vercel.app/api/notifications/trigger \
 *        -H "Authorization: Bearer SECRET"
 * Exemplo de Vercel Cron (vercel.json):
 *   { "crons": [{ "path": "/api/notifications/trigger", "schedule": "0 8 * * *" }] }
 */
export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET

  // Em produção, exige o secret; em dev, permite sem auth para facilitar testes
  if (process.env.NODE_ENV === 'production') {
    if (!cronSecret) {
      return NextResponse.json(
        { erro: 'CRON_SECRET não configurado no servidor.' },
        { status: 500 }
      )
    }

    const authHeader = req.headers.get('authorization') ?? ''
    const token = authHeader.replace('Bearer ', '').trim()

    if (token !== cronSecret) {
      return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
    }
  }

  try {
    const resultado = await processarNotificacoes()
    return NextResponse.json({
      ok: true,
      enviados: resultado.enviados,
      erros: resultado.erros,
      executado_em: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[notificações/trigger] Erro inesperado:', err)
    return NextResponse.json({ erro: 'Erro interno ao processar notificações.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return POST(req)
}
