import { prisma } from '../prisma';

// Buscar por email
export async function findByEmail(email: string) {
  return prisma.usuario.findUnique({ where: { email } });
}

// Buscar por id
export async function findById(id: number) {
  return prisma.usuario.findUnique({ where: { id } });
}

//Criar usuário + preferências de notificação padrão
export async function createUsuario(data: {
  nome: string;
  email: string;
  senhaHash: string;
}) {
  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: data.senhaHash,
      },
    });

    await tx.preferenciaNotificacao.create({
      data: {
        usuario_id: usuario.id,
        notificar_vencimento: true,
        notificar_atraso: true,
      },
    });

    await tx.log.create({
      data: {
        usuario_id: usuario.id,
        acao: 'CADASTRO',
        tabela_afetada: 'usuarios',
        registro_id: usuario.id,
      },
    });

    return usuario;
  });
}

// Atualizar senha
export async function updateSenha(id: number, senhaHash: string) {
  return prisma.usuario.update({
    where: { id },
    data: { senha: senhaHash },
  });
}

// Registrar log de ação
export async function registrarLog(
  usuarioId: number | null,
  acao: string,
  tabelaAfetada?: string,
  registroId?: number
) {
  return prisma.log.create({
    data: {
      usuario_id: usuarioId,
      acao,
      tabela_afetada: tabelaAfetada,
      registro_id: registroId,
    },
  });
}
