import { NotFound } from "@/components/NotFound";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { CreateUserQuizRequest, GetQuiz } from "@/dtos/quiz";
import { handleAxiosError } from "@/lib/axios";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { deltaToHTMLString } from "@/utils/delta";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthContext } from "@/contexts/AuthProvider";

type QuestionId = string;
type AnswerId = string;
type UserResponse = Map<QuestionId, Set<AnswerId>>;

function initUserResponse() {
  return new Map<QuestionId, Set<AnswerId>>();
}

export default function Quiz() {
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quiz, setQuiz] = useState<GetQuiz | null>(null);

  const { user } = useAuthContext();
  const router = useRouter();

  const [questionIdx, setQuestionIdx] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSubmitDialogOpened, setIsSubmitDialogOpened] = useState(false);
  const [userResponses, setUserResponses] =
    useState<UserResponse>(initUserResponse);

  const question = useMemo(() => {
    return quiz === null ? null : quiz.questions[questionIdx];
  }, [questionIdx, quiz]);

  const selectSingleAnswer = useCallback(
    (questionId: string, answerId: string) => {
      const answerIds = new Set<AnswerId>();
      answerIds.add(answerId);
      userResponses.set(questionId, answerIds);
      setUserResponses(new Map(userResponses));
    },
    [userResponses]
  );

  const selectMultipleAnswer = useCallback(
    (questionId: string, answerId: string) => {
      let answerIds = userResponses.get(questionId);
      if (answerIds === undefined) {
        answerIds = new Set<AnswerId>();
      }

      answerIds.add(answerId);
      userResponses.set(questionId, answerIds);
      setUserResponses(new Map(userResponses));
    },
    [userResponses]
  );

  const removeMultipleAnswer = useCallback(
    (questionId: string, answerId: string) => {
      const answerIds = userResponses.get(questionId);
      if (answerIds) {
        answerIds.delete(answerId);
        userResponses.set(questionId, answerIds);
        setUserResponses(new Map(userResponses));
      }
    },
    [userResponses]
  );

  const submitQuiz = useCallback(async () => {
    setIsLoading(true);
    const body: CreateUserQuizRequest = {
      user_id: user ? user.id : "",
      user_responses: [],
    };

    for (const [questionId, answerIds] of userResponses.entries()) {
      // user hasn't answer the question
      if (answerIds.size === 0) {
        body.user_responses.push({ question_id: questionId, answer_id: null });
        continue;
      }

      // question is multiple choice
      if (answerIds.size === 1) {
        const answerId = answerIds.values().toArray()[0];
        body.user_responses.push({
          question_id: questionId,
          answer_id: answerId,
        });
        continue;
      }

      // question is multiple answer
      for (const answerId of answerIds.values()) {
        body.user_responses.push({
          question_id: questionId,
          answer_id: answerId,
        });
      }
    }

    try {
      const res = await axios.post<
        string,
        AxiosResponse<string>,
        CreateUserQuizRequest
      >(`/api/quizzes/${quiz ? quiz.id : ""}/histories`, body, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 201) {
        router.replace(`/quizzes/${quiz ? quiz.id : ""}/histories`);
      } else {
        throw new Error(`unknown status code ${res.status}`);
      }
    } catch (error) {
      handleAxiosError(error, (res) => {
        if (!res || res.status >= 500) {
          console.error(new Error("failed to submit quiz", { cause: error }));
          toast.error("Couldn't submit quiz, please try again", {
            richColors: true,
          });
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [quiz, router, user, userResponses]);

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

  if (isLoading || question === null) {
    return (
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 grid place-items-center gap-2">
        <LoadingIndicator variant="bars" className="size-16" />
      </div>
    );
  }

  if (isNotFound || quiz === null) {
    return <NotFound />;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="px-2 py-4">
          <SidebarMenu className="grid grid-cols-5">
            {quiz.questions.map((question, index) => (
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
            <h1 className="text-xl font-bold">{quiz.name}</h1>
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
          <div className="flex justify-center gap-4">
            <div
              dangerouslySetInnerHTML={{
                __html: deltaToHTMLString(
                  JSON.parse(question ? question.content : "")
                ),
              }}
              className="basis-3/5 max-w-3xl rounded-xl border-2 p-3 text-xl [&_img]:h-72 [&_img]:w-72 [&_img]:object-cover [&_img]:object-center [&_ol]:my-4 [&_ol]:ml-8 [&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:justify-between [&_ol]:gap-y-0.5 [&_ul]:my-4 [&_ul]:ml-8 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:justify-between [&_ul]:gap-y-0.5"
            ></div>

            {question.type === "multiple_choice" ? (
              <RadioGroup
                onValueChange={(answerId: string) =>
                  selectSingleAnswer(question.id, answerId)
                }
                className="basis-2/5 flex flex-col gap-6 w-full max-w-md"
              >
                {question.answers.map((answer) => {
                  return (
                    <Label
                      key={answer.id}
                      htmlFor={answer.id}
                      className="cursor-pointer flex items-center gap-4 border-2 p-4 rounded-md"
                    >
                      <RadioGroupItem
                        value={answer.id}
                        id={answer.id}
                        checked={userResponses.get(question.id)?.has(answer.id)}
                        className="cursor-pointer"
                      />

                      <div
                        dangerouslySetInnerHTML={{
                          __html: deltaToHTMLString(JSON.parse(answer.content)),
                        }}
                        className="[&_img]:h-[200px] [&_img]:w-[200px] [&_img]:object-cover [&_img]:object-center"
                      ></div>
                    </Label>
                  );
                })}
              </RadioGroup>
            ) : (
              <div className="basis-2/5 flex flex-col gap-6 w-full max-w-md">
                {question.answers.map((answer) => {
                  return (
                    <Label
                      key={answer.id}
                      htmlFor={answer.id}
                      className="cursor-pointer flex items-center gap-4 border-2 p-4 rounded-md"
                    >
                      <Checkbox
                        id={answer.id}
                        checked={userResponses.get(question.id)?.has(answer.id)}
                        onCheckedChange={(checked) =>
                          checked
                            ? selectMultipleAnswer(question.id, answer.id)
                            : removeMultipleAnswer(question.id, answer.id)
                        }
                        className="cursor-pointer"
                      />

                      <div
                        dangerouslySetInnerHTML={{
                          __html: deltaToHTMLString(JSON.parse(answer.content)),
                        }}
                        className="[&_img]:h-[200px] [&_img]:w-[200px] [&_img]:object-cover [&_img]:object-center"
                      ></div>
                    </Label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="ml-auto mt-auto flex items-center gap-4">
            <Button
              disabled={questionIdx === 0}
              onClick={() => setQuestionIdx(questionIdx - 1)}
              className="w-32 rounded-full"
            >
              Prev
            </Button>

            <Button
              disabled={questionIdx + 1 === quiz.questions.length}
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
                <Button onClick={submitQuiz} className="w-full">
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
