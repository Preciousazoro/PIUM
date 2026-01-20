"use client";

import dynamic from "next/dynamic";

// Client-only wrapper that dynamically loads the client component with SSR disabled
const SubmitProofClient = dynamic(() => import("./SubmitProofClient"), {
  ssr: false,
});

export default function SubmitProofWrapper() {
  return <SubmitProofClient />;
}
