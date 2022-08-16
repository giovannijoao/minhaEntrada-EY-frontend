import { AulaProgress, JornadaSubscription } from '@prisma/client';
import prisma from './prisma'

export const getAllProgresses = async ({
  userId,
  jornadaSubscriptionId,
  trilhaId,
  isFinished
}: {
  userId: string;
  jornadaSubscriptionId: string;
  trilhaId: number;
  isFinished?: boolean;
}) => {
  return prisma.aulaProgress.findMany({
    where: {
      userId,
      jornadaSubscriptionId,
      trilhaId,
      ...(isFinished ? { isFinished } : {})
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
export const createAulaProgress = async (data: Omit<AulaProgress, 'id' | 'created_at' | 'updated_at'>) => {
  const aulaProgress = await prisma.aulaProgress.create({
    data,
  });
  return aulaProgress;
};

export const updateAulaProgressFinished = async ({
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

export const updateAulaProgress = async ({
  id,
  data,
}: {
  id: string;
  data: AulaProgress;
}) => {
  const { id: _, ...rest }= data;
  const aulaProgress = await prisma.aulaProgress.update({
    where: {
      id,
    },
    data: rest,
  });
  return aulaProgress;
};