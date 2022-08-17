
import { NextApiRequest, NextApiResponse } from 'next'
import { withSessionRoute } from '../../../lib/withAuth'
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

export default withSessionRoute(loginRoute);