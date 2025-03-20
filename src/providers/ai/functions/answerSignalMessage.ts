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
        const limit = 3;
        const responses = await aiResponseRepository.findByCoupleId(coupleId, limit);
        return JSON.stringify(responses);
      } catch (error) {
        throw new Error("Erro ao buscar respostas de IA do banco de dados");
      }
    }
  }),
};

export async function AnswerSignalMessage({ message, coupleId }: AnswerSignalMessageParams) {
  try {
    const [signalsResult, previousResponsesResult] = await Promise.all([
      tools.signalsFromDatabase.execute(
        { coupleId },
        { toolCallId: "signals-query", messages: [] }
      ),
      tools.aiResponsesFromDatabase.execute(
        { coupleId },
        { toolCallId: "responses-query", messages: [] }
      )
    ])

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
        Oi, vocês! Sou eu, seu amigo virtual que adora ajudar nos relacionamentos. Estou aqui para conversar de coração aberto, trazendo conselhos práticos e ideias para deixar tudo mais leve – ou mais profundo, se for o caso. Vamos ver o que está rolando?

        Dados:
        Mensagem atual: ${message}
        Histórico de interações: ${JSON.stringify(interactionHistory)}
        Sinais recentes: ${JSON.stringify(signals)}
        JSON_CLASSIFICACOES: ${JSON.stringify(CoupleMetricClassification)}
        JSON_LEVELS: ${JSON.stringify(CoupleMetricLevelPercentage)}

        Instruções:
        - Fale comigo como um amigo, usando "você", "seu", "sua" – nada de terceira pessoa, tá?
        - Seja gentil e acolhedor, mostrando que eu me importo com o que vocês estão vivendo.
        - Ajuste o tom: leve e brincalhão se estiver tudo bem, ou mais empático se for algo sério.
        - Dê conselhos práticos e úteis em todas as respostas. Sugira ações concretas que o casal possa tomar em vez de depender só de perguntas.
        - Você pode incluir até 2 perguntas reflexivas por resposta, mas só se forem realmente úteis para o diálogo. Não coloque perguntas em todas as respostas.
        - Classifique a mensagem com um ou mais campos do json JSON_CLASSIFICACOES e de um nivel para ele de acordo a mensagem e a porcetagem do json JSON_LEVELS (campo "metrics")
        - Sem quebras de linha ou extras fora do JSON, mas capriche na naturalidade dentro dele!
        - Responda só em JSON, com "summary", "advice" e "metrics", até 500 caracteres por campo.

        Formato exato da resposta:
        {
          "summary": "[máximo 500 caracteres]",
          "advice":"[máximo 500 caracteres com 2 perguntas reflexivas]",
          "metrics": "[array com um ou mais items classificados seguindo o seguinte formato {
            "classification": [string com um dos campos de classificação fornecidos],
            "level": "[string com um dos levels fornecidos]",
            "percentage": "[numero com porcentagem correspondendo ao nivel]"
          }]",
        }
      `,
      system: `
        Oi! Sou seu parceiro para falar de relacionamentos, com carinho e leveza – ou emoção, dependendo do dia. Meu foco é ajudar com conselhos práticos e reflexões que façam sentido.
        REGRAS:
        - Use "você", "seu", "sua" – papo direto e próximo.
        - Dê conselhos práticos em todas as respostas, como ideias ou sugestões úteis.
        - Só inclua perguntas reflexivas se for útil ou um estímulo para o diálogo. Evite perguntas em todas as respostas e muitas perguntas em uma resposta(max 2 perguntas por resposta)!
        - Responda só em JSON, com "summary", "advice" e "metrics", até 500 caracteres por campo.
        - Sem extras fora do JSON, mas seja humano e natural dentro dele!
      `,
      maxTokens: 250
    });

    if (!answer?.text) {
      return {
        response: {
          coupleId,
          summary: "Modelo indisponível",
          advice: "Tente novamente em alguns minutos",
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
        metrics: null
      }
    };
  }
}
