import type { FastifyInstance } from "fastify";
import { Auth } from "../middlewares/auth";
import { CheckSubscription } from "../middlewares/checkSubscription";
import { z } from "zod";
import { prisma } from "../database/prisma-client";
import { R2StorageProvider } from "../providers/storage/implementations/r2-storage-provider";

const storageProvider = new R2StorageProvider();

export async function uploadRoutes(app: FastifyInstance) {
  app.addHook("onRequest", Auth);
  app.addHook("onRequest", CheckSubscription);

  app.post('/uploads', async (request) => {
    const data = await request.file();
    const buffer = await data.toBuffer();

    const { url, key } = await storageProvider.upload({
      fileName: data.filename,
      fileType: data.mimetype,
      buffer,
    });

    return { url, key };
  });

  app.get('/uploads/:id', async (request) => {
    const getFileParamsSchema = z.object({
      id: z.string().cuid(),
    });

    const { id } = getFileParamsSchema.parse(request.params);

    const file = await prisma.file.findUniqueOrThrow({
      where: { id }
    });

    const signedUrl = await storageProvider.getUrl(file.key);

    return { signedUrl };
  });
}
