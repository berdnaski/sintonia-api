import { generateText, tool } from "ai";
import { z } from "zod";
import { deepseek } from "..";
import { PrismaAIResponseRepository } from "../../../repositories/ai-response-repository";
import { PrismaSignalRepository } from "../../../repositories/signal-repository";
import { PrismaQuestionRepository } from "../../../repositories/question-repository";

interface DailySummaryParams {
  coupleId: string;
}

const tools = {
  signalsFromDatabase: tool({
    description: "Busca sinais recentes do casal.",
    parameters: z.object({ coupleId: z.string() }),
    execute: async ({ coupleId }) => {
      const signalRepository = new PrismaSignalRepository();
      const signals = await signalRepository.findByCoupleId(coupleId, { perPage: 30 });
      return JSON.stringify(signals.data);
    }
  }),

  aiResponsesFromDatabase: tool({
    description: "Busca respostas da IA anteriores.",
    parameters: z.object({ coupleId: z.string() }),
    execute: async ({ coupleId }) => {
      const aiResponseRepository = new PrismaAIResponseRepository();
      const responses = await aiResponseRepository.findByCoupleId(coupleId, { perPage: 30 });
      return JSON.stringify(responses.data);
    }
  }),

  questionsFromDatabase: tool({
    description: "Busca perguntas e respostas anteriores.",
    parameters: z.object({ coupleId: z.string() }),
    execute: async ({ coupleId }) => {
      const questionRepository = new PrismaQuestionRepository();
      const questions = await questionRepository.findOne(coupleId);
      return JSON.stringify(questions);
    }
  }),
};

export async function GenerateDailySummary({ coupleId }: DailySummaryParams) {
  try {
    const signalsResult = await tools.signalsFromDatabase.execute({ coupleId }, { toolCallId: "signals", messages: [] });
    const responsesResult = await tools.aiResponsesFromDatabase.execute({ coupleId }, { toolCallId: "ai", messages: [] });
    const questionsResult = await tools.questionsFromDatabase.execute({ coupleId }, { toolCallId: "questions", messages: [] });

    const summaryResponse = await generateText({
      model: deepseek,
      prompt: `
        Você é um assistente de IA focado em relacionamentos.
        Com base nos dados a seguir, gere um resumo diário para o casal, contendo insights e observações sobre o relacionamento.

        Dados:
        - Sinais recentes: ${signalsResult || '[]'}
        - Respostas da IA anteriores: ${responsesResult || '[]'}
        - Perguntas/respostas anteriores: ${questionsResult || '[]'}

        Instruções:
        - O resumo deve ser curto, coeso e otimista.
        - Deve oferecer uma visão geral emocional do casal naquele dia.
        - Use segunda pessoa ("vocês", "seu relacionamento").
        - Inclua insights práticos se aplicável.
        - Responda em formato JSON com os campos: "summary" e "insights".
        - Não inclua quebras de linha no texto.

        Formato da resposta:
        {"summary": "[resumo aqui]", "insights": "[insight aqui]"}
      `.trim(),
      system: `Você é uma IA especializada em análise emocional de casais. Gere resumos com clareza, empatia e baseando-se nos dados comportamentais e interações anteriores. Use linguagem acolhedora e relacional. Responda exclusivamente com JSON no formato pedido.`,
      maxTokens: 500
    });

    if (!summaryResponse?.text) {
      return {
        response: {
          summary: "Não foi possível gerar o resumo. Tente novamente mais tarde.",
          insights: ""
        }
      };
    }

    try {
      const rawText = summaryResponse.text;

      const cleanText = rawText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/\n/g, ' ')
        .replace(/\r/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      const parsed = JSON.parse(cleanText);

      if (!parsed.summary || !parsed.insights) {
        throw new Error('Invalid response format');
      }

      return {
        response: {
          summary: parsed.summary.substring(0, 500),
          insights: parsed.insights.substring(0, 500)
        }
      };
    } catch {
      return {
        response: {
          summary: "Erro ao processar o resumo. Por favor, tente novamente.",
          insights: ""
        }
      };
    }
  } catch {
    return {
      response: {
        summary: "Ocorreu um erro ao gerar o resumo.",
        insights: ""
      }
    };
  }
}
