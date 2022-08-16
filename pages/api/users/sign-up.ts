// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import bcrypt from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser } from '../../../prisma/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { firstName, lastName, email, password } = req.body;

    //TODO: Missing check if user already exists and return error

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
