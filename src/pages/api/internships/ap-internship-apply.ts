// pages/api/internships/ap-internship-apply.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = await getToken({ req });
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { internshipId, amount, currency, mode, applicationData } = req.body;

    const response = await fetch(`${process.env.BACKEND_URL}/api/internships/ap-internship-apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`
      },
      body: JSON.stringify({
        internshipId,
        amount,
        currency,
        mode,
        applicationData,
        userId: token.id
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error in internship application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}