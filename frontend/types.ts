
export interface LearningData {
  day: string;
  minutes: number;
  lessons: number;
}

export interface UserStats {
  name: string;
  streak: number;
  xp: number;
  currentGoal: {
    title: string;
    progress: number;
    deadline: string;
  };
}

export interface AiInsight {
  tip: string;
  recommendedLesson: string;
}
