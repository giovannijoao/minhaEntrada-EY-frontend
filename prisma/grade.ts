import prisma from "./prisma";

export const getTrilhaGrade = async ({
  trilhaSubscriptionId,
}: {
  trilhaSubscriptionId: string;
}) => {
  const subscription = await prisma.aulaProgress.aggregate({
    where: {
      trilhaSubscriptionId,
    },
    _avg: {
      finalGrade: true
    }
  });
  return subscription;
};