import { AppliedVacancy, Prisma } from '@prisma/client';
import prisma from './prisma';

// CREATE
export const createAppliedVacancy = async (data: Prisma.AppliedVacancyUncheckedCreateInput) => {
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

export const getAppliedVacancies = async ({
  userId,
}: {
  userId: string;
}) => {
  const record = await prisma.appliedVacancy.findMany({
    where: {
      userId,
    },
  });
  return record;
};