import { NextRequest, NextResponse } from 'next/server'
import { getSessao } from '@/src/lib/auth'
import { exportarDadosUsuario, converterParaCSV } from '@/src/lib/services/exportService'
import { prisma } from '@/src/lib/prisma'
import { registrarLog } from '@/src/lib/repositories/usuarioRepository'

async function auth() {
  const sessao = await getSessao()
  if (!sessao) return null
  return sessao
}

// GET /api/export?formato=json|csv
export async function GET(req: NextRequest) {
  const sessao = await auth()
  if (!sessao) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })

  const formato = req.nextUrl.searchParams.get('formato') ?? 'json'

  try {
    const dados = await exportarDadosUsuario(sessao.id)
    await registrarLog(sessao.id, 'EXPORTAR_DADOS_LGPD', 'usuarios', sessao.id)

    if (formato === 'csv') {
      const csv = converterParaCSV(dados)
      const nomeArquivo = `rekly_dados_${sessao.id}_${Date.now()}.csv`
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
        },
      })
    }

    const json = JSON.stringify(dados, null, 2)
    const nomeArquivo = `rekly_dados_${sessao.id}_${Date.now()}.json`
    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
      },
    })
  } catch (err) {
    console.error('[ExportService] Erro ao exportar dados:', err)
    return NextResponse.json({ erro: 'Erro ao gerar exportação.' }, { status: 500 })
  }
}

// DELETE /api/export
export async function DELETE() {
  const sessao = await auth()
  if (!sessao) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })

  try {
    await prisma.$transaction(async (tx) => {
      await tx.sugestaoEconomia.deleteMany({ where: { usuario_id: sessao.id } })
      await tx.notificacao.deleteMany({ where: { usuario_id: sessao.id } })
      await tx.preferenciaNotificacao.deleteMany({ where: { usuario_id: sessao.id } })
      await tx.log.deleteMany({ where: { usuario_id: sessao.id } })

      const assinaturas = await tx.assinatura.findMany({
        where: { usuario_id: sessao.id },
        select: { id: true },
      })
      const ids = assinaturas.map(a => a.id)
      if (ids.length > 0) {
        await tx.pagamento.deleteMany({ where: { assinatura_id: { in: ids } } })
      }

      await tx.assinatura.deleteMany({ where: { usuario_id: sessao.id } })
      await tx.categoria.deleteMany({ where: { usuario_id: sessao.id, is_padrao: false } })
      await tx.usuario.delete({ where: { id: sessao.id } })
    })

    const response = NextResponse.json({ ok: true })
    response.cookies.set({ name: 'rekly_token', value: '', maxAge: 0, path: '/' })
    return response
  } catch (err) {
    console.error('[ExportService] Erro ao excluir conta:', err)
    return NextResponse.json({ erro: 'Erro ao excluir conta.' }, { status: 500 })
  }
}