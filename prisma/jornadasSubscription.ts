import { JornadaSubscription } from '@prisma/client';
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
export const createJornadaSubscription = async (data: Omit<JornadaSubscription, 'id' | 'AulaProgress' | 'created_at' | 'updated_at'>) => {
  const jornadaSubscription = await prisma.jornadaSubscription.create({
    data,
  });
  return jornadaSubscription;
};