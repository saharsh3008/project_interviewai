
interface FeedbackResponse {
  score: number;
  overall: string;
  strengths: string;
  improvements: string;
  suggestions: string;
}

// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const GEMINI_API_URL = 'AIzaSyBT-2MwNCd7xDug1YmkuXQ7KAils6TJekk';

export const generateQuestion = async (category: string, apiKey: string, questionNumber: number = 1): Promise<string> => {
  const basePrompts = {
    technical: [
      "Generate a coding interview question about data structures and algorithms. Focus on arrays, linked lists, trees, or graphs.",
      "Create a system design question about building a scalable web application or distributed system.",
      "Ask about database design, optimization, or SQL query problems commonly seen in technical interviews.",
      "Generate a question about object-oriented programming concepts, design patterns, or software architecture.",
      "Create a problem-solving question involving time/space complexity analysis and optimization."
    ],
    behavioral: [
      "Generate a behavioral question about handling conflict or difficult team situations using the STAR method.",
      "Ask about a time when someone had to show leadership, take initiative, or influence others without authority.",
      "Create a question about overcoming challenges, learning from failure, or adapting to change.",
      "Generate a question about collaboration, teamwork, or working with diverse groups of people.",
      "Ask about prioritization, time management, or handling competing deadlines and pressures."
    ],
    'system-design': [
      "Design a social media platform like Twitter or Instagram, focusing on scalability and real-time features.",
      "Create a system design for an e-commerce platform, covering payments, inventory, and recommendations.",
      "Design a messaging system like WhatsApp or Slack, including real-time communication and file sharing.",
      "Ask about designing a video streaming service like Netflix or YouTube with global distribution.",
      "Generate a question about designing a ride-sharing app like Uber, including matching algorithms and real-time tracking."
    ],
    leadership: [
      "Ask about a time when someone had to make a difficult decision that affected their team or organization.",
      "Generate a question about building and motivating a team, including hiring and performance management.",
      "Create a scenario about managing organizational change, transformation, or strategic initiatives.",
      "Ask about handling underperformance, giving difficult feedback, or having crucial conversations.",
      "Generate a question about vision setting, goal alignment, and driving results through others."
    ],
    product: [
      "Ask about prioritizing features for a product roadmap with limited resources and competing stakeholder needs.",
      "Generate a question about analyzing user feedback, metrics, and data to make product decisions.",
      "Create a scenario about launching a new product feature, including go-to-market strategy and success metrics.",
      "Ask about competitive analysis and positioning a product in a crowded market.",
      "Generate a question about working with engineering teams to balance technical debt and feature development."
    ]
  };

  // Select a different prompt based on question number to ensure variety
  const prompts = basePrompts[category as keyof typeof basePrompts];
  const selectedPrompt = prompts[(questionNumber - 1) % prompts.length];

  const fullPrompt = `${selectedPrompt}

  Requirements for Question #${questionNumber}:
  - Make it specific, realistic, and different from typical interview questions
  - Suitable for mid to senior level positions  
  - Should take 3-5 minutes to answer properly
  - Include context or scenario if needed
  - Ensure this question is unique and varied from previous questions
  - Add specific details that make it engaging and memorable
  
  Return only the question, no additional text or formatting.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8, // Increased for more variety
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Details:', errorData);
      throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Error generating question:', error);
    throw new Error('Failed to generate question. Please check your API key and try again.');
  }
};

export const evaluateAnswer = async (
  question: string, 
  answer: string, 
  category: string, 
  apiKey: string
): Promise<FeedbackResponse> => {
  const prompt = `You are an expert interviewer evaluating a candidate's response. 

Question: "${question}"
Answer: "${answer}"
Category: ${category}

Please evaluate this answer and provide structured feedback in the following JSON format:

{
  "score": [number from 1-10],
  "overall": "[Excellent/Good/Average/Poor/Needs Improvement]",
  "strengths": "[What the candidate did well - be specific and encouraging]",
  "improvements": "[Areas that need work - be constructive and specific]",
  "suggestions": "[Actionable advice for improvement - include examples or techniques]"
}

Evaluation criteria:
- Technical accuracy (if applicable)
- Structure and clarity of response
- Depth of understanding
- Communication skills
- Relevance to the question
- Use of examples/specifics
- Problem-solving approach

Be constructive, encouraging, and specific in your feedback. Help the candidate improve while acknowledging their strengths.

Return only the JSON object, no additional text.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Details:', errorData);
      throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text.trim();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw new Error('Failed to evaluate answer. Please check your API key and try again.');
  }
};
