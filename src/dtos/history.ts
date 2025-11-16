interface GetQuizHistories {
  id: string;
  name: string;
  duration_in_sec: number;
  histories: { id: string; completed_at: string }[];
}

export type { GetQuizHistories };
