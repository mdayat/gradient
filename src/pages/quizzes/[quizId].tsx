import { NotFound } from "@/components/NotFound";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { GetQuiz } from "@/dtos/quiz";
import { handleAxiosError } from "@/lib/axios";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Quiz() {
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quiz, setQuiz] = useState<GetQuiz | null>(null);
  const router = useRouter();

  const [questionIdx, setQuestionIdx] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSubmitDialogOpened, setIsSubmitDialogOpened] = useState(false);

  const question = useMemo(() => {
    return quiz?.questions[questionIdx];
  }, [questionIdx, quiz?.questions]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<GetQuiz>(
          `/api/quizzes/${router.query.quizId}`
        );

        if (res.status === 200) {
          setQuiz(res.data);
          setDuration(res.data.duration_in_sec);
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

  useEffect(() => {
    if (isLoading || isNotFound) {
      return;
    }

    let timeout: NodeJS.Timeout;
    if (duration === 0) {
      setIsSubmitDialogOpened(true);
    } else {
      timeout = setTimeout(() => {
        setDuration(duration - 1);
      }, 1000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [duration, isLoading, isNotFound]);

  if (isLoading) {
    return (
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 grid place-items-center gap-2">
        <LoadingIndicator variant="bars" className="size-16" />
      </div>
    );
  }

  if (isNotFound) {
    return <NotFound />;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="px-2 py-4">
          <SidebarMenu className="grid grid-cols-5">
            {quiz?.questions.map((question, index) => (
              <SidebarMenuItem key={question.id}>
                <SidebarMenuButton
                  isActive={questionIdx === index}
                  onClick={() => setQuestionIdx(index)}
                  className="border data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:border-none transition-all duration-300 flex justify-center items-center cursor-pointer w-9 h-9"
                >
                  {index + 1}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <Button
            onClick={() => setIsSubmitDialogOpened(true)}
            className="w-full"
          >
            Submit
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="overflow-hidden">
        <header className="flex h-16 shrink-0 justify-between items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          <div className="w-full flex justify-between items-center px-6">
            <h1 className="text-xl font-bold">{quiz?.name}</h1>
            <div className="flex justify-between items-center gap-4">
              <div className="flex flex-col items-center">
                <span className="w-9 h-9 flex justify-center items-center rounded-sm border">
                  {Math.floor(duration / 60)}
                </span>
                <span className="text-xs text-muted-foreground">min</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="w-9 h-9 flex justify-center items-center rounded-sm border">
                  {duration % 60}
                </span>
                <span className="text-xs text-muted-foreground">sec</span>
              </div>
            </div>
          </div>
        </header>

        <main className="relative flex flex-1 flex-col gap-4 p-6">
          {question?.content}

          <div className="ml-auto flex items-center gap-4">
            <Button
              disabled={questionIdx === 0}
              onClick={() => setQuestionIdx(questionIdx - 1)}
              className="w-32 rounded-full"
            >
              Prev
            </Button>

            <Button
              disabled={questionIdx + 1 === quiz?.questions.length}
              onClick={() => setQuestionIdx(questionIdx + 1)}
              className="w-32 rounded-full"
            >
              Next
            </Button>
          </div>
        </main>

        {isSubmitDialogOpened ? (
          <Dialog
            open={isSubmitDialogOpened}
            onOpenChange={(value) => {
              if (duration !== 0) {
                setIsSubmitDialogOpened(value);
              }
            }}
          >
            <DialogContent className="w-sm">
              <DialogHeader>
                <DialogTitle>
                  {duration === 0
                    ? "Waktu telah habis"
                    : "Kamu yakin mau submit semua jawaban di quiz ini?"}
                </DialogTitle>
                <DialogDescription>
                  {duration === 0 ? (
                    <>
                      Waktu pengerjaan quiz telah berakhir, silakan klik{" "}
                      <strong>Submit</strong> untuk menyelesaikan quiz.
                    </>
                  ) : (
                    "Setelah submit, kamu tidak bisa lagi mengubah jawaban kamu di semua soal."
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button className="w-full">
                  <span>{isLoading ? "Submitting..." : "Submit"}</span>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <></>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
