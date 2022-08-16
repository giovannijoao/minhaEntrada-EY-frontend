import { Answer } from '@prisma/client';
import prisma from './prisma';

// CREATE
export const createAnswers = async (data: Omit<Answer, 'id'>[]) => {
  const records = await prisma.answer.createMany({
    data,
  });
  return records;
};
