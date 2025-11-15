import { Layout } from "@/components/Layout";
import { TableAction } from "@/components/quiz/TableAction";
import { DataTable } from "@/components/ui/data-table";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { GetQuizzes } from "@/dtos/quiz";
import { handleAxiosError } from "@/lib/axios";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { ReactElement, useEffect, useState } from "react";
import { toast } from "sonner";

type QuizColumnDef = Pick<
  GetQuizzes[number],
  "id" | "name" | "question_count" | "duration_in_sec"
>;

const columns: ColumnDef<QuizColumnDef>[] = [
  { accessorKey: "name", header: "Quiz" },
  { accessorKey: "question_count", header: "Jumlah Soal" },
  {
    accessorKey: "duration_in_sec",
    header: "Durasi Pengerjaan",
    cell: ({ row }) => {
      const minutes = Math.floor(row.original.duration_in_sec / 60);
      const seconds = row.original.duration_in_sec % 60;

      const parts = [];
      if (minutes > 0) {
        parts.push(`${minutes}m`);
      }

      if (seconds > 0) {
        parts.push(`${seconds}s`);
      }

      if (parts.length === 0) {
        return "0s";
      }

      return parts.join(" ");
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return <TableAction quiz={row.original} />;
    },
  },
];

function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<GetQuizzes>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<GetQuizzes>("/api/quizzes");
        if (res.status === 200) {
          setQuizzes(res.data);
        } else {
          throw new Error(`unknown status code ${res.status}`);
        }
      } catch (error) {
        handleAxiosError(error, (res) => {
          if (!res || res.status >= 500) {
            console.error(new Error("failed to get quizzes", { cause: error }));
            toast.error("Couldn't get quizzes, please try again", {
              richColors: true,
            });
          }
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-xl lg:text-2xl font-bold">Bank Quiz</h1>
      {isLoading ? (
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 grid place-items-center gap-2">
          <LoadingIndicator variant="bars" className="size-16" />
        </div>
      ) : (
        <></>
      )}

      <div className={isLoading ? "hidden" : "block space-y-8"}>
        <DataTable
          columns={columns}
          data={quizzes.map((quiz) => ({
            id: quiz.id,
            name: quiz.name,
            question_count: quiz.question_count,
            duration_in_sec: quiz.duration_in_sec,
          }))}
        />
      </div>
    </div>
  );
}

Home.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>;
};

export default Home;
export type { QuizColumnDef };
