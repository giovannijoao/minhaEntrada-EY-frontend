import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../../lib/withAuth";
import { getAllUsers, getUsersStats } from "../../../../prisma/user";

async function pessoas(req: NextApiRequest, res: NextApiResponse) {
  try {
    let filters: Prisma.UserWhereInput = {
      AND: [
        ...(req.query.search
          ? [
              {
                OR: [
                  {
                    firstName: {
                      contains: req.query.search as string,
                    },
                  },
                  {
                    lastName: {
                      contains: req.query.search as string,
                    },
                  },
                  {
                    email: {
                      contains: req.query.search as string,
                    },
                  },
                ],
              },
            ]
          : []),
        ...(req.query.gender
          ? [
              {
                gender: {
                  equals: req.query.gender as string,
                },
              },
            ]
          : []),
        ...(req.query["knowledgeItems[]"]
          ? [
              {
                knowledgeItems: {
                  hasSome: req.query["knowledgeItems[]"],
                },
              },
            ]
          : []),
        ...(req.query.vaga
          ? [
              {
                AppliedVacancy: {
                  some: {
                    vagaId: Number(req.query.vaga),
                  },
                },
              },
            ]
          : []),
      ],
    };
    const [users, stats] = await Promise.all([
      getAllUsers({
        filters,
      }),
      getUsersStats({
        filters,
      })
    ]);
    res.json({
      users,
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}

export default withSessionRoute(pessoas, 'admin');
