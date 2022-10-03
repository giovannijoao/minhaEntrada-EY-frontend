// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { useToast } from '@chakra-ui/react';
import bcrypt from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser, getUserByEmail } from '../../../prisma/user';
import { ErrorMessagesToast } from '../../../utils/constants/ErrorMessagesToast';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { firstName, lastName, email, password } = req.body;

    const verifyUserAlreadyExist = await getUserByEmail(email);
    if(verifyUserAlreadyExist)
      return res.status(500).json({ message: "Esse e-mail já possui um cadastro" || 'Internal server error' });

    const salt = await bcrypt.genSalt(process.env.PASSWORD_SALT ? Number(process.env.PASSWORD_SALT) : 10);
    const encryptedPassword = await bcrypt.hash(password, salt)
    const user = await createUser({
      firstName,
      lastName,
      email,
      password: encryptedPassword,
    });
    return res.json({
      id: user.id
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
