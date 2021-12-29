import { withApiAuthRequired, getAccessToken, getSession } from '@auth0/nextjs-auth0';
import * as http from '../../../lib/http'

export default withApiAuthRequired(async function shows(req, res) {
  try {
    const session = await getSession(req, res);

    console.log('accessToken', await getSession(req, res));

    const baseURL = process.env.NEXT_PUBLIC_API || '';
    const path = (req.query.path as string[]).join('/');
    // This is a contrived example, normally your external API would exist on another domain.
    const response = await http[req.method as keyof typeof http]<any>(baseURL + '/' + path, req.body, {
      headers: {
        Authorization: session ? `Bearer ${session.idToken}` : undefined
      }
    });

    const result = await response.json();
    res.status(response.status || 200).json(result);
  } catch (error) {
    console.error(error);
    // res.status(error.status || 500).json({
    //   code: error.code,
    //   error: error.message
    // });
  }
});