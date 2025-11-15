import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { User } from "@/dtos/user";
import { handleAxiosError } from "@/lib/axios";
import { toast } from "sonner";

const signUpSchema = z.object({
  email: z.email(),
  password: z.string(),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignUpFormValues) {
    setIsLoading(true);
    try {
      const res = await axios.post<User>("/api/auth/sign-up", values, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 201) {
        toast.success("Successfully signed-up", { richColors: true });
        form.reset();
      } else {
        throw new Error(`unknown status code ${res.status}`);
      }
    } catch (error) {
      handleAxiosError(error, (res) => {
        if (!res || res.status >= 500) {
          console.error(new Error("failed to sign-up", { cause: error }));
          toast.error("Couldn't sign-up, please try again", {
            richColors: true,
          });
        } else {
          if (res.status === 409) {
            toast.error("Email already registered", { richColors: true });
          }
        }
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground">Sign up to get started</p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full max-w-sm"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              disabled={
                isLoading ||
                form.watch("email") === "" ||
                form.watch("password") === ""
              }
              type="submit"
              className="w-full"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-foreground hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
