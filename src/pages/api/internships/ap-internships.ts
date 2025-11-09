// pages/api/internships/ap-internships.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req });
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/internships/ap-internships`, {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}