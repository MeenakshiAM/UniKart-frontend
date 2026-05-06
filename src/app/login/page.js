import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-[#f5f0ff] via-[#ede4ff] to-[#e6dbff]">
          <div className="rounded-2xl px-8 py-6 text-sm text-[#5b4b8a] bg-white/70 backdrop-blur-md shadow-lg border border-[#d6c7ff]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#a78bfa] animate-pulse"></div>
              <span className="font-medium tracking-wide">
                Loading login...
              </span>
            </div>
          </div>
        </section>
      }
    >
      <LoginClient />
    </Suspense>
  );
}