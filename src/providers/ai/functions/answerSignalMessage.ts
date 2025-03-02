import { generateText, tool } from "ai";
import { z } from "zod";
import { deepseek } from "..";
import { PrismaAIResponseRepository } from "../../../repositories/ai-response-repository";
import { PrismaSignalRepository } from "../../../repositories/signal-repository";

interface AnswerSignalMessageParams {
  message: string,
  coupleId: string,
}

export async function AnswerSignalMessage({ message, coupleId }: AnswerSignalMessageParams) {
  const signalRepository = new PrismaSignalRepository();
  const aiResponseRepository = new PrismaAIResponseRepository();

  try {
    const signals = await signalRepository.findByCoupleId(coupleId);
    const previousResponses = await aiResponseRepository.findByCoupleId(coupleId);

    const formattedSignals = signals.map(s => ({
      emotion: s.emotion,
      note: s.note,
      date: s.createdAt
    }));

    const answer = await generateText({
      model: deepseek,
      prompt: `Analise este novo sinal de relacionamento e o histórico do casal:

      SINAL ATUAL:
      Emoção: ${message.split(',')[0].replace('Emotion:', '').trim()}
      Nota: ${message.split(',')[1].replace('Note:', '').trim()}

      HISTÓRICO DE SINAIS:
      ${JSON.stringify(formattedSignals, null, 2)}

      INSTRUÇÕES:
      1. Analise o sinal atual em conjunto com o histórico
      2. Forneça uma análise detalhada da situação
      3. Sugira ações práticas para melhorar o relacionamento

      RESPONDA APENAS NO SEGUINTE FORMATO JSON:
      {
        "summary": "Análise detalhada da situação atual",
        "advice": "Um conselho que gere impacto e transformação no relacionamento"
      }`,
      maxTokens: 100,
      temperature: 0.7,
      system: `Você é um assistente de IA especializado em análise de relacionamentos.
      Com base nos seguintes dados do casal (micro sinais e respostas anteriores),
      forneça um resumo atualizado do estado do relacionamento, conselhos para melhoria e,
      opcionalmente, um desafio para o casal.
        SEMPRE responda em português.
        SEMPRE mantenha o formato JSON especificado.
        NÃO inclua texto fora do formato JSON.
        Não pode ser respostas grandes, de preferencia gastando no maximo 100 tokens.`
    });

    console.log("Resposta do modelo:", answer);

    if (!answer?.text || answer.text.trim() === '') {
      console.error("Modelo retornou resposta vazia ou inválida.");
      return {
        response: {
          coupleId,
          summary: "O modelo está temporariamente indisponível",
          advice: "Por favor, tente novamente em alguns minutos",
          challenge: null
        }
      };
    }

    try {
      const parsedResponse = JSON.parse(answer.text.trim());
      if (!parsedResponse.summary || !parsedResponse.advice) {
        console.error("Resposta do modelo incompleta:", parsedResponse);
        return {
          response: {
            coupleId,
            summary: "A resposta do modelo estava incompleta",
            advice: "Por favor, tente novamente"
          }
        };
      }

      return {
        response: {
          coupleId,
          summary: parsedResponse.summary,
          advice: parsedResponse.advice,
          challenge: parsedResponse.challenge || null
        }
      };
    } catch (e) {
      console.error("Erro ao processar a resposta do modelo:", e);
      return {
        response: {
          coupleId,
          summary: "Erro ao processar a resposta do modelo",
          advice: "Por favor, tente novamente em alguns instantes",
          challenge: null
        }
      };
    }

  } catch (error) {
    console.error("Erro na execução do modelo AI:", error);
    return {
      response: {
        coupleId,
        summary: "Falha ao gerar análise do relacionamento",
        advice: "Ocorreu um erro inesperado, tente novamente mais tarde",
        challenge: null
      }
    };
  }
}
