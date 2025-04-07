import { Prisma, PrismaClient } from '@prisma/client'
import { InternalArgs } from '@prisma/client/runtime/library';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    name: 'pagination',
    model: {
      $allModels: {
        async paginate<T>(
          this,
          args?: Prisma.QuestionFindManyArgs<InternalArgs> &{ page?: number; perPage?: number }
        ) {
          const context = Prisma.getExtensionContext(this)
          const { page = 1, perPage, ...rest } = args || {}
          const limit = perPage ? Number(perPage) : 10

          // @ts-ignore - this is a workaround for the current Prisma types
          const result = await context.findMany({
            ...rest,
            take: limit,
            skip: (page - 1) * limit,
          }) as T[]

          // @ts-ignore
          const total = await context.count({ where: rest?.where })

          return {
            data: result,
            meta: {
              total,
              page,
              perPage: limit,
              lastPage: Math.ceil(total / limit),
            },
          }
        },
      },
    },
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
