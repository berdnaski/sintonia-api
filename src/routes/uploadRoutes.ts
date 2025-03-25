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
    const data = await request.file();

    const buffer = await data.toBuffer();

    const name = data.filename
    const contentType = data.mimetype

    const fileKey = randomUUID().concat('-').concat(name);

    const command = new PutObjectCommand({
      Bucket: 'sintonia',
      Key: fileKey,
      Body: buffer,
      ContentType: contentType,
    });

    await r2.send(command)

    const file = await prisma.file.create({
      data: {
        name,
        contentType,
        key: fileKey
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

    const command = new GetObjectCommand({
      Bucket: 'sintonia',
      Key: file.key,
    })

    const signedUrl = await getSignedUrl(
      r2,
      command,
      { expiresIn: 600 },
    )

    return { signedUrl };
  })
}
