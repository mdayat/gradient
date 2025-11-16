interface GetQuizHistories {
  id: string;
  name: string;
  duration_in_sec: number;
  histories: { id: string; completed_at: string }[];
}

interface GetHistory {
  id: string;
  completed_at: string;
  quiz: {
    id: string;
    name: string;
    duration_in_sec: number;
  };
  questions: {
    id: string;
    content: string;
    solution: string;
    type: "multiple_choice" | "multiple_answer";
    selectedAnswerIds: Array<string | null>;
    answers: {
      id: string;
      content: string;
      is_correct: boolean;
    }[];
  }[];
}

export type { GetQuizHistories, GetHistory };
