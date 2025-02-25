import { config } from "dotenv"
config()

export const sintoniaConfig = {
  product: process.env.PRODUCT_NAME,
  frontend: process.env.FRONTEND_URL,
}