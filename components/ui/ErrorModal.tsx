// components/UI/ErrorModal.tsx
import React, { useState } from 'react';

export default function ErrorModal({ error }: { error: string }) {
  const [open, setOpen] = useState(Boolean(error));
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded shadow-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold mb-2">Error</h2>
        <p className="mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setOpen(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
}
