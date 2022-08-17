import { AppliedVacancy } from '@prisma/client';
import prisma from './prisma';

// CREATE
export const createAppliedVacancy = async (data: Omit<AppliedVacancy, 'id' | 'created_at' | 'updated_at'>) => {
  const record = await prisma.appliedVacancy.create({
    data,
  });
  return record;
};

export const getAppliedVacancy = async ({
  vagaId,
  userId
}: {
  vagaId: number,
  userId: string
}) => {
  const record = await prisma.appliedVacancy.findFirst({
    where: {
      vagaId,
      userId
    },
  });
  return record;
};