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

export const getJornadaGrade = async ({
  jornadaSubscriptionId,
}: {
  jornadaSubscriptionId: string;
}) => {
  const trilhas = await prisma.trilhaSubscription.findMany({
    where: {
      jornadaSubscriptionId
    }
  })
  const subscription = await prisma.aulaProgress.aggregate({
    where: {
      trilhaSubscriptionId: {
        in: trilhas.map(x => x.id)
      },
    },
    _avg: {
      finalGrade: true,
    },
  });
  return subscription;
};