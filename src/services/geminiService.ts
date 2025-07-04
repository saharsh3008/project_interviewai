
interface FeedbackResponse {
  score: number;
  overall: string;
  strengths: string;
  improvements: string;
  suggestions: string;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const generateQuestion = async (category: string, apiKey: string): Promise<string> => {
  const prompts = {
    technical: "Generate a challenging technical interview question for a software engineer position. Focus on algorithms, data structures, system design, or coding problems. Make it realistic and commonly asked in FAANG companies.",
    behavioral: "Generate a behavioral interview question that helps assess soft skills, teamwork, leadership, problem-solving, or conflict resolution. Use the STAR method framework.",
    'system-design': "Generate a system design interview question for a senior software engineer role. Focus on scalability, architecture, databases, caching, load balancing, or distributed systems.",
    leadership: "Generate a leadership interview question that assesses management skills, decision-making, team building, or strategic thinking abilities.",
    product: "Generate a product management interview question focusing on product strategy, user experience, metrics, prioritization, or market analysis."
  };

  const prompt = `${prompts[category as keyof typeof prompts]} 

  Requirements:
  - Make it specific and realistic
  - Suitable for mid to senior level positions  
  - Should take 3-5 minutes to answer properly
  - Include context or scenario if needed
  
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
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
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
