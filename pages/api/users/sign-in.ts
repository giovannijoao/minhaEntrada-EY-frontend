
import axios from 'axios'
import bcrypt from 'bcryptjs'
import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { cmsUrl } from '../../../config'
import { sessionOptions } from '../../../lib/session'
import { getUserByEmail } from '../../../prisma/user'
import { User } from '../user'

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = await req.body

  try {
    const response = await axios.post(
      `${cmsUrl}/auth/local`,
      {
        identifier: email,
        password,
      }
    );
    req.session.user = {
      isLoggedIn: true,
      ...response.data.user
    };
    req.session.role = 'admin';
    await req.session.save();
    return res.json({
      success: true,
      role: 'admin'
    });
  } catch (error) {
    console.log(`Failed login at CMS admin. Trying local authentication. E-mail: ${email}`);
  }

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
    req.session.role = 'user';
    await req.session.save()
    res.json({
      success: true,
      role: 'user'
    })
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}

export default withIronSessionApiRoute(loginRoute, sessionOptions)