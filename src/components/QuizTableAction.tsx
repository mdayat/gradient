import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import Link from "next/link";
import { QuizColumnDef } from "@/pages";

interface QuizTableActionProps {
  quiz: QuizColumnDef;
}

function QuizTableAction({ quiz }: QuizTableActionProps) {
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
  const [isStartDialogOpened, setIsStartDialogOpened] = useState(false);

  return (
    <DropdownMenu open={isDropdownOpened} onOpenChange={setIsDropdownOpened}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={(event) => {
            event.preventDefault();
            setIsStartDialogOpened(true);
          }}
          className="cursor-pointer"
        >
          Mulai
        </DropdownMenuItem>

        {isStartDialogOpened ? (
          <Dialog
            open={isStartDialogOpened}
            onOpenChange={setIsStartDialogOpened}
          >
            <DialogContent className="w-sm">
              <DialogHeader>
                <DialogTitle>{quiz.name}</DialogTitle>
                <DialogDescription>
                  Dengan menekan <strong>Mulai</strong> kamu akan langsung
                  diarahkan ke soal pertama.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button asChild type="button" className="w-full">
                  <Link href={`/quizzes/${quiz.id}`}>Mulai</Link>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <></>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { QuizTableAction };
