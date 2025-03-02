import { generateText, tool } from "ai";
import { z } from "zod";
import { deepseek } from "..";
import { PrismaAIResponseRepository } from "../../../repositories/ai-response-repository";
import { PrismaSignalRepository } from "../../../repositories/signal-repository";

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
        Você é um assistente de IA especializado em relacionamentos e está falando diretamente com o casal.
        Sua tarefa é fornecer conselhos e análises com base nos dados do relacionamento.
        
        Mensagem atual: ${message}
        Histórico de interações: ${JSON.stringify(interactionHistory)}
        Sinais recentes: ${JSON.stringify(signals)}
        
        Responda como se estivesse falando diretamente com o casal, utilizando a segunda pessoa (você, seu, sua) no lugar de uma narrativa em terceira pessoa.
        RESPONDA EXATAMENTE NESTE FORMATO, sem quebras de linha:
        {"summary":"[máximo 500 caracteres]","advice":"[máximo 500 caracteres]","progress":"[máximo 500 caracteres]"}
      `,
      maxTokens: 200, 
      temperature: 0.5, 
      system: `Você é um assistente de IA especializado em análise de relacionamentos.
        Com base nos dados fornecidos, você deve se comunicar diretamente com o casal. 
        Use sempre a segunda pessoa (você, seu, sua) e evite falar sobre eles como "o casal".
        Forneça conselhos práticos, resumos e desafios de maneira direta e pessoal.
        REGRAS IMPORTANTES:
        - Responda APENAS em formato JSON válido
        - Use SOMENTE os campos "summary", "advice"
        - Mantenha cada resposta com no máximo 500 caracteres
        - NÃO use quebras de linha no JSON
        - NÃO use caracteres especiais
        - NÃO inclua texto fora do JSON
        - SEMPRE feche todas as aspas e chaves corretamente
        - SEMPRE mantenha as respostas curtas e diretas`
    });

    if (!answer?.text) {
      return {
        response: {
          coupleId,
          summary: "Modelo indisponível",
          advice: "Tente novamente em alguns minutos",
          progress: null,
          challenge: null
        }
      };
    }

    try {
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
      if (!cleanText.includes('"summary"')) {
        throw new Error('Invalid JSON structure');
      }

      const summaryMatch = cleanText.match(/"summary"\s*:\s*"([^"]+)"/);
      const adviceMatch = cleanText.match(/"advice"\s*:\s*"([^"]+)"/);
      // const progressMatch = cleanText.match(/"progress"\s*:\s*"([^"]+)"/);
      // const challengeMatch = cleanText.match(/"challenge"\s*:\s*"([^"]+)"/);

      if (!summaryMatch || !adviceMatch) {
        throw new Error('Missing required fields');
      }

      const fixedResponse = {
        summary: summaryMatch[1].substring(0, 500),
        advice: adviceMatch[1].substring(0, 500),
        // progress: progressMatch[1].substring(0, 500),
        // challenge: challengeMatch[1].substring(0, 500)
      };

      return {
        response: {
          coupleId,
          ...fixedResponse
        }
      };
    } catch (e) {
      console.error("Erro ao parsear JSON:", e, "Resposta:", answer.text);
      return {
        response: {
          coupleId,
          summary: `Erro de processamento: ${e.message}`,
          advice: `Erro ao processar JSON: ${answer.text}`,
          progress: null,
          challenge: null
        }
      };
    }

  } catch (error) {
    console.error("Erro na análise:", error);
    return {
      response: {
        coupleId,
        summary: "Erro na análise",
        advice: "Tente novamente mais tarde",
        progress: null,
        challenge: null
      }
    };
  }
}
