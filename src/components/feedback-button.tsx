"use client";

import Script from "next/script";

export default function FeedbackButton() {
  return (
    <>
      <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />
      <button
        data-tally-open="lb02WX"
        data-tally-layout="modal"
        data-tally-emoji-text="💬"
        data-tally-emoji-animation="wave"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-orange-600 active:scale-95"
      >
        💬 Feedback
      </button>
    </>
  );
}
