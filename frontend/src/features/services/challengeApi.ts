// Why: Central place for all API calls → easy to mock, add interceptors, change base URL, handle auth later
// Reusable across the app if more endpoints appear

import { env } from "@/lib/env";

export interface ChallengeData {
  slots: number;
  date: string; // ISO date string
}

export interface GuessResponse {
  status: "correct" | "wrong";
  message: string;
}

export async function fetchDailyChallenge(): Promise<ChallengeData> {
  const res = await fetch(`${env.apiUrl}/challenge`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store", // Why: daily challenge changes → avoid stale data
  });

  if (!res.ok) throw new Error("Failed to fetch challenge");
  return res.json();
}

export async function submitGuess(guess: string): Promise<GuessResponse> {
  const res = await fetch(`${env.apiUrl}/guess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guess }),
  });

  if (!res.ok) throw new Error("Failed to submit guess");
  return res.json();
}
