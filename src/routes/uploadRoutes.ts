import type { FastifyInstance } from "fastify";
import { Auth } from "../middlewares/auth";
import { CheckSubscription } from "../middlewares/checkSubscription";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../lib/cloudflare";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { randomUUID } from "crypto";
import { prisma } from "../database/prisma-client";

export async function uploadRoutes(app: FastifyInstance) {~

  app.addHook("onRequest", Auth);
  app.addHook("onRequest", CheckSubscription);

  app.post('/uploads', async (request) => {
    const uploadBodySchema = z.object({
      name: z.string().min(1),
      contentType: z.string().regex(/\w+\/[-+.\w]+/)
    });

    const { name, contentType } = uploadBodySchema.parse(request.body);
    const allowedTypes = ['video/mp4', 'image/jpeg', 'image/png', 'image/jpg'];

    if (!allowedTypes.includes(contentType)) {
      throw new Error('File type not supported');
    }

    const fileKey = randomUUID().concat('-').concat(name);

    const signedUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: 'sintonia',
        Key: fileKey,
        ContentType: contentType, 
      }),
      { expiresIn: 600 },
    )

    const file = await prisma.file.create({
      data: {
        name,
        contentType,
        key: fileKey
      }
    })

    return { signedUrl, fileId: file.id };
  })

  app.get('/uploads/:id', async (request) => {
    const getFileParamsSchema = z.object({
      id: z.string().cuid(),
    })

    const { id } = getFileParamsSchema.parse(request.params);

    const file = await prisma.file.findUniqueOrThrow({
      where: {
        id
      }
    })

    const signedUrl = await getSignedUrl(
      r2,
      new GetObjectCommand({
        Bucket: 'sintonia',
        Key: file.key,
      }),
      { expiresIn: 600 },
    )

    return { signedUrl };
  })
}
