import { Router, Request, Response } from 'express';

const router = Router();

// Sample cultural challenges data for demo
const sampleChallenges = [
  {
    id: "1",
    category: 'communication',
    title: 'Small Talk in Canada',
    description: 'Learn appropriate conversation starters for Canadian workplace culture',
    difficulty: 'beginner',
    timeEstimate: '2-3 minutes',
    points: 10,
    country: 'Canada',
    scenario: 'You are at a coffee break with your Canadian colleagues. Someone mentions the weather has been particularly cold this week. What would be an appropriate response to continue the conversation?',
    options: [
      'Yes, I hate this weather. In my country, it\'s much better.',
      'Oh really? I\'m still getting used to Canadian winters. Do you have any tips for staying warm?',
      'I don\'t really notice the weather.',
      'Why do Canadians always talk about weather?'
    ],
    correctAnswer: 1,
    explanation: 'This response shows interest, acknowledges your newcomer status positively, and asks for advice, which Canadians appreciate helping with.',
    culturalTip: 'Canadians often use weather as a neutral, safe conversation starter. Showing openness to learning about local customs and asking for advice builds rapport.',
    completed: false
  },
  {
    id: "2", 
    category: 'academic',
    title: 'Classroom Participation in Australia',
    description: 'Understanding appropriate classroom interaction styles in Australian universities',
    difficulty: 'intermediate',
    timeEstimate: '3-4 minutes',
    points: 15,
    country: 'Australia',
    scenario: 'During a university lecture in Australia, the professor asks if anyone has questions about the topic. You have a question but notice no one else is raising their hand. What should you do?',
    options: [
      'Wait until after class to ask privately',
      'Raise your hand and ask your question',
      'Ask your classmate sitting next to you quietly',
      'Save the question for the tutorial session'
    ],
    correctAnswer: 1,
    explanation: 'Australian academic culture encourages active participation. Professors appreciate questions during lectures and see it as engagement.',
    culturalTip: 'Australian education values student participation and critical thinking. Don\'t be afraid to ask questions or share your perspective during class.',
    completed: false
  },
  {
    id: "3",
    category: 'social',
    title: 'Weekend Invitations in the UK',
    description: 'Navigating social invitations and British politeness culture',
    difficulty: 'intermediate',
    timeEstimate: '3-4 minutes',
    points: 15,
    country: 'United Kingdom',
    scenario: 'A British classmate says "You should come round for dinner sometime" after a casual conversation. How should you interpret and respond to this invitation?',
    options: [
      'Ask immediately when would be convenient and suggest this weekend',
      'Thank them and say "That sounds lovely, I\'d like that"',
      'Ignore it as they probably don\'t really mean it',
      'Invite them to your place first to return the gesture'
    ],
    correctAnswer: 1,
    explanation: 'This is often a polite expression of friendliness rather than an immediate invitation. A warm acknowledgment leaves the door open for future planning.',
    culturalTip: 'British social interactions often involve indirect communication. "Sometime" usually means they\'re open to friendship but not making specific plans yet.',
    completed: false
  },
  {
    id: "4",
    category: 'professional',
    title: 'Job Interview in Germany',
    description: 'Understanding German workplace formality and directness',
    difficulty: 'advanced',
    timeEstimate: '4-5 minutes',
    points: 20,
    country: 'Germany',
    scenario: 'In a job interview in Germany, the interviewer asks about a gap in your employment history. You took time off for personal reasons. How should you respond?',
    options: [
      'Give a detailed explanation of your personal circumstances',
      'Briefly explain it was for personal development and pivot to your qualifications',
      'Say it\'s private and you prefer not to discuss it',
      'Make up a professional reason to avoid personal details'
    ],
    correctAnswer: 1,
    explanation: 'Germans appreciate direct, honest communication but respect privacy. A brief, truthful response that redirects to professional strengths works best.',
    culturalTip: 'German workplace culture values directness and efficiency. Be honest but concise, and always connect back to your professional capabilities.',
    completed: false
  },
  {
    id: "5",
    category: 'daily_life',
    title: 'Public Transport Etiquette in Japan',
    description: 'Learning proper behavior on Japanese public transportation',
    difficulty: 'beginner',
    timeEstimate: '2-3 minutes',
    points: 10,
    country: 'Japan',
    scenario: 'You\'re on a crowded train in Tokyo during rush hour. Your phone rings. What should you do?',
    options: [
      'Answer the call and speak quietly',
      'Let it ring and call back later',
      'Answer and quickly say you\'ll call back',
      'Step off at the next station to take the call'
    ],
    correctAnswer: 2,
    explanation: 'The most culturally appropriate response is to briefly answer and promise to call back, showing respect for others while acknowledging the caller.',
    culturalTip: 'Japanese public transport etiquette emphasizes not disturbing others. Phone calls are generally avoided, but a brief acknowledgment is acceptable.',
    completed: false
  }
];

// Sample user progress data
const sampleProgress = {
  totalPoints: 35,
  challengesCompleted: 2,
  streakDays: 3,
  lastCompletedDate: new Date().toISOString(),
  categoryProgress: {
    communication: 20,
    social: 15,
    academic: 30,
    daily_life: 10,
    professional: 5
  }
};

// GET /api/cultural-adaptation/progress - Get user's progress
router.get('/progress', (req: Request, res: Response) => {
  try {
    res.json(sampleProgress);
  } catch (error) {
    console.error('Error fetching cultural progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// GET /api/cultural-adaptation/challenges - Get available challenges
router.get('/challenges', (req: Request, res: Response) => {
  try {
    const { category, difficulty } = req.query;
    let filteredChallenges = [...sampleChallenges];

    if (category && category !== 'all') {
      filteredChallenges = filteredChallenges.filter(c => c.category === category);
    }

    if (difficulty && difficulty !== 'all') {
      filteredChallenges = filteredChallenges.filter(c => c.difficulty === difficulty);
    }

    res.json(filteredChallenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// POST /api/cultural-adaptation/complete - Complete a challenge
router.post('/complete', (req: Request, res: Response) => {
  try {
    const { challengeId, answer } = req.body;

    if (!challengeId || answer === undefined) {
      return res.status(400).json({ error: 'Challenge ID and answer are required' });
    }

    const challenge = sampleChallenges.find(c => c.id === challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const isCorrect = answer === challenge.correctAnswer;
    const pointsEarned = isCorrect ? challenge.points : Math.floor(challenge.points / 2);

    // Mark challenge as completed
    challenge.completed = true;

    res.json({
      correct: isCorrect,
      points: pointsEarned,
      explanation: challenge.explanation,
      culturalTip: challenge.culturalTip
    });
  } catch (error) {
    console.error('Error completing challenge:', error);
    res.status(500).json({ error: 'Failed to complete challenge' });
  }
});

export default router;