const express = require('express');
const router = express.Router();

// Generate anime quiz question using Gemini AI
router.post('/generate', async (req, res) => {
  console.log('🎯 Quiz generate endpoint hit');
  try {
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ No API key found');
      return res.status(503).json({ 
        error: 'AI service not configured. Please add GEMINI_API_KEY to .env file' 
      });
    }
    console.log('✅ API key found, making request to Gemini...');

    const prompt = `You are an anime trivia expert. Generate a unique anime quiz question from popular series like One Piece, Bleach, Attack on Titan, Dragon Ball, My Hero Academia, Demon Slayer, Death Note, Sword Art Online, Hunter x Hunter, Tokyo Ghoul, Jujutsu Kaisen, and Fullmetal Alchemist. NEVER include Naruto.

Generate a new unique anime trivia question. Make it challenging but fair. The answer should be 3-12 characters.

Return ONLY a valid JSON object with this exact format (no markdown, no extra text):
{"question": "question text", "answer": "UPPERCASE_ANSWER", "anime": "Anime Name", "hint": "helpful hint"}

The answer should be a single word or short phrase in UPPERCASE with no spaces (use underscores if needed).`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 1.0,
            maxOutputTokens: 200,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text.trim();
    
    // Parse the JSON response
    let questionData;
    try {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      questionData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid response format from AI');
    }

    // Validate the response
    if (!questionData.question || !questionData.answer || !questionData.anime || !questionData.hint) {
      throw new Error('Incomplete question data from AI');
    }

    // Ensure answer is uppercase and clean
    questionData.answer = questionData.answer.toUpperCase().replace(/\s+/g, '');

    res.json(questionData);
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate question',
      details: error.message 
    });
  }
});

module.exports = router;
