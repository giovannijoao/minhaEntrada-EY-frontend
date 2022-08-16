
import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { sessionOptions } from '../../../lib/session'
import { getUserByEmail } from '../../../prisma/user'
import bcrypt from 'bcryptjs'
import { User } from '../user'
import { createJornadaSubscription } from '../../../prisma/jornadasSubscription'

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  if (!req.session.user || !req.session.user.isLoggedIn) {
    return res.redirect('/login')
  }

  try {
    const subscription = await createJornadaSubscription({
      jornadaId: req.body.jornadaId,
      userId: req.session.user.id
    });
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}

export default withIronSessionApiRoute(loginRoute, sessionOptions);