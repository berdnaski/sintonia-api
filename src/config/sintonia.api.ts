import { config } from 'dotenv'
config()

export const SintoniAPI = {
  secretKey: process.env.SECRET_KEY as string,
}