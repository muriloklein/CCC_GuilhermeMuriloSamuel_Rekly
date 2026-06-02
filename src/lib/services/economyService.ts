import { prisma } from '../prisma'

export type TipoSugestao = 'sobreposicao' | 'desuso'

export interface SugestaoDTO {
  id: number
  assinaturaId: number
  nomeServico: string
  categoria: string
  tipo: TipoSugestao
  descricao: string
  dispensada: boolean
  criadoEm: string
}

// Recalcular todas as sugestões do usuário
// Chamado após criar, editar, cancelar assinatura ou registrar pagamento.
export async function recalcularSugestoes(usuarioId: number): Promise<void> {
  // Busca todas as assinaturas ativas com seus pagamentos e categorias
  const assinaturas = await prisma.assinatura.findMany({
    where: { usuario_id: usuarioId, status: { in: ['ativo', 'teste'] } },
    include: {
      categoria: true,
      pagamentos: { orderBy: { data_pagamento: 'desc' }, take: 1 },
    },
  })

  const novasSugestoes: { assinaturaId: number; tipo: TipoSugestao; descricao: string }[] = []

  // Detectar sobreposição 2+ assinaturas ativas na mesma categoria
  const porCategoria = new Map<number, typeof assinaturas>()
  for (const a of assinaturas) {
    const lista = porCategoria.get(a.categoria_id) ?? []
    lista.push(a)
    porCategoria.set(a.categoria_id, lista)
  }

  for (const [, lista] of porCategoria) {
    if (lista.length < 2) continue
    const nomes = lista.map(a => a.nome_servico).join(', ')
    for (const a of lista) {
      const outrosNomes = lista
        .filter(x => x.id !== a.id)
        .map(x => x.nome_servico)
        .join(', ')
      novasSugestoes.push({
        assinaturaId: a.id,
        tipo: 'sobreposicao',
        descricao: `Você tem ${lista.length} assinaturas ativas na categoria "${a.categoria.nome}": ${nomes}. Considere cancelar alguma delas. (Sobreposição com: ${outrosNomes})`,
      })
    }
  }

  // Detectar desuso, ativa sem pagamento nos últimos 60 dias
  const limite60dias = new Date()
  limite60dias.setDate(limite60dias.getDate() - 60)

  for (const a of assinaturas) {
    const ultimoPagamento = a.pagamentos[0]
    const semPagamentoRecente =
      !ultimoPagamento || new Date(ultimoPagamento.data_pagamento) < limite60dias

    if (semPagamentoRecente) {
      novasSugestoes.push({
        assinaturaId: a.id,
        tipo: 'desuso',
        descricao: `"${a.nome_servico}" não tem pagamento registrado nos últimos 60 dias. Verifique se ainda está sendo utilizado.`,
      })
    }
  }

  // Busca sugestões dispensadas para preservar o estado
  const dispensadas = await prisma.sugestaoEconomia.findMany({
    where: { usuario_id: usuarioId, dispensada: true },
    select: { assinatura_id: true, tipo: true },
  })
  const dispensadasSet = new Set(dispensadas.map(d => `${d.assinatura_id}:${d.tipo}`))

  // Remove sugestões antigas não dispensadas e cria as novas
  await prisma.$transaction(async (tx) => {
    // Remove apenas as não dispensadas (as dispensadas são mantidas conforme DVP)
    await tx.sugestaoEconomia.deleteMany({
      where: { usuario_id: usuarioId, dispensada: false },
    })

    // Cria as novas sugestões, pulando as que o usuário já dispensou
    for (const s of novasSugestoes) {
      const chave = `${s.assinaturaId}:${s.tipo}`
      if (dispensadasSet.has(chave)) continue // mantém a dispensa, não recria

      await tx.sugestaoEconomia.create({
        data: {
          usuario_id: usuarioId,
          assinatura_id: s.assinaturaId,
          tipo: s.tipo,
          descricao: s.descricao,
          dispensada: false,
          exibida: true,
        },
      })
    }

    // Remove dispensadas cuja condição não existe mais
    // (ex.: sobreposição resolvida, uma assinatura foi cancelada)
    const idsAtivos = new Set(assinaturas.map(a => a.id))
    const idsNovasSugestoes = new Set(novasSugestoes.map(s => `${s.assinaturaId}:${s.tipo}`))

    const todasDispensadas = await tx.sugestaoEconomia.findMany({
      where: { usuario_id: usuarioId, dispensada: true },
      select: { id: true, assinatura_id: true, tipo: true },
    })

    for (const d of todasDispensadas) {
      const chave = `${d.assinatura_id}:${d.tipo}`
      const assinaturaAindaAtiva = idsAtivos.has(d.assinatura_id)
      const condicaoAindaExiste = idsNovasSugestoes.has(chave)

      if (!assinaturaAindaAtiva || !condicaoAindaExiste) {
        await tx.sugestaoEconomia.delete({ where: { id: d.id } })
      }
    }
  })
}

// Listar sugestões ativas (não dispensadas)
export async function listarSugestoes(usuarioId: number): Promise<SugestaoDTO[]> {
  const sugestoes = await prisma.sugestaoEconomia.findMany({
    where: { usuario_id: usuarioId, dispensada: false, exibida: true },
    include: { assinatura: { include: { categoria: true } } },
    orderBy: { criado_em: 'desc' },
  })

  return sugestoes.map(s => ({
    id: s.id,
    assinaturaId: s.assinatura_id,
    nomeServico: s.assinatura.nome_servico,
    categoria: s.assinatura.categoria.nome,
    tipo: s.tipo as TipoSugestao,
    descricao: s.descricao,
    dispensada: s.dispensada,
    criadoEm: s.criado_em.toISOString(),
  }))
}

// Dispensar sugestão
export async function dispensarSugestao(
  sugestaoId: number,
  usuarioId: number
): Promise<{ ok: boolean; erro?: string }> {
  const sugestao = await prisma.sugestaoEconomia.findFirst({
    where: { id: sugestaoId, usuario_id: usuarioId },
  })

  if (!sugestao) return { ok: false, erro: 'Sugestão não encontrada.' }
  if (sugestao.dispensada) return { ok: false, erro: 'Sugestão já foi dispensada.' }

  await prisma.sugestaoEconomia.update({
    where: { id: sugestaoId },
    data: { dispensada: true, exibida: false },
  })

  return { ok: true }
}