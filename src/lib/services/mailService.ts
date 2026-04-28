import nodemailer from 'nodemailer';

function criarTransporter() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 587),
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

export async function enviarEmailRecuperacaoSenha(
  para: string,
  nome: string,
  token: string
) {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
  const link = `${appUrl}/reset-password?token=${token}`;

  const transporter = criarTransporter();

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
  });
}
