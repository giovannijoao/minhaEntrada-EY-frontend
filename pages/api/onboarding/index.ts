import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../lib/withAuth";
import { createUser, getUserByEmail } from "../../../prisma/user";
import { IOnBoardingForm } from "../../onboarding";
import bcrypt from "bcryptjs";
import prisma from "../../../prisma/prisma";
import { startOfDay } from "date-fns";
import cmsClient from "../../../services/cmsClient";
import { IQuestionarioPerfilFindOne } from "../../../types/CMS/QuestionarioPerfil";

export default async function onboardingProcess(req: NextApiRequest, res: NextApiResponse) {
  const body = req.body as IOnBoardingForm;
  const { firstName, lastName, email, password, bornDate, phoneNumber, gender } = body;

  const verifyUserAlreadyExist = await getUserByEmail(email);
  if (verifyUserAlreadyExist)
    throw new Error("Esse e-mail já possui um cadastro");
  const salt = await bcrypt.genSalt(
    process.env.PASSWORD_SALT ? Number(process.env.PASSWORD_SALT) : 10
  );
  const encryptedPassword = await bcrypt.hash(password, salt);
  const user = await createUser({
    firstName,
    lastName,
    email,
    password: encryptedPassword,
    knowledgeItems: body.knowledgeItems.map((x) => x.name),
    bornDate: startOfDay(new Date(bornDate.split('-') as any)),
    phoneNumber,
    gender,
  });

  const [education, certifications] = await Promise.all([
    prisma.userEducation.createMany({
      data: body.education.map((ed) => ({
        ...ed,
        userId: user.id,
        startDate: startOfDay(new Date(ed.startDate)),
        endDate: startOfDay(new Date(ed.endDate)),
      })),
    }),
    prisma.userCertification.createMany({
      data: body.certifications.map((cert) => ({
        ...cert,
        userId: user.id,
        issueDate: startOfDay(new Date(cert.issueDate)),
        expiresAt: cert.expiresAt ? startOfDay(new Date(cert.expiresAt)) : undefined,
      })),
    }),
  ]);

  const questionarioPerfil = await cmsClient.get<IQuestionarioPerfilFindOne>(
    `questionario-perfil`,
    {
      params: {
        populate: ["questions.answers.perfil_usuarios"],
      },
    }
  );

  const answered = body.perfil.answers.map(x => parseInt(x.answerId as unknown as string));
  const questions = questionarioPerfil.data.data.attributes.questions.flatMap(question => {
    return question.answers.filter(answer => answered.includes(answer.id)).map(answer => {
      return {
        questionId: question.id,
        answerId: answer.id,
        perfis: answer.perfil_usuarios.data.map(x => x.id)
      }
    })
  });

  const perfilByQuestion = questions.flatMap(x => x.perfis.map(y => ({
    ...x,
    perfil: y
  }))).reduce((acc, cur) => {
    return {
      ...acc,
      [cur.perfil]: [...(acc[cur.perfil] || []), cur.questionId]
    }
  }, {} as {
    [key: number]: number[]
  });

  const score = Object.entries(perfilByQuestion).reduce((acc, cur) => {
    return {
      ...acc,
      [cur[0]]: cur[1].length / questions.length
    }
  }, {} as {
    [key: number]: number
  });

  await prisma.userScore.create({
    data: {
      result: score,
      userId: user.id,
    }
  })

  return res.json({
    success: true,
  })
}