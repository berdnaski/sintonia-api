import { createDeepSeek, deepseek as deepseekModel } from '@ai-sdk/deepseek';
import dotenv from "dotenv";
dotenv.config()

createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY as string
})

export const deepseek = deepseekModel('deepseek-chat')