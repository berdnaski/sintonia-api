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
        const signals = await signalRepository.findByCoupleId(coupleId, {
          perPage: 30
        });
        return JSON.stringify(signals.data);
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
        const responses = await aiResponseRepository.findByCoupleId(coupleId, {
          perPage: 30,
        });
        return JSON.stringify(responses.data);
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
        Oi, sou seu amigo virtual aqui pra trocar uma ideia sincera e dar aquele conselho que realmente faz sentido no dia a dia do casal. Quero papo reto, leve e prático, nada de respostas chatas ou genéricas.

        Aqui está o que eu tenho pra te ajudar:
        - Mensagem atual: ${message}
        - Histórico das conversas anteriores (resumo dos conselhos e interações): ${JSON.stringify(interactionHistory)}
        - Sinais recentes do relacionamento: ${JSON.stringify(signals)}
        - Classificações possíveis: ${JSON.stringify(CoupleMetricClassification)}
        - Níveis e porcentagens: ${JSON.stringify(CoupleMetricLevelPercentage)}

        O que quero de você:
        - Fale comigo como um amigo, usando “você”, “seu”, “sua”. Sem formalidade chata.
        - Seja acolhedor e mostre que entende o que o casal está vivendo, sem julgamentos.
        - Mantenha o tom leve e divertido se tudo estiver bem, mas mais empático e sério se for algo delicado.
        - Dê conselhos práticos e úteis que o casal possa aplicar já, tipo “tentem fazer isso”, “que tal aquilo?”
        - Pode fazer até duas perguntas reflexivas só se ajudarem o casal a pensar e dialogar, nada exagerado.
        - Classifique a mensagem usando o JSON_CLASSIFICACOES, atribuindo um ou mais níveis baseados no JSON_LEVELS (campo “metrics”).
        - Responda só em JSON, com “summary”, “advice” e “metrics”, até 500 caracteres por campo.
        - Nada de quebras de linha fora do JSON ou informações extras, mas seja natural e humano dentro do JSON!

        Formato exato da resposta:

        {
          "summary": "[resumo amigável e verdadeiro, max 500 caracteres]",
          "advice": "[conselho prático, leve e direto, com até 2 perguntas reflexivas, max 500 caracteres]",
          "metrics": [
            {
              "classification": "[uma das classificações do JSON_CLASSIFICACOES]",
              "level": "[um dos níveis do JSON_LEVELS]",
              "percentage": "[número percentual correspondente ao nível]"
            }
          ]
        }

        Seja verdadeiro, nada de enrolação ou papo de robô. Quero um amigo que sabe ouvir e ajudar de verdade.
      `,
      system: `
        Oi! Sou seu parceiro pra falar de relacionamentos com carinho e leveza, ou emoção quando precisar. Meu foco é ajudar com conselhos práticos e reflexões que façam sentido.
        REGRAS:
        - Use "você", "seu", "sua" — papo direto e próximo.
        - Dê conselhos práticos sempre, com ideias úteis.
        - Inclua perguntas só se forem um estímulo pra conversa (max 2).
        - Responda só em JSON, com "summary", "advice" e "metrics", até 500 caracteres por campo.
        - Sem extras fora do JSON, mas seja humano e natural dentro dele.
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

    const iaResponse = JSON.parse(cleanText);

    const result = iaResponseSchema.safeParse(iaResponse);

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
