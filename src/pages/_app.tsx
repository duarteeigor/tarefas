import { SessionProvider } from "next-auth/react"

import Header from "@/components/header";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Toaster position="top-center" />
      <Header />
      <Component {...pageProps} />
    </SessionProvider>
  )
}
