
import { NextApiRequest, NextApiResponse } from 'next'
import { withSessionRoute } from '../../../lib/withAuth'
import { createJornadaSubscription, getJornadaSubscription } from '../../../prisma/jornadasSubscription'
import prisma from '../../../prisma/prisma';
import cmsClient from '../../../services/cmsClient';
import { ITrilhasAll } from '../../../types/CMS/Trilha';

async function ingressRoute(req: NextApiRequest, res: NextApiResponse) {
  try {
    const trilhas = await cmsClient.get<ITrilhasAll>(`trilhas`, {
      params: {
        populate: ["aulas", "emblema"],
        "filters[jornadas][id][$eq]": req.body.jornadaId,
      },
    });

    let subscription = await getJornadaSubscription({
      jornadaId: req.body.jornadaId,
      userId: req.session.user.id as string,
    });

    if (!subscription) {
      subscription = await createJornadaSubscription({
        jornadaId: req.body.jornadaId,
        userId: req.session.user.id as string,
        availableTrilhas: trilhas.data.data.map(x => x.id),
        isFinished: false,
      });
    }


    await prisma.trilhaSubscription.createMany({
      data: trilhas.data.data.map(trilha => {
        return {
          trilhaId: trilha.id,
          classesIds: trilha.attributes.aulas?.data.map((aula) => aula.id),
          jornadaSubscriptionId: subscription?.id as string,
          finishedClasses: [],
          finalGrade: null,
          userId: req.session.user.id as string,
          hasEmblema: !!trilha.attributes.emblema?.data,
        };
      })
    })

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}

export default withSessionRoute(ingressRoute);