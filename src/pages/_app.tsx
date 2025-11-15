import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthProvider";
import type { AppProps } from "next/app";
import { Nunito } from "next/font/google";
import "@/styles/globals.css";
import { NextPage } from "next";
import { ReactElement, ReactNode } from "react";

const nunito = Nunito({
  style: ["normal", "italic"],
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout ??
    ((page: ReactElement) => {
      return page;
    });

  return (
    <AuthProvider>
      <div className={nunito.className}>
        <Toaster position="top-right" />
        {getLayout(<Component {...pageProps} />)}
      </div>
    </AuthProvider>
  );
}
