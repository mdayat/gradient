import { Layout } from "@/components/Layout";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthProvider";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Nunito } from "next/font/google";
import "@/styles/globals.css";

const nunito = Nunito({
  style: ["normal", "italic"],
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();

  return (
    <AuthProvider>
      <div className={nunito.className}>
        <Toaster position="top-right" />
        {pathname !== "/sign-in" && pathname !== "/sign-up" ? (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        ) : (
          <Component {...pageProps} />
        )}
      </div>
    </AuthProvider>
  );
}
