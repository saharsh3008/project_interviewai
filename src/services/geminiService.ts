
interface FeedbackResponse {
  score: number;
  overall: string;
  strengths: string;
  improvements: string;
  suggestions: string;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const generateQuestion = async (
  category: string,
  apiKey: string,
  questionNumber: number = 1,
  context?: { resumeText?: string, jobDescription?: string }
): Promise<string> => {
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

  let fullPrompt = "";

  // Check if we have personal context
  if (context?.resumeText || context?.jobDescription) {
    fullPrompt = `You are an expert interviewer. I will provide you with a candidate's resume and/or a job description. 
    Your task is to generate a personalized interview question based on this context AND the category: "${category}".

    ${context.jobDescription ? `\nJOB DESCRIPTION:\n${context.jobDescription}\n` : ''}
    ${context.resumeText ? `\nCANDIDATE RESUME:\n${context.resumeText}\n` : ''}

    Requirements for Question #${questionNumber}:
    - The question MUST be relevant to the provided Resume/Job Description if applicable.
    - If a Job Description is provided, ask a question that tests if the candidate is a good fit for specific requirements in it.
    - If a Resume is provided, ask about specific projects, skills, or experiences listed in it.
    - If both are provided, try to bridge the gap (e.g., "I see you used React in Project X, how would you apply that to [Job Requirement]?").
    - Make it specific, realistic, and challenging.
    - Suitable for mid to senior level positions.
    - Should take 3-5 minutes to answer properly.
    - Return ONLY the question text.`;
  } else {
    // Fallback to generic prompt if no context
    fullPrompt = `${selectedPrompt}
  
    Requirements for Question #${questionNumber}:
    - Make it specific, realistic, and different from typical interview questions
    - Suitable for mid to senior level positions  
    - Should take 3-5 minutes to answer properly
    - Include context or scenario if needed
    - Ensure this question is unique and varied from previous questions
    - Add specific details that make it engaging and memorable
    - Return only the question, no additional text or formatting.`;
  }

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
  apiKey: string,
  type: 'voice' | 'text' | 'code' = 'voice'
): Promise<FeedbackResponse> => {
  let prompt = "";

  if (type === 'code') {
    prompt = `You are a Senior Software Engineer interviewing a candidate. 
    
    Question: "${question}"
    Candidate's Code Solution:
    \`\`\`
    ${answer}
    \`\`\`
    Category: ${category}
    
    Please evaluate this code solution and provide structured feedback in the following JSON format:
    
    {
      "score": [number from 1-10],
      "overall": "[Excellent/Good/Average/Poor/Needs Improvement]",
      "strengths": "[Comment on: Correctness, Efficiency (Big O), and Code Style]",
      "improvements": "[Specific bugs, edge cases missed, or style improvements]",
      "suggestions": "[Refactored code snippet or specific optimization advice]"
    }
    
    Evaluation criteria:
    - Correctness: Does the code solve the problem?
    - Efficiency: Time and Space complexity.
    - Code Quality: Naming, readability, best practices.
    - Edge Cases: Null checks, empty inputs, etc.
    
    Return only the JSON object, no additional text.`;
  } else {
    // Standard prompt for text/voice answers
    prompt = `You are an expert interviewer evaluating a candidate's response. 
    
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
  }

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
