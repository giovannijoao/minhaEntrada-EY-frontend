import { Prisma, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../../lib/withAuth";
import prisma from "../../../../prisma/prisma";
import { getAllUsers, getUsersStats } from "../../../../prisma/user";
import cmsClient from "../../../../services/cmsClient";
import { IVagaFindOne } from "../../../../types/CMS/Vaga";

async function pessoas(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { vaga: vagaId } = req.query;
    const vaga = await cmsClient.get<IVagaFindOne>(`vagas/${vagaId}`, {
      params: {
        populate: ["jornadas", "conhecimentos"],
      },
    });

    const conhecimentos =
      vaga.data.data.attributes.conhecimentos?.data.map(
        (x) => x.attributes.name
      ) || [];
    const jornadas =
      vaga.data.data.attributes.jornadas?.data.map((x) => x.id) || [];
    const [usersWithDeclaredKnowledge, usersThatFinishedJornadas] =
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
                  in: jornadas,
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
                  in: jornadas,
                },
                isFinished: true,
              },
            },
          },
        }),
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
          jornadas.includes(jornada.jornadaId)
        );
        const percJornadasFinished = (
          jornadasConcluidas.length / jornadas.length
        ).toPrecision(1);
        const userInfo = parseUser(user);
        return {
          ...userInfo,
          knowledgeCount: knowledgeItems.length,
          percJornadasFinished,
        };
      })
      .sort((a, b) => (a.knowledgeCount < b.knowledgeCount ? -1 : 1))
      .slice(0, 4);

    const parsedUsersThatFinishedJornadas = usersWithDeclaredKnowledge
      .map((user) => {
        const jornadasConcluidas = user.JornadaSubscription.filter((jornada) =>
          jornadas.includes(jornada.jornadaId)
        );
        const percJornadasFinished = (
          jornadasConcluidas.length / jornadas.length
        ).toPrecision(1);
        const userInfo = parseUser(user);
        return {
          ...userInfo,
          percJornadasFinished,
        };
      })
      .sort((a, b) => (a.percJornadasFinished < b.percJornadasFinished ? -1 : 1))
      .slice(0, 9);

    return res.json({
      usersWithDeclaredKnowledge: parsedUsersWithDeclaredKnowledge,
      usersThatFinishedJornadas: parsedUsersThatFinishedJornadas,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}

export default withSessionRoute(pessoas, "admin");
