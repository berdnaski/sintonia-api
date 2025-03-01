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
  
  console.log("Recebido: ", { message, coupleId })
  
  try {
    const signals = await signalRepository.findByCoupleId(coupleId)
    const previousResponses = await aiResponseRepository.findByCoupleId(coupleId)
    
    const answer = await generateText({
      model: deepseek,
      prompt: `Como um especialista em relacionamentos, analice o seguinte sinal:
      Sinal Atual:
      ${message}
      Com base nessas informações, forneça uma análise estruturada em português, no seguinte formato JSON:
      {
        "summary": "Análise detalhada da situação atual do casal",
        "advice": "Recomendações práticas e específicas para melhorar o relacionamento"
      }
      IMPORTANTE: Responda APENAS com o JSON, sem texto adicional.`,
      maxTokens: 2000,
      temperature: 0.5,
      tools: {}, 
      system: `Você é um especialista em relacionamentos com vasta experiência.
        Analise cuidadosamente o sinal e o histórico do casal.
        Forneça insights profundos e conselhos práticos.
        SEMPRE responda em português.
        SEMPRE use o formato JSON especificado.
        Mantenha o foco em ajudar o casal de forma construtiva. Com no máximo 500 tokens`
    })
    
    console.log("Raw AI Response:", answer)
    console.log("Response Text:", answer?.text)
    
    if (!answer?.text) {
      return {
        response: {
          coupleId,
          summary: "O modelo está temporariamente indisponível",
          advice: "Por favor, tente novamente em alguns minutos"
        }
      }
    }
    
    try {
      const parsedResponse = JSON.parse(answer.text.trim())
      
      if (!parsedResponse.summary || !parsedResponse.advice) {
        return {
          response: {
            coupleId,
            summary: "A resposta do modelo estava incompleta",
            advice: "Por favor, tente novamente"
          }
        }
      }
    
      return {
        response: {
          coupleId,
          summary: parsedResponse.summary,
          advice: parsedResponse.advice
        }
      }
    } catch (e) {
      console.error("JSON Parse Error:", e)
      return {
        response: {
          coupleId,
          summary: "Erro ao processar a resposta do modelo",
          advice: "Por favor, tente novamente em alguns instantes"
        }
      }
    }
  } catch (error) {
    console.error("Erro na execução do modelo AI:", error)
    return {
      response: {
        coupleId,
        summary: "Falha ao gerar análise do relacionamento",
        advice: "Ocorreu um erro inesperado, tente novamente mais tarde"
      }
    }
  }
}
