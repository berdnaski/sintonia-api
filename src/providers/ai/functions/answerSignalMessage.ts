import { generateText, tool } from "ai"
import { z } from "zod"
import { deepseek } from ".."
import { PrismaAIResponseRepository } from "../../../repositories/ai-response-repository"
import { PrismaSignalRepository } from "../../../repositories/signal-repository"

interface AnswerSignalMessageParams {
  message: string,
  coupleId: string,
}

export async function AnswerSignalMessage({ message, coupleId }: AnswerSignalMessageParams) {
  const signalRepository = new PrismaSignalRepository()
  const aiResponseRepository = new PrismaAIResponseRepository()

  const answer = await generateText({
    model: deepseek,
    prompt: message,
    maxTokens: 5,
    temperature: 0.7,
    tools: {
      signalsFromDatabase: tool({
        description: `
        Realiza uma query no banco Postgres para buscar informações da tabela "signals" do banco de dados.

        Só pode realizar operações de busca (SELECT), não é permitido a geração de qualquer outra operação.
        `.trim(),
        parameters: z.object({}),
        execute: async () => {
          const result = signalRepository.findByCoupleId(coupleId)
          return JSON.stringify(result)
        }
      }),
      aiResponsesFromDatabase: tool({
        description: `
        Realiza uma query no banco Postgres para buscar informações da tabela "ai_responses" do banco de dados.
        
        Só pode realizar operações de busca (SELECT), não é permitido a geração de qualquer outra operação.
        `,
        parameters: z.object({}),
        execute: async () => {
          const result = aiResponseRepository.findByCoupleId(coupleId)
          return JSON.stringify(result)
        }
      }),
    },
    system: `Você é um assistente de IA especializado em análise de relacionamentos.
      Com base nos seguintes dados do casal (micro sinais e respostas anteriores),
      forneça um resumo atualizado do estado do relacionamento, conselhos para melhoria e,
      opcionalmente, um desafio para o casal.

      Responda em JSON com os campos "summary", "advice" e "challenge" (opcional).`
  })

  return { response: answer.text }
}