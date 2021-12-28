
import type { NextApiRequest, NextApiResponse } from 'next';
import { POST } from '../../../lib/http.server';
import { getSession } from '@auth0/nextjs-auth0';

// see https://auth0.com/docs/api/management/v2#!/Jobs/post_verification_email
// for help with testing api: https://manage.auth0.com/dashboard/us/dev-cacusr1l/apis/6156a07ac3f66f00426f699e/test
async function resendVerification (req: NextApiRequest, res: NextApiResponse) {

  const session = getSession(req, res);
  const uuid = session!.user.sub;

  const { access_token } = await POST(process.env.AUTH0_ISSUER_BASE_URL + '/oauth/token', {
    grant_type: 'client_credentials',
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    client_id: process.env.AUTH0_CLIENT_ID,
    // retrieve audience from https://manage.auth0.com/dashboard/us/dev-cacusr1l/apis
    audience: 'https://dev-cacusr1l.us.auth0.com/api/v2/'
  }, {
    headers: {
      Authorization: `Bearer ${process.env.AUTH0_MGMT_API_ACCESS_TOKEN}`
    }
  });

  await POST(process.env.AUTH0_ISSUER_BASE_URL + '/api/v2/jobs/verification-email', {
    user_id: uuid
  }, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  });

  res.status(200).end();
}

export default resendVerification;