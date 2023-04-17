import Head from "next/head";
import { Inter } from "next/font/google";
import Nav from "@/components/Nav";
import { AppShell, useMantineTheme } from "@mantine/core";
import ChatDisplay from "@/components/ChatDisplay";
import ChatInput from "@/components/ChatInput";
import Hero from "@/components/Hero";
import { useChatStore } from "@/stores/ChatStore";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useUser } from '@auth0/nextjs-auth0/client';

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const theme = useMantineTheme();
  
  const apiKey = useChatStore((state) => state.apiKey);
  const [isHydrated, setIsHydrated] = useState(false);
  // const isLoggedIn = useChatStore((state) => state.apiKey);
  const { user, error, isLoading } = useUser();

  //Wait till NextJS rehydration completes
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  const AudioRecorder = dynamic(() => import("@/components/AudioRecorder"), {
    ssr: false,
  });

  return (
    <>
      <Head>
        <title>Alumin.ai</title>
        <meta name="description" content="A new way to do work" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
      </Head>
      <AppShell
        padding={0}
        navbar={<Nav />}
        layout="alt"
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        styles={(theme) => ({
          main: {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        })}
      >
        <div style={{ position: "relative", height: "100%" }}>
          {user ? <ChatDisplay /> : <Hero />}
          {user && <ChatInput />}
        </div>
      </AppShell>
      <AudioRecorder />
    </>
  );
}
