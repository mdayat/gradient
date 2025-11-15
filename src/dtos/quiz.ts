interface Quiz {
  id: string;
  name: string;
  duration_in_sec: number;
  created_at: string;
}

type GetQuizzes = Array<Quiz & { question_count: number }>;

export type { Quiz, GetQuizzes };
