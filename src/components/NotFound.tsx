import { Button } from "@/components/ui/button";
import Link from "next/link";

function NotFound() {
  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
      <div className="text-center space-y-6 px-4 max-w-md mx-auto">
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-bold text-primary">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            Page Not Found
          </h2>
        </div>

        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It
          might have been moved, deleted, or you entered the wrong URL.
        </p>

        <div className="pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">Go Back Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export { NotFound };
