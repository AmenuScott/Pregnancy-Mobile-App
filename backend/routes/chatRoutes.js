const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// AI chat endpoint
router.post('/ask', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'OPENAI_API_KEY is not configured on the server' });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are PregWell, a knowledgeable and compassionate pregnancy assistant. You provide accurate, helpful, and supportive information about pregnancy, childbirth, and early parenting.

Your responses should be:
- Informative and evidence-based
- Warm and supportive
- Easy to understand
- Focused on pregnancy-related topics
- Safe and encouraging

Always remind users to consult their healthcare provider for personalized medical advice.`,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;
    res.status(200).json({ answer: aiResponse });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Failed to fetch AI response' });
  }
});

module.exports = router;
