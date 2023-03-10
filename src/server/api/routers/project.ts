import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        eventId: z.string(),
        techs: z.array(z.string()),
        authorId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.project.create({
        data: {
          name: input.name,
          description: input.description,
          event: {
            connect: {
              id: input.eventId,
            },
          },
          author: {
            connect: {
              id: input.authorId,
            },
          },
          techs: {
            connectOrCreate: input.techs.map((tech) => ({
              where: {
                id: tech,
              },
              create: {
                masterTechId: tech,
              },
            })),
          },
        },
      });
    }),

  findUnique: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.project.findUnique({
        where: {
          id: input.id,
        },
        include: {
          _count: {
            select: {
              likes: true,
            },
          },
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          techs: {
            include: {
              tech: {
                select: {
                  label: true,
                },
              },
            },
          },
        },
      });
    }),
});