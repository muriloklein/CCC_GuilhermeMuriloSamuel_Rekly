import nodemailer from 'nodemailer'

function criarTransporter() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 587),
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  })
}

export async function enviarEmailRecuperacaoSenha(
  para: string,
  nome: string,
  token: string
) {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const link = `${appUrl}/reset-password?token=${token}`
  const transporter = criarTransporter()

  await transporter.sendMail({
    from: `"Rekly" <${process.env.MAIL_USER}>`,
    to: para,
    subject: 'Rekly — Redefinição de senha',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#4F46E5">Rekly</h2>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p style="margin:24px 0">
          <a href="${link}"
             style="background:#4F46E5;color:#fff;padding:12px 24px;
                    border-radius:6px;text-decoration:none;font-weight:bold">
            Redefinir senha
          </a>
        </p>
        <p>Este link expira em <strong>30 minutos</strong>.</p>
        <p style="color:#888;font-size:13px">
          Se você não solicitou a redefinição, ignore este e-mail.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin-top:32px"/>
        <p style="color:#aaa;font-size:12px">Rekly — Controle de assinaturas pessoais</p>
      </div>
    `,
  })
}

export async function enviarEmailVencimento(
  para: string,
  nome: string,
  nomeServico: string,
  dataVencimento: Date,
  diasRestantes: number
) {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const transporter = criarTransporter()

  const dataFormatada = dataVencimento.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const labelDias =
    diasRestantes === 0
      ? 'vence <strong>hoje</strong>'
      : diasRestantes === 1
        ? 'vence <strong>amanhã</strong>'
        : `vence em <strong>${diasRestantes} dias</strong>`

  await transporter.sendMail({
    from: `"Rekly" <${process.env.MAIL_USER}>`,
    to: para,
    subject: `Rekly — Lembrete: ${nomeServico} ${labelDias.replace(/<[^>]+>/g, '')}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#4F46E5">Rekly</h2>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>
          Sua assinatura <strong>${nomeServico}</strong> ${labelDias}.
        </p>
        <div style="background:#F0F0FF;border-left:4px solid #4F46E5;padding:12px 16px;border-radius:4px;margin:20px 0">
          <p style="margin:0;font-size:14px;color:#3730A3">
            📅 Data de vencimento: <strong>${dataFormatada}</strong>
          </p>
        </div>
        <p style="font-size:14px;color:#555">
          Acesse o Rekly para verificar seus pagamentos e manter o controle das suas assinaturas.
        </p>
        <p style="margin:24px 0">
          <a href="${appUrl}/dashboard"
             style="background:#4F46E5;color:#fff;padding:12px 24px;
                    border-radius:6px;text-decoration:none;font-weight:bold">
            Ver no Rekly
          </a>
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin-top:32px"/>
        <p style="color:#aaa;font-size:12px">
          Rekly — Controle de assinaturas pessoais<br/>
          Para parar de receber alertas, acesse Notificações nas configurações.
        </p>
      </div>
    `,
  })
}

export async function enviarEmailAtraso(
  para: string,
  nome: string,
  nomeServico: string,
  diaCobranca: number,
  diasAtraso: number
) {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const transporter = criarTransporter()

  await transporter.sendMail({
    from: `"Rekly" <${process.env.MAIL_USER}>`,
    to: para,
    subject: `Rekly — Pagamento em atraso: ${nomeServico}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#4F46E5">Rekly</h2>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>
          Identificamos que o pagamento da assinatura <strong>${nomeServico}</strong>
          está em atraso.
        </p>
        <div style="background:#FFF7ED;border-left:4px solid #F97316;padding:12px 16px;border-radius:4px;margin:20px 0">
          <p style="margin:0;font-size:14px;color:#C2410C">
            ⚠️ Vencia no dia <strong>${diaCobranca}</strong> —
            <strong>${diasAtraso} dia(s) em atraso</strong>
          </p>
        </div>
        <p style="font-size:14px;color:#555">
          Se você já realizou o pagamento, acesse o Rekly e registre-o para manter seu histórico atualizado.
        </p>
        <p style="margin:24px 0">
          <a href="${appUrl}/payments"
             style="background:#F97316;color:#fff;padding:12px 24px;
                    border-radius:6px;text-decoration:none;font-weight:bold">
            Registrar pagamento
          </a>
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin-top:32px"/>
        <p style="color:#aaa;font-size:12px">
          Rekly — Controle de assinaturas pessoais<br/>
          Para parar de receber alertas, acesse Notificações nas configurações.
        </p>
      </div>
    `,
  })
}
