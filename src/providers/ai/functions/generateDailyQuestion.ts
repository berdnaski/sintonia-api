import { generateText, tool } from "ai";
import { z } from "zod";
import { deepseek } from "..";
import { PrismaAIResponseRepository } from "../../../repositories/ai-response-repository";
import { PrismaQuestionRepository } from "../../../repositories/question-repository";
import { PrismaSignalRepository } from "../../../repositories/signal-repository";

interface AnswerSignalMessageParams {
  coupleId: string;
  userId: string;
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

  questionsFromDatabase: tool({
    description: `
      Realiza uma query no banco Postgres para buscar informações da tabela "questions" do banco de dados.
      Só pode realizar operações de busca (SELECT), não é permitido a geração de qualquer outra operação.
    `.trim(),
    parameters: z.object({
      coupleId: z.string()
    }),
    execute: async ({ coupleId }) => {
      const questionRepository = new PrismaQuestionRepository();
      try {
        const questions = await questionRepository.findOne(coupleId);
        return JSON.stringify(questions);
      } catch (error) {
        console.error("Erro ao buscar perguntas:", error);
        throw new Error("Erro ao buscar perguntas do banco de dados");
      }
    }
  }),
};

export async function GenerateDailyQuestion({ coupleId, userId }: AnswerSignalMessageParams) {
  try {
    const signalsResult = await tools.signalsFromDatabase.execute(
      { coupleId },
      { toolCallId: "signals-query", messages: [] }
    );

    const previousResponsesResult = await tools.aiResponsesFromDatabase.execute(
      { coupleId },
      { toolCallId: "responses-query", messages: [] }
    );

    const questionsResult = await tools.questionsFromDatabase.execute(
      { coupleId },
      { toolCallId: "questions-query", messages: [] }
    );

    const signals = JSON.parse(signalsResult);
    const previousResponses = JSON.parse(previousResponsesResult);
    const questions = JSON.parse(questionsResult);

    const interactionHistory = previousResponses.map((response: any) => ({
      summary: response.summary,
      advice: response.advice,
      date: response.createdAt
    }));

    const answer = await generateText({
      model: deepseek,
      prompt: `
Você é um assistente de IA especializado em relacionamentos. Sua missão é gerar uma única pergunta reflexiva para o casal, com base nos dados fornecidos, para estimular o diálogo e a autoavaliação.

Dados:
Histórico de interações: ${JSON.stringify(interactionHistory)}
Sinais recentes: ${JSON.stringify(signals)}
Perguntas e respostas anteriores: ${JSON.stringify(questions)}

Instruções:
- Fale diretamente com o casal usando sempre a segunda pessoa (você, seu, sua).
- Gere APENAS uma pergunta reflexiva que não tenha sido feita anteriormente.
- A pergunta deve ser relevante para o contexto do relacionamento do casal.
- Não repita perguntas que já foram feitas anteriormente.
- Responda em formato JSON com um único campo "question" contendo a pergunta.
- A pergunta deve ter no máximo 100 caracteres.
- NÃO inclua quebras de linha, caracteres especiais ou informações extras fora do JSON.
`,
      system: `
Você é um assistente de IA especializado em análise de relacionamentos. Seu objetivo é gerar perguntas reflexivas únicas e relevantes para o casal, com base nos dados fornecidos.
REGRAS IMPORTANTES:
- Use sempre a segunda pessoa (você, seu, sua) e evite narrativas em terceira pessoa.
- Gere apenas uma pergunta por vez.
- Gere uma pergunta diferente para cada usuário.
- Não repita perguntas que já foram feitas anteriormente.
- A pergunta deve ser direta e promover a reflexão sobre o relacionamento.
- Responda sempre em formato JSON com o campo "question".
- Mantenha a pergunta curta e objetiva.
- NÃO use quebras de linha, caracteres especiais ou textos fora do JSON.
- SEMPRE feche todas as aspas e chaves corretamente.
`,
      maxTokens: 100
    });

    if (!answer?.text) {
      return {
        response: {
          coupleId,
          question: "Modelo indisponível. Tente novamente."
        }
      };
    }

    try {
      const responseJson = JSON.parse(answer.text);
      const question = responseJson.question;

      if (!question) {
        throw new Error('Campo "question" não encontrado na resposta');
      }

      return {
        response: {
          coupleId,
          question: question.substring(0, 100)
        }
      };
    } catch (e) {
      console.error("Erro ao parsear JSON:", e, "Resposta:", answer.text);
      return {
        response: {
          coupleId,
          question: "Erro ao gerar pergunta. Tente novamente."
        }
      };
    }
  } catch (error) {
    console.error("Erro na análise:", error);
    return {
      response: {
        coupleId,
        question: "Erro na análise. Tente novamente mais tarde."
      }
    };
  }
}