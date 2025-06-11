import { config } from "dotenv"
config()

export const sintoniaConfig = {
  product: process.env.PRODUCT_NAME,
  frontend: process.env.FRONTEND_URL,
  jobs: {
    daily_questions: '41 00 * * *' as string,
    weekly_challenges: '04 14 * * *' as string,
    daily_summary: '24 09 * * *' as string
  },
};
