import { config } from "dotenv"
config()

export const sintoniaConfig = {
  product: process.env.PRODUCT_NAME,
  frontend: process.env.FRONTEND_URL,
  jobs: {
    daily_questions: '56 15 * * *' as string,
    weekly_challenges: '1 15 * * *' as string
  },  
};