import { JornadaSubscription, Prisma } from '@prisma/client';
import prisma from './prisma'

export const getAllJornadaSubscriptionsForUser = async ({
  userId,
}: {
  userId: string
}) => {
  return prisma.jornadaSubscription.findMany({
    where: {
      userId
    }
  })
}

export const getJornadaSubscription = async ({
  userId,
  jornadaId,
}: {
  userId: string;
  jornadaId: number;
}) => {
  return prisma.jornadaSubscription.findFirst({
    where: {
      userId,
      jornadaId,
    },
  });
};

// CREATE
export const createJornadaSubscription = async (data: Prisma.JornadaSubscriptionUncheckedCreateInput) => {
  const jornadaSubscription = await prisma.jornadaSubscription.create({
    data,
  });
  return jornadaSubscription;
};

export const updateJornadaSubscription = async ({
  data,
  id,
}: {
  id: string,
  data: Prisma.JornadaSubscriptionUpdateInput
}) => {
  const jornadaSubscription = await prisma.jornadaSubscription.update({
    where: {
      id,
    },
    data,
  });
  return jornadaSubscription;
};

type getJornadasStaticsIsFinished = {
  jornadasIds?: number[];
};

export const getJornadasStaticsIsFinished = async ({
  jornadasIds = undefined,
}: getJornadasStaticsIsFinished = {}) => {
  return prisma.jornadaSubscription.groupBy({
    ...jornadasIds && ({
      where: {
        jornadaId: {
          in: jornadasIds
        }
      }
    }),
    by: ["jornadaId", "isFinished"],
    _count: {
      _all: true,
    },
  });
}