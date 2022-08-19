
import { NextApiRequest, NextApiResponse } from 'next'
import { withSessionRoute } from '../../../lib/withAuth'
import { createJornadaSubscription, getJornadaSubscription } from '../../../prisma/jornadasSubscription'
import prisma from '../../../prisma/prisma';
import cmsClient from '../../../services/cmsClient';
import { IJornadaFindOne } from '../../../types/CMS/Jornada';
import { ITrilhasAll } from '../../../types/CMS/Trilha';

async function ingressRoute(req: NextApiRequest, res: NextApiResponse) {
  try {
    const jornada = await cmsClient.get<IJornadaFindOne>(`jornadas/${req.body.jornadaId}`, {
      params: {
        populate: ['trilhas.aulas']
      }
    })

    const trilhas = jornada.data.data.attributes.trilhas as ITrilhasAll;

    Reflect.deleteProperty(jornada.data.data.attributes, 'trilhas');

    let subscription = await getJornadaSubscription({
      jornadaId: req.body.jornadaId,
      userId: req.session.user.id as string,
    });

    if (!subscription) {
      subscription = await createJornadaSubscription({
        jornadaId: req.body.jornadaId,
        userId: req.session.user.id as string,
        availableTrilhas: trilhas?.data.map(x => x.id),
        isFinished: false,
        jornada: jornada.data.data
      });
    }


    await prisma.trilhaSubscription.createMany({
      data: trilhas.data.map(trilha => {
        return {
          trilhaId: trilha.id,
          classesIds: trilha.attributes.aulas?.data.map((aula) => aula.id),
          jornadaSubscriptionId: subscription?.id as string,
          finishedClasses: [],
          finalGrade: null,
          userId: req.session.user.id as string,
          hasEmblema: null,
        };
      })
    })

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}

export default withSessionRoute(ingressRoute);