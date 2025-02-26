import { sintoniaConfig } from "../../../config/api";

export const InviteToCoupleMailTemplate = (name: string, inviterName: string, token: string) => {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Um Convite Especial para Você</title>
    </head>
    <body style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
      <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Cabeçalho -->
              <tr>
                <td style="padding: 20px; text-align: center; background-color: #ff6f61; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${sintoniaConfig.product}</h1>
                </td>
              </tr>
              <!-- Corpo -->
              <tr>
                <td style="padding: 40px 20px; text-align: center;">
                  <h2 style="color: #333333; font-size: 20px; margin: 0 0 20px;">Querido(a) ${name},</h2>
                  <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 20px;">É com muito carinho que ${inviterName} te convida para viverem juntos uma aventura especial no ${sintoniaConfig.product}! Que tal embarcar nessa jornada cheia de amor e momentos inesquecíveis?</p>
                  <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 20px;">Se o seu coração diz sim, é só clicar no botão abaixo para aceitar esse convite tão especial.</p>
                  <a href="${sintoniaConfig.frontend}/couple/accept/${token} " style="display: inline-block; padding: 12px 24px; background-color: #ff6f61; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">Sim, quero fazer parte!</a>
                  <p style="color: #666666; font-size: 14px; margin: 20px 0 0;">O link acima expira em 1 dia.</p>
                  <p style="color: #666666; font-size: 14px; margin: 10px 0 0;">Se preferir, pode ignorar este e-mail sem problema algum!</p>
                </td>
              </tr>
              <!-- Rodapé -->
              <tr>
                <td style="padding: 20px; text-align: center; background-color: #f4f4f4; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                  <p style="color: #999999; font-size: 12px; margin: 0;">Com todo o carinho,</p>
                  <p style="color: #999999; font-size: 12px; margin: 0;">Time ${sintoniaConfig.product}</p>
                  <p style="color: #999999; font-size: 12px; margin: 10px 0 0;">Mal podemos esperar para ver o começo dessa história linda!</p>
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