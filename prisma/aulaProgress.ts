import { AulaProgress, JornadaSubscription } from '@prisma/client';
import prisma from './prisma'

export const getAllProgresses = async ({
  userId,
  jornadaSubcriptionId,
  trilhaId,
}: {
  userId: string;
  jornadaSubcriptionId: string;
  trilhaId: number;
}) => {
  return prisma.aulaProgress.findMany({
    where: {
      userId,
      jornadaSubcriptionId,
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