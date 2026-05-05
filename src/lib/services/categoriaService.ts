import * as repo from '../repositories/categoriaRepository'
import { registrarLog } from '../repositories/usuarioRepository'

export async function listar(usuarioId: number) {
  return repo.findAllByUsuario(usuarioId)
}

export async function criar(nome: string, usuarioId: number) {
  if (!nome?.trim()) return { erro: 'Nome da categoria é obrigatório.' }

  const duplicada = await repo.findByNomeEUsuario(nome.trim(), usuarioId)
  if (duplicada) return { erro: 'Já existe uma categoria com esse nome.' }

  const categoria = await repo.create(nome.trim(), usuarioId)
  await registrarLog(usuarioId, 'CRIAR_CATEGORIA', 'categorias', categoria.id)
  return { categoria }
}

export async function editar(id: number, nome: string, usuarioId: number) {
  if (!nome?.trim()) return { erro: 'Nome da categoria é obrigatório.' }

  const atual = await repo.findById(id)
  if (!atual) return { erro: 'Categoria não encontrada.' }
  if (atual.is_padrao) return { erro: 'Categorias padrão não podem ser editadas.' }
  if (atual.usuario_id !== usuarioId) return { erro: 'Sem permissão.' }

  const duplicada = await repo.findByNomeEUsuario(nome.trim(), usuarioId)
  if (duplicada && duplicada.id !== id) return { erro: 'Já existe uma categoria com esse nome.' }

  const categoria = await repo.update(id, nome.trim())
  await registrarLog(usuarioId, 'EDITAR_CATEGORIA', 'categorias', id)
  return { categoria }
}

export async function excluir(id: number, usuarioId: number) {
  const atual = await repo.findById(id)
  if (!atual) return { erro: 'Categoria não encontrada.' }
  if (atual.is_padrao) return { erro: 'Categorias padrão não podem ser excluídas.' }
  if (atual.usuario_id !== usuarioId) return { erro: 'Sem permissão.' }

  const temAssinaturas = await repo.hasAssinaturas(id)
  if (temAssinaturas) return { erro: 'Não é possível excluir: categoria vinculada a assinaturas.' }

  await repo.remove(id)
  await registrarLog(usuarioId, 'EXCLUIR_CATEGORIA', 'categorias', id)
  return { ok: true }
}
