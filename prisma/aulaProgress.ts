import { AulaProgress, JornadaSubscription } from "@prisma/client";
import prisma from "./prisma";

export const getAllProgresses = async ({
  userId,
  trilhaSubscriptionId,
  isFinished,
}: {
  userId: string;
  trilhaSubscriptionId: string;
  isFinished?: boolean;
}) => {
  return prisma.aulaProgress.findMany({
    where: {
      userId,
      trilhaSubscriptionId,
      ...(isFinished
        ? {
            OR: [
              {
                hasActivity: true,
                isActivityFinished: true,
              },
              {
                hasActivity: false,
                isClassFinished: true,
              },
            ],
          }
        : {}),
    },
  });
};

// export const getGrade = async ({
//   userId,
//   jornadaSubscriptionId,
//   trilhaId,
// }: {
//   userId: string;
//   jornadaSubscriptionId: string;
//   trilhaId: number;
// }) => {
//   return prisma.aulaProgress.aggregate({
//     where: {
//       userId,
//       jornadaSubscriptionId,
//       trilhaId,
//     },
//     _avg: {
//       finalGrade: true,
//     },
//   });
// };

export const getAulaProgress = async ({
  progressId,
  userId,
}: {
  userId: string;
  progressId: string;
}) => {
  return prisma.aulaProgress.findUnique({
    where: {
      id: progressId,
    },
  });
};

// CREATE
export const createAulaProgress = async (
  data: Omit<AulaProgress, "id" | "created_at" | "updated_at">
) => {
  const aulaProgress = await prisma.aulaProgress.create({
    data,
  });
  return aulaProgress;
};

export const updateAulaProgress = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<AulaProgress>;
}) => {
  const { id: _, ...rest } = data;
  const aulaProgress = await prisma.aulaProgress.update({
    where: {
      id,
    },
    data: rest,
    select: {
      aulaId: true,
    }
  });
  return aulaProgress;
};
