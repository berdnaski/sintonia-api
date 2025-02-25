import { sintoniaConfig } from "../../../config/api"

export const RecoveryMailTemplate = (name: string, token: string) => {
  return `
    <h1>Olá ${name},</h1>
    <Se>Recebemos uma solicitação para redefinir a senha da sua conta no ${sintoniaConfig.product}. Se você não solicitou a redefinição da senha, ignore este e-mail.</p>
    <p>Caso tenha sido você, clique no link abaixo:</p>
    <a href="${sintoniaConfig.frontend}/auth/password-reset/${token}">Redefinir Senha</a>
    <p>O link acima expira em 1 hora.</p>
    <p>Atenciosamente</p>
    <p>Time ${sintoniaConfig.product}.</p>
  `
}