import { NotFound } from "@/components/NotFound";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { GetHistory } from "@/dtos/history";
import { handleAxiosError } from "@/lib/axios";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { deltaToHTMLString } from "@/utils/delta";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function History() {
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<GetHistory | null>(null);

  const router = useRouter();

  const [questionIdx, setQuestionIdx] = useState(0);
  const question = useMemo(() => {
    return history === null ? null : history.questions[questionIdx];
  }, [history, questionIdx]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<GetHistory>(
          `/api/quizzes/${router.query.quizId ?? ""}/histories/${
            router.query.historyId ?? ""
          }`
        );

        if (res.status === 200) {
          setHistory(res.data);
        } else {
          throw new Error(`unknown status code ${res.status}`);
        }
      } catch (error) {
        handleAxiosError(error, (res) => {
          if (!res || res.status >= 500) {
            console.error(new Error("failed to get history", { cause: error }));
            toast.error("Couldn't get history, please try again", {
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
  }, [router.query.historyId, router.query.quizId]);

  if (isLoading || question === null) {
    return (
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 grid place-items-center gap-2">
        <LoadingIndicator variant="bars" className="size-16" />
      </div>
    );
  }

  if (isNotFound || history === null) {
    return <NotFound />;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-2 py-4">
          <h2 className="font-bold text-xl">Navigation</h2>
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarMenu className="grid grid-cols-5">
            {history.questions.map((question, index) => (
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
          <Button asChild className="w-full">
            <Link href={`/quizzes/${history.quiz.id}/histories`}>Kembali</Link>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="overflow-hidden">
        <header className="flex h-16 shrink-0 justify-between items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="w-full flex justify-between items-center px-6">
            <h1 className="text-xl font-bold">{history.quiz.name}</h1>
            <div className="font-bold flex items-center gap-4">
              <span className="text-lg">Score:</span>{" "}
              <span className="text-2xl">{history.score}</span>
            </div>
          </div>
        </header>

        <main className="relative flex flex-1 flex-col gap-4 p-6">
          <div className="flex justify-center gap-4">
            <div
              dangerouslySetInnerHTML={{
                __html: deltaToHTMLString(JSON.parse(question.content)),
              }}
              className="basis-3/5 max-w-3xl rounded-xl border-2 p-3 text-xl [&_img]:h-72 [&_img]:w-72 [&_img]:object-cover [&_img]:object-center [&_ol]:my-4 [&_ol]:ml-8 [&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:justify-between [&_ol]:gap-y-0.5 [&_ul]:my-4 [&_ul]:ml-8 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:justify-between [&_ul]:gap-y-0.5"
            ></div>

            {question.type === "multiple_choice" ? (
              <RadioGroup
                disabled
                className="basis-2/5 flex flex-col gap-6 w-full max-w-md"
              >
                {question.answers.map((answer) => {
                  let borderColor = "border-muted";
                  const isSelectedAnswer = !!question.selectedAnswerIds.find(
                    (answerId) => answerId === answer.id
                  );

                  if (answer.is_correct) {
                    borderColor = "border-green-600";
                  } else if (isSelectedAnswer && answer.is_correct === false) {
                    borderColor = "border-destructive";
                  }

                  return (
                    <Label
                      key={answer.id}
                      htmlFor={answer.id}
                      className={`${borderColor} cursor-not-allowed flex items-center gap-4 border-2 p-4 rounded-md`}
                    >
                      <RadioGroupItem
                        value={answer.id}
                        id={answer.id}
                        checked={isSelectedAnswer}
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
                  let borderColor = "border-muted";
                  const isSelectedAnswer = !!question.selectedAnswerIds.find(
                    (answerId) => answerId === answer.id
                  );

                  if (answer.is_correct) {
                    borderColor = "border-green-600";
                  } else if (isSelectedAnswer && answer.is_correct === false) {
                    borderColor = "border-destructive";
                  }

                  return (
                    <Label
                      key={answer.id}
                      htmlFor={answer.id}
                      className={`${borderColor} cursor-not-allowed flex items-center gap-4 border-2 p-4 rounded-md`}
                    >
                      <Checkbox
                        disabled
                        id={answer.id}
                        checked={isSelectedAnswer}
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

          <div className="flex justify-center gap-4">
            <Accordion
              collapsible
              type="single"
              className="w-full basis-3/5 max-w-3xl"
            >
              <AccordionItem value="solution">
                <AccordionTrigger className="font-bold text-lg [&_svg]:size-5">
                  Lihat Pembahasan
                </AccordionTrigger>
                <AccordionContent asChild>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: deltaToHTMLString(JSON.parse(question.solution)),
                    }}
                    className="rounded-xl border-2 p-3 text-xl [&_img]:h-72 [&_img]:w-72 [&_img]:object-cover [&_img]:object-center [&_ol]:my-4 [&_ol]:ml-8 [&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:justify-between [&_ol]:gap-y-0.5 [&_ul]:my-4 [&_ul]:ml-8 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:justify-between [&_ul]:gap-y-0.5"
                  ></div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="basis-2/5 flex flex-col gap-6 w-full max-w-md"></div>
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
              disabled={questionIdx + 1 === history.questions.length}
              onClick={() => setQuestionIdx(questionIdx + 1)}
              className="w-32 rounded-full"
            >
              Next
            </Button>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
