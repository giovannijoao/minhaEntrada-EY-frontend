
import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { sessionOptions } from '../../../lib/session'
import { getUserByEmail } from '../../../prisma/user'
import bcrypt from 'bcryptjs'
import { User } from '../user'

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = await req.body

  try {
    const dbUser = await getUserByEmail(email);

    if (!dbUser) {
      return res.status(401).json({
        message: 'Unauthorized'
      })
    }

    const { password: dbPassword, ...restUser } = dbUser;
    const comparePasswords = await bcrypt.compare(password, dbPassword);

    if (!comparePasswords) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    req.session.user = {
      isLoggedIn: true,
      ...restUser
    } as User
    await req.session.save()
    res.json(restUser)
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}

export default withIronSessionApiRoute(loginRoute, sessionOptions)