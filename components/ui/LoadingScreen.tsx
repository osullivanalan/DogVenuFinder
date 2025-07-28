import React from "react";

// components/UI/LoadingScreen.tsx
export default function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 text-white">
      {message}
    </div>
  );
}
