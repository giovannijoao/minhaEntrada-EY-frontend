import { Prisma, TrilhaSubscription } from "@prisma/client";
import prisma from "./prisma";

export const getTrilhaSubscriptionById = async ({
  trilhaSubscriptionId,
}: {
  trilhaSubscriptionId: string;
}) => {
  return prisma.trilhaSubscription.findUnique({
    where: {
      id: trilhaSubscriptionId,
    },
  });
};

export const getTrilhaSubscriptionByJornada = async ({
  jornadaSubscriptionId,
  trilhaId,
}: {
  jornadaSubscriptionId: string;
  trilhaId: number;
}) => {
  return prisma.trilhaSubscription.findFirst({
    where: {
      jornadaSubscriptionId,
      trilhaId,
    },
  });
};

export const getTrilhasSubscriptionForJornada = async ({
  jornadaSubscriptionId,
}: {
  jornadaSubscriptionId: string;
}) => {
  return prisma.trilhaSubscription.findMany({
    where: {
      jornadaSubscriptionId,
    },
  });
};

export const updateTrilhaSubscription = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<TrilhaSubscription>;
}) => {
  const { id: _, ...rest } = data;
  const record = await prisma.trilhaSubscription.update({
    where: {
      id,
    },
    data: rest,
  });
  return record;
};

export const getTrilhasStaticsIsFinished = async () => {
  return prisma.trilhaSubscription.groupBy({
    by: ["trilhaId", "isFinished"],
    _count: {
      _all: true,
    },
    _avg: {
      finalGrade: true,
    },
  });
};

export const getUsersFromTrilha = async ({
  trilhaId,
  search,
}: {
  trilhaId: number;
  search?: string;
}) => {
  return prisma.trilhaSubscription.findMany({
    where: {
      trilhaId,
      ...(search
        ? {
            user: {
              OR: [
                {
                  firstName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  lastName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            },
          }
        : {}),
    },
    include: {
      jornadaSubscription: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
};
