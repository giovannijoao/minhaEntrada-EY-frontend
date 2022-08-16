import { AulaProgress, JornadaSubscription } from '@prisma/client';
import prisma from './prisma'

export const getAllProgresses = async ({
  userId,
  jornadaSubscriptionId,
  trilhaId,
}: {
  userId: string;
  jornadaSubscriptionId: string;
  trilhaId: number;
}) => {
  return prisma.aulaProgress.findMany({
    where: {
      userId,
      jornadaSubscriptionId,
      trilhaId,
    },
  });
};

// CREATE
export const createAulaProggress = async (data: Omit<AulaProgress, 'id'>) => {
  const aulaProgress = await prisma.aulaProgress.create({
    data,
  });
  return aulaProgress;
};