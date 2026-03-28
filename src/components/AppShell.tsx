"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (!name) {
      router.push("/login");
    } else {
      setUserName(name);
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-3xl animate-pulse">
            <span>{"💍"}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!userName) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-pink-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">{"💍"}</span>
            <div>
              <h1 className="text-lg font-bold leading-tight">
                {"Casamento C & P"}
              </h1>
            </div>
          </Link>
          <div className="text-right">
            <p className="text-xs text-pink-200">{"Olá,"}</p>
            <button
              onClick={() => {
                localStorage.removeItem("userName");
                router.push("/login");
              }}
              className="text-sm font-semibold text-white hover:text-pink-200 transition-colors"
            >
              {userName}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
        {children}
      </main>

      <footer className="bg-pink-800 text-pink-200 text-center py-3 text-xs">
        {"Desenvolvido por Christian Felipe Carvalho"}
      </footer>
    </div>
  );
}
