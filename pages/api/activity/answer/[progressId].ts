import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../../lib/withAuth";
import { createAnswers } from "../../../../prisma/answer";
import { getAulaProgress, updateAulaProgress } from "../../../../prisma/aulaProgress";
import cmsClient from "../../../../services/cmsClient";
import { IAulaFindOne } from "../../../../types/CMS/Aula";

async function answerRoute(req: NextApiRequest, res: NextApiResponse) {
  const progressId = req.query.progressId as string;
  const {
    answers
  } = req.body as {
    progressId: string;
    answers: {
      aulaId: number;
      aulaProgressId: string;
      answers: number[]
      question: number;
    }[]
  };
  try {
    const savedAnswers = await createAnswers(answers);

    const progress = await getAulaProgress({
      userId: req.session.user.id,
      progressId,
    });

    if (!progress) return res.status(400).json({
      message: 'Bad request'
    })

    const aula = await cmsClient
      .get<IAulaFindOne>(`aulas/${progress?.aulaId}`, {
        params: {
          populate: "atividade.questions.answers",
        },
      })
      .then((res) => res.data);

    if (!aula.data.attributes.atividade) return res.status(400).json({
      message: "Bad request",
    });

    const totalQuestions =
      aula.data.attributes.atividade?.data.attributes.questions.length || 0;
    let totalCorrect = 0;
    aula.data.attributes.atividade?.data.attributes.questions.forEach(question => {
      const answer = answers.find(a => a.question === question.id);
      const isCorrect = question.answers?.every(a => a.isCorrect === answer?.answers.includes(a.id))
      if (isCorrect) {
        totalCorrect++;
      }
    })

    progress.isActivityFinished = true;
    progress.hasActivity = true;
    progress.totalQuestions = totalQuestions;
    progress.totalCorrect = totalCorrect;
    progress.activityId = aula.data.attributes.atividade.data.id;
    progress.finalGrade = Math.round((progress.totalCorrect / progress.totalQuestions) * 10)
    await updateAulaProgress({
      id: progress.id,
      data: progress
    })

    res.json(progress);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: (error as Error).message });
  }
}

export default withSessionRoute(answerRoute);
