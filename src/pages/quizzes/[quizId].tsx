import { NotFound } from "@/components/NotFound";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { GetQuiz } from "@/dtos/quiz";
import { handleAxiosError } from "@/lib/axios";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Quiz() {
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quiz, setQuiz] = useState<GetQuiz | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<GetQuiz>(
          `/api/quizzes/${router.query.quizId}`
        );

        if (res.status === 200) {
          setQuiz(res.data);
        } else {
          throw new Error(`unknown status code ${res.status}`);
        }
      } catch (error) {
        handleAxiosError(error, (res) => {
          if (!res || res.status >= 500) {
            console.error(new Error("failed to get quiz", { cause: error }));
            toast.error("Couldn't get quiz, please try again", {
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

  if (isNotFound) {
    return <NotFound />;
  }

  return (
    <div>
      {isLoading ? (
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 grid place-items-center gap-2">
          <LoadingIndicator variant="bars" className="size-16" />
        </div>
      ) : (
        <></>
      )}

      <div className={isLoading ? "hidden" : "block space-y-8"}>
        {quiz?.name}
      </div>
    </div>
  );
}
