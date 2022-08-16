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

export const getAulaProgress = async ({
  progressId,
  userId,
}: {
  userId: string;
  progressId: string
}) => {
  return prisma.aulaProgress.findUnique({
    where: {
      id: progressId,
    },
  });
};

// CREATE
export const createAulaProgress = async (data: Omit<AulaProgress, 'id'>) => {
  const aulaProgress = await prisma.aulaProgress.create({
    data,
  });
  return aulaProgress;
};

export const updateAulaProgress = async ({
  id,
  isFinished,
}: {
  id: string;
  isFinished: boolean;
}) => {
  const aulaProgress = await prisma.aulaProgress.update({
    where: {
      id
    },
    data: {
      isFinished
    }
  });
  return aulaProgress;
};