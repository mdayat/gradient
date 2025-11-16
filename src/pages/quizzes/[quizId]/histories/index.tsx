import { Layout } from "@/components/Layout";
import { NotFound } from "@/components/NotFound";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { GetQuizHistories } from "@/dtos/history";
import { handleAxiosError } from "@/lib/axios";
import { formatDateTime } from "@/utils/date";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import { toast } from "sonner";

type QuizHistoryColumnDef = {
  quiz_id: string;
  quiz_name: string;
} & GetQuizHistories["histories"][number];

const columns: ColumnDef<QuizHistoryColumnDef>[] = [
  { accessorKey: "quiz_name", header: "Quiz" },
  {
    accessorKey: "completed_at",
    header: "Tanggal",
    cell: ({ row }) => {
      return formatDateTime(new Date(row.original.completed_at));
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <Button asChild disabled variant="outline" size="sm">
          <Link
            href={`/quizzes/${row.original.quiz_id}/histories/${row.original.id}`}
          >
            Lihat Detail
          </Link>
        </Button>
      );
    },
  },
];

export default function Histories() {
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizHistories, setQuizHistories] = useState<GetQuizHistories | null>(
    null
  );

  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<GetQuizHistories>(
          `/api/quizzes/${router.query.quizId ?? ""}/histories`
        );

        if (res.status === 200) {
          setQuizHistories(res.data);
        } else {
          throw new Error(`unknown status code ${res.status}`);
        }
      } catch (error) {
        handleAxiosError(error, (res) => {
          if (!res || res.status >= 500) {
            console.error(
              new Error("failed to get quiz histories", { cause: error })
            );
            toast.error("Couldn't get quiz histories, please try again", {
              richColors: true,
            });
          } else {
            if (res.status === 404) {
              setIsNotFound(true);
            }
          }
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [router.query.quizId]);

  if (isLoading) {
    return (
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 grid place-items-center gap-2">
        <LoadingIndicator variant="bars" className="size-16" />
      </div>
    );
  }

  if (isNotFound || quizHistories === null) {
    return <NotFound />;
  }

  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-xl lg:text-2xl font-bold">
        Riwayat Quiz {quizHistories.name}
      </h1>

      <div className="block space-y-8">
        <DataTable
          columns={columns}
          data={quizHistories.histories.map((history) => ({
            id: history.id,
            completed_at: history.completed_at,
            quiz_id: quizHistories.id,
            quiz_name: quizHistories.name,
          }))}
        />
      </div>
    </div>
  );
}

Histories.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>;
};
