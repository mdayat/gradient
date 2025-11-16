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

interface CreateUserQuizRequest {
  user_id: string;
  user_responses: { question_id: string; answer_id: string | null }[];
}

export type { GetQuizzes, GetQuiz, CreateUserQuizRequest };
