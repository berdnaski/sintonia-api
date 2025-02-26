import { sintoniaConfig } from "../../../config/api";

export const RecoveryMailTemplate = (name: string, token: string) => {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperação de Senha</title>
    </head>
    <body style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
      <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Cabeçalho -->
              <tr>
                <td style="padding: 20px; text-align: center; background-color: #007bff; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${sintoniaConfig.product}</h1>
                </td>
              </tr>
              <!-- Corpo -->
              <tr>
                <td style="padding: 40px 20px; text-align: center;">
                  <h2 style="color: #333333; font-size: 20px; margin: 0 0 20px;">Olá ${name},</h2>
                  <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 20px;">Recebemos uma solicitação para redefinir a senha da sua conta no ${sintoniaConfig.product}. Se você não solicitou a redefinição da senha, ignore este e-mail.</p>
                  <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 20px;">Caso tenha sido você, clique no botão abaixo para redefinir sua senha:</p>
                  <a href="${sintoniaConfig.frontend}/users/password-reset/${token}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">Redefinir Senha</a>
                  <p style="color: #666666; font-size: 14px; margin: 20px 0 0;">O link acima expira em 1 hora.</p>
                </td>
              </tr>
              <!-- Rodapé -->
              <tr>
                <td style="padding: 20px; text-align: center; background-color: #f4f4f4; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                  <p style="color: #999999; font-size: 12px; margin: 0;">Atenciosamente,</p>
                  <p style="color: #999999; font-size: 12px; margin: 0;">Time ${sintoniaConfig.product}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};