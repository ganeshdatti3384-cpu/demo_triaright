// pages/api/feedbacks/[id].js
import Feedback from '../../../models/Feedback';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const feedback = await Feedback.findById(id);
      if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, feedback } = req.body;
      const updated = await Feedback.findByIdAndUpdate(
        id,
        { name, feedback },
        { new: true, runValidators: true }
      );
      if (!updated) return res.status(404).json({ message: 'Feedback not found' });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deleted = await Feedback.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ message: 'Feedback not found' });
      res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}