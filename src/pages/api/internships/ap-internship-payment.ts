// pages/api/internships/ap-internship-payment.ts
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
    const { internshipId, amount, applicationId } = req.body;

    const response = await fetch(`${process.env.BACKEND_URL}/api/internships/ap-internship-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`
      },
      body: JSON.stringify({
        internshipId,
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        applicationId
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}