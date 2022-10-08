import { Prisma, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../../lib/withAuth";
import { getJornadasStaticsIsFinished } from "../../../../prisma/jornadasSubscription";
import prisma from "../../../../prisma/prisma";
import { getAllUsers, getUsersStats } from "../../../../prisma/user";
import cmsClient from "../../../../services/cmsClient";
import { IVagaFindOne } from "../../../../types/CMS/Vaga";


const parsedUsersWithDeclaredKnowledgeCount = 4;
const parsedUsersThatFinishedJornadasCount = 9;
async function vagas(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { vaga: vagaId } = req.query;
    const vaga = await cmsClient.get<IVagaFindOne>(`vagas/${vagaId}`, {
      params: {
        populate: ["jornadas.image", "conhecimentos"],
      },
    });

    const conhecimentos =
      vaga.data.data.attributes.conhecimentos?.data.map(
        (x) => x.attributes.name
      ) || [];
    const jornadasIds =
      vaga.data.data.attributes.jornadas?.data.map((x) => x.id) || [];
    const [usersWithDeclaredKnowledge, usersThatFinishedJornadas, jornadasStatics] =
      await Promise.all([
        prisma.user.findMany({
          where: {
            AppliedVacancy: {
              some: {
                vagaId: Number(vagaId),
              },
            },
            knowledgeItems: {
              hasSome: conhecimentos,
            },
          },
          include: {
            JornadaSubscription: {
              where: {
                jornadaId: {
                  in: jornadasIds,
                },
                isFinished: true,
              },
            },
          },
        }),
        prisma.user.findMany({
          where: {
            AppliedVacancy: {
              some: {
                vagaId: Number(vagaId),
              },
            },
            knowledgeItems: {
              hasSome: conhecimentos,
            },
          },
          include: {
            JornadaSubscription: {
              where: {
                jornadaId: {
                  in: jornadasIds,
                },
                isFinished: true,
              },
            },
          },
        }),
        getJornadasStaticsIsFinished({
          jornadasIds
        })
      ]);

    const parseUser = (user: User) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    });

    const parsedUsersWithDeclaredKnowledge = usersWithDeclaredKnowledge
      .map((user) => {
        const knowledgeItems = user.knowledgeItems.filter((x) =>
          conhecimentos.includes(x)
        );
        const jornadasConcluidas = user.JornadaSubscription.filter((jornada) =>
          jornadasIds.includes(jornada.jornadaId)
        );
        const percJornadasFinished = (
          jornadasConcluidas.length / jornadasIds.length
        ).toPrecision(1);
        const userInfo = parseUser(user);
        return {
          ...userInfo,
          knowledgeCount: knowledgeItems.length,
          percJornadasFinished,
        };
      })
      .sort((a, b) => (a.knowledgeCount < b.knowledgeCount ? -1 : 1))
      .slice(0, parsedUsersWithDeclaredKnowledgeCount);

    const parsedUsersThatFinishedJornadas = usersWithDeclaredKnowledge
      .map((user) => {
        const jornadasConcluidas = user.JornadaSubscription.filter((jornada) =>
          jornadasIds.includes(jornada.jornadaId)
        );
        const percJornadasFinished = (
          jornadasConcluidas.length / jornadasIds.length
        ).toPrecision(1);
        const userInfo = parseUser(user);
        return {
          ...userInfo,
          percJornadasFinished,
        };
      })
      .sort((a, b) =>
        a.percJornadasFinished < b.percJornadasFinished ? -1 : 1
      )
      .slice(0, parsedUsersThatFinishedJornadasCount);

    const parsedJornadasStatics = vaga.data.data.attributes.jornadas?.data.map(jornada => {
      const statics = {
        finished: jornadasStatics.find(
          (x) => x.jornadaId === jornada.id && x.isFinished === true
        )?._count || 0,
        notFinished: jornadasStatics.find(
          (x) => x.jornadaId === jornada.id && x.isFinished === false
        )?._count || 0,
      };
      return {
        id: jornada.id,
        name: jornada.attributes.name,
        image:
          jornada.attributes.image.data?.attributes.formats.small.url,
        statics,
      };
    });

    return res.json({
      parsedUsersWithDeclaredKnowledge,
      parsedUsersWithDeclaredKnowledgeCount: parsedUsersWithDeclaredKnowledgeCount + 1,
      parsedUsersThatFinishedJornadas,
      parsedUsersThatFinishedJornadasCount: parsedUsersThatFinishedJornadasCount + 1,
      parsedJornadasStatics,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}

export default withSessionRoute(vagas, "admin");
