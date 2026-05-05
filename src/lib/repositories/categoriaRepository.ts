import { prisma } from '../prisma'

// Categorias padrão inseridas no banco na primeira execução
export const CATEGORIAS_PADRAO = [
  'Streaming', 'Educação', 'Saúde', 'Software', 'Academia',
  'Jogos', 'Música', 'Notícias', 'Armazenamento', 'Outros',
]

export async function ensureCategoriasPadrao() {
  for (const nome of CATEGORIAS_PADRAO) {
    await prisma.categoria.upsert({
      where: { nome_usuario_unique: { nome, usuario_id: null as unknown as number } },
      update: {},
      create: { nome, is_padrao: true, usuario_id: null },
    }).catch(() => {
      // fallback: cria sem upsert se constraint não existir ainda
    })
  }
}

export async function findAllByUsuario(usuarioId: number) {
  return prisma.categoria.findMany({
    where: { OR: [{ is_padrao: true }, { usuario_id: usuarioId }] },
    orderBy: [{ is_padrao: 'desc' }, { nome: 'asc' }],
  })
}

export async function findById(id: number) {
  return prisma.categoria.findUnique({ where: { id } })
}

export async function findByNomeEUsuario(nome: string, usuarioId: number) {
  return prisma.categoria.findFirst({
    where: {
      nome: { equals: nome, mode: 'insensitive' },
      OR: [{ is_padrao: true }, { usuario_id: usuarioId }],
    },
  })
}

export async function create(nome: string, usuarioId: number) {
  return prisma.categoria.create({ data: { nome, is_padrao: false, usuario_id: usuarioId } })
}

export async function update(id: number, nome: string) {
  return prisma.categoria.update({ where: { id }, data: { nome } })
}

export async function remove(id: number) {
  return prisma.categoria.delete({ where: { id } })
}

export async function hasAssinaturas(id: number) {
  const count = await prisma.assinatura.count({ where: { categoria_id: id } })
  return count > 0
}
