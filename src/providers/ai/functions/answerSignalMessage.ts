import { generateText, tool } from "ai";
import { z } from "zod";
import { deepseek } from "..";
import { PrismaAIResponseRepository } from "../../../repositories/ai-response-repository";
import { PrismaSignalRepository } from "../../../repositories/signal-repository";
import { CoupleMetricLevelPercentage } from "../../../constants/couple-metrics/levels.constant";
import { CoupleMetricClassification, CoupleMetricLevel } from "@prisma/client";

interface AnswerSignalMessageParams {
  message: string;
  coupleId: string;
}

const tools = {
  signalsFromDatabase: tool({
    description: `
      Realiza uma query no banco Postgres para buscar informações da tabela "signals" do banco de dados.
      Só pode realizar operações de busca (SELECT), não é permitido a geração de qualquer outra operação.
    `.trim(),
    parameters: z.object({
      coupleId: z.string()
    }),
    execute: async ({ coupleId }) => {
      const signalRepository = new PrismaSignalRepository();
      try {
        const signals = await signalRepository.findByCoupleId(coupleId);
        return JSON.stringify(signals);
      } catch (error) {
        console.error("Erro ao buscar sinais:", error);
        throw new Error("Erro ao buscar sinais do banco de dados");
      }
    }
  }),

  aiResponsesFromDatabase: tool({
    description: `
      Realiza uma query no banco Postgres para buscar informações da tabela "ai_responses" do banco de dados.
      Só pode realizar operações de busca (SELECT), não é permitido a geração de qualquer outra operação.
    `.trim(),
    parameters: z.object({
      coupleId: z.string()
    }),
    execute: async ({ coupleId }) => {
      const aiResponseRepository = new PrismaAIResponseRepository();
      try {
        const responses = await aiResponseRepository.findByCoupleId(coupleId);
        return JSON.stringify(responses);
      } catch (error) {
        console.error("Erro ao buscar respostas de IA:", error);
        throw new Error("Erro ao buscar respostas de IA do banco de dados");
      }
    }
  }),
};

export async function AnswerSignalMessage({ message, coupleId }: AnswerSignalMessageParams) {
  try {
    const signalsResult = await tools.signalsFromDatabase.execute(
      { coupleId },
      { toolCallId: "signals-query", messages: [] }
    );

    const previousResponsesResult = await tools.aiResponsesFromDatabase.execute(
      { coupleId },
      { toolCallId: "responses-query", messages: [] }
    );

    const signals = JSON.parse(signalsResult);
    const previousResponses = JSON.parse(previousResponsesResult);

    const interactionHistory = previousResponses.map((response: any) => ({
      summary: response.summary,
      advice: response.advice,
      date: response.createdAt
    }));

    const answer = await generateText({
      model: deepseek,
      prompt: `
        Você é um assistente de IA especializado em relacionamentos, conversando de forma próxima e acolhedora com o casal. Sua missão é oferecer conselhos, reflexões e desafios personalizados com base nos dados do relacionamento.

        Dados:
        Mensagem atual: ${message}
        Histórico de interações: ${JSON.stringify(interactionHistory)}
        Sinais recentes: ${JSON.stringify(signals)}
        JSON_CLASSIFICACOES: ${JSON.stringify(CoupleMetricClassification)}
        JSON_LEVELS: ${JSON.stringify(CoupleMetricLevelPercentage)}

        Instruções:
        - Fale diretamente com o casal usando sempre a segunda pessoa (você, seu, sua).
        - Ofereça conselhos práticos e reflexões empáticas, de forma pessoal e acolhedora.
        - Insira, TODOS OS DIAS, duas perguntas reflexivas para estimular o diálogo e a autoavaliação.
        - Envie um desafio semanalmente (a cada 7 dias) para incentivar novas experiências; se não for o dia do desafio, retorne uma string vazia ("") no campo "challenge".
        - Classifique a mensagem com um ou mais campos do json JSON_CLASSIFICACOES e de um nivel para ele de acordo a mensagem e a porcetagem do json JSON_LEVELS (campo "metrics")
        - Responda APENAS em formato JSON válido, utilizando os campos "summary", "advice", "challenge", "metrics".
        - Cada campo deve conter no máximo 500 caracteres.
        - NÃO inclua quebras de linha, caracteres especiais ou informações extras fora do JSON.

        Formato exato da resposta:
        {
          "summary": "[máximo 500 caracteres]",
          "advice":"[máximo 500 caracteres com 2 perguntas reflexivas]",
          "challenge":"[desafio semanal ou string vazia]",
          "metrics": "[array com um ou mais items classificados seguindo o seguinte formato {
            "classification": [string com um dos campos de classificação fornecidos],
            "level": "[string com um dos levels fornecidos]",
            "percentage": "[numero com porcentagem correspondendo ao nivel]"
          }]",
        }
      `,
      system: `
        Você é um assistente de IA especializado em análise de relacionamentos, conversando de forma empática e direta com o casal. Seu objetivo é oferecer conselhos práticos e reflexões para melhorar a convivência e a relação de vocês.
        REGRAS IMPORTANTES:
        - Use sempre a segunda pessoa (você, seu, sua) e evite narrativas em terceira pessoa.
        - Insira duas perguntas reflexivas na resposta diária para promover o autoconhecimento.
        - Envie um desafio semanal (a cada 7 dias) para incentivar novas experiências; caso não seja o dia do desafio, retorne uma string vazia no campo "challenge".
        - Responda APENAS em formato JSON válido, utilizando os campos "summary", "advice", "challenge", "classification", "level" e "percentage".
        - Cada campo deve ter, no máximo, 500 caracteres.
        - NÃO use quebras de linha, caracteres especiais ou textos fora do JSON.
        - SEMPRE feche todas as aspas e chaves corretamente e mantenha as respostas curtas e diretas.
      `,
      maxTokens: 250
    });

    if (!answer?.text) {
      return {
        response: {
          coupleId,
          summary: "Modelo indisponível",
          advice: "Tente novamente em alguns minutos",
          challenge: null,
          metrics: null
        }
      };
    }

    let cleanText = answer.text
      .trim()
      .replace(/\n/g, ' ')
      .replace(/\r/g, '')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/\\n/g, ' ')
      .replace(/\\\"/g, '"')
      .replace(/^[^{]*{/, '{')
      .replace(/}[^}]*$/, '}');

    const iaResponseSchema = z.object({
      summary: z.string(),
      advice: z.string(),
      challenge: z.string().optional(),
      metrics: z.array(z.object({
        classification: z.nativeEnum(CoupleMetricClassification),
        level: z.nativeEnum(CoupleMetricLevel),
        percentage: z.string().or(z.number()),
      }))
    });

    const iaResponse = JSON.parse(cleanText)

    const result = iaResponseSchema.safeParse(iaResponse)

    if (!result.success) {
      throw new Error('Invalid JSON structure');
    }

    return {
      response: {
        coupleId,
        summary: result.data.summary,
        advice: result.data.advice,
        challenge: result.data.challenge,
        metrics: result.data.metrics,
      }
    };

  } catch (error) {
    console.error("Erro na análise:", error);

    return {
      response: {
        coupleId,
        summary: "Erro na análise",
        advice: "Tente novamente mais tarde",
        challenge: null,
        metrics: null
      }
    };
  }
}
