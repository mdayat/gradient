type GetQuizzes = Array<{
  id: string;
  name: string;
  duration_in_sec: number;
  question_count: number;
}>;

interface GetQuiz {
  id: string;
  name: string;
  duration_in_sec: number;
  questions: {
    id: string;
    content: string;
    solution: string;
    type: "multiple_choice" | "multiple_answer";
    answers: {
      id: string;
      content: string;
      is_correct: boolean;
    }[];
  }[];
}

export type { GetQuizzes, GetQuiz };
