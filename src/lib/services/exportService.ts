import { prisma } from '../prisma'
import { calcularMensalidade, calcularCustoReal } from './assinaturaService'

export interface DadosExportacao {
  exportadoEm: string
  versao: string
  perfil: {
    id: number
    nome: string
    email: string
    criadoEm: string
  }
  categorias: {
    id: number
    nome: string
    personalizada: boolean
    criadaEm?: string
  }[]
  assinaturas: {
    id: number
    nomeServico: string
    categoria: string
    valor: number
    mensalidadeEquivalente: number
    moeda: string
    periodo: string
    dataInicio: string
    diaCobranca: number
    status: string
    participantes: number
    custoRealIndividual: number
    cadastradaEm: string
    pagamentos: {
      id: number
      valor: number
      dataPagamento: string
      status: string
    }[]
  }[]
  resumo: {
    totalAssinaturas: number
    assinaturasAtivas: number
    totalPagamentos: number
    totalGastoHistorico: number
  }
}

export async function exportarDadosUsuario(usuarioId: number): Promise<DadosExportacao> {
  const [usuario, categorias, assinaturas] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: usuarioId } }),
    prisma.categoria.findMany({
      where: { OR: [{ is_padrao: false, usuario_id: usuarioId }] },
      orderBy: { nome: 'asc' },
    }),
    prisma.assinatura.findMany({
      where: { usuario_id: usuarioId },
      include: {
        categoria: true,
        pagamentos: { orderBy: { data_pagamento: 'desc' } },
      },
      orderBy: { criado_em: 'desc' },
    }),
  ])

  if (!usuario) throw new Error('Usuário não encontrado.')

  const totalPagamentos = assinaturas.reduce((s, a) => s + a.pagamentos.length, 0)
  const totalGasto = assinaturas.reduce(
    (s, a) => s + a.pagamentos.filter(p => p.status === 'pago').reduce((sp, p) => sp + Number(p.valor), 0),
    0
  )

  return {
    exportadoEm: new Date().toISOString(),
    versao: '1.0',
    perfil: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      criadoEm: usuario.criado_em.toISOString(),
    },
    categorias: categorias.map(c => ({
      id: c.id,
      nome: c.nome,
      personalizada: !c.is_padrao,
    })),
    assinaturas: assinaturas.map(a => {
      const valor = Number(a.valor)
      return {
        id: a.id,
        nomeServico: a.nome_servico,
        categoria: a.categoria.nome,
        valor,
        mensalidadeEquivalente: calcularMensalidade(valor, a.periodo),
        moeda: a.moeda,
        periodo: a.periodo,
        dataInicio: a.data_inicio.toISOString(),
        diaCobranca: a.dia_cobranca,
        status: a.status,
        participantes: a.participantes,
        custoRealIndividual: calcularCustoReal(valor, a.periodo, a.participantes),
        cadastradaEm: a.criado_em.toISOString(),
        pagamentos: a.pagamentos.map(p => ({
          id: p.id,
          valor: Number(p.valor),
          dataPagamento: p.data_pagamento.toISOString(),
          status: p.status,
        })),
      }
    }),
    resumo: {
      totalAssinaturas: assinaturas.length,
      assinaturasAtivas: assinaturas.filter(a => a.status === 'ativo').length,
      totalPagamentos,
      totalGastoHistorico: totalGasto,
    },
  }
}

export function converterParaCSV(dados: DadosExportacao): string {
  const linhas: string[] = []

  linhas.push('=== REKLY - EXPORTAÇÃO DE DADOS PESSOAIS ===')
  linhas.push(`Exportado em:,${new Date(dados.exportadoEm).toLocaleString('pt-BR')}`)
  linhas.push('')

  linhas.push('=== PERFIL ===')
  linhas.push('Nome,E-mail,Membro desde')
  linhas.push(`${dados.perfil.nome},${dados.perfil.email},${new Date(dados.perfil.criadoEm).toLocaleDateString('pt-BR')}`)
  linhas.push('')

  linhas.push('=== RESUMO ===')
  linhas.push('Total de assinaturas,Assinaturas ativas,Total de pagamentos,Total gasto (pago)')
  linhas.push(
    `${dados.resumo.totalAssinaturas},${dados.resumo.assinaturasAtivas},${dados.resumo.totalPagamentos},` +
    `${dados.resumo.totalGastoHistorico.toFixed(2)}`
  )
  linhas.push('')

  linhas.push('=== ASSINATURAS ===')
  linhas.push('Nome do serviço,Categoria,Valor,Moeda,Período,Mensalidade equiv.,Participantes,Custo real,Status,Data início,Dia cobrança,Cadastrada em')
  for (const a of dados.assinaturas) {
    linhas.push(
      `"${a.nomeServico}","${a.categoria}",${a.valor},${a.moeda},${a.periodo},` +
      `${a.mensalidadeEquivalente.toFixed(2)},${a.participantes},${a.custoRealIndividual.toFixed(2)},` +
      `${a.status},${new Date(a.dataInicio).toLocaleDateString('pt-BR')},${a.diaCobranca},` +
      `${new Date(a.cadastradaEm).toLocaleDateString('pt-BR')}`
    )
  }
  linhas.push('')

  linhas.push('=== HISTÓRICO DE PAGAMENTOS ===')
  linhas.push('Assinatura,Valor,Data,Status')
  for (const a of dados.assinaturas) {
    for (const p of a.pagamentos) {
      linhas.push(
        `"${a.nomeServico}",${p.valor},${new Date(p.dataPagamento).toLocaleDateString('pt-BR')},${p.status}`
      )
    }
  }

  return linhas.join('\n')
}