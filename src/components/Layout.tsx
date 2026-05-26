import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 animate-page">
        {children}
      </main>
      <footer className="text-center text-xs text-muted-foreground py-6">
        Made with 💙 for super students
      </footer>
    </div>
  );
}
