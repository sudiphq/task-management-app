"use client";

import api from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center gap-y-6 min-h-dvh">
      <h1 className="text-4xl font-bold">Task Manager</h1>
      <Button
        onClick={async () => {
          await api.get("/").then((res) => alert(JSON.stringify(res.data)));
        }}
      >
        Make request
      </Button>
    </main>
  );
}
