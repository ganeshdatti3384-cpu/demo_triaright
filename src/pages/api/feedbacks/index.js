// pages/api/feedbacks/index.js
import Feedback from '../../../models/Feedback';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const feedbacks = await Feedback.find().sort({ createdAt: -1 });
      res.status(200).json(feedbacks);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, feedback } = req.body;
      const newFeedback = new Feedback({ name, feedback });
      await newFeedback.save();
      res.status(201).json(newFeedback);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}