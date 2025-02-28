import OpenAI from 'openai';

export class AIProvider {
  private openia: OpenAI;

  constructor() {
    this.openia = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY as string,
      baseURL: 'https://api.deepseek.com'
    });
  }

  async getResponse(userInput: string, configuration: string): Promise<string | null> {
    const response = await this.openia.chat.completions.create({
      model: 'deepseek-chat', // or deepseek-reasoner
      messages: [
        { role: 'system', content: configuration },
        { role: 'user', content: userInput }
      ],
      temperature: 1.3, // 1.3 - General Conversation / 1.5 - Creative Writing/Poetry
      max_tokens: 200,
      response_format: {
        type: 'json_object',
      }
    })

    return response.choices[0].message.content;
  }
}