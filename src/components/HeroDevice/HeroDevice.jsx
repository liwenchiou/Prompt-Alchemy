import { useEffect, useState } from "react";

const SCRIPT_LINES = [
  { text: "> npm install prompt-alchemy", tone: "cmd" },
  { text: "✓ prompt-alchemy installed", tone: "ok" },
  { text: "", tone: "gap" },
  { text: "$ SELECT * FROM prompts", tone: "cmd" },
  { text: "✓ Found 66 prompts", tone: "ok" },
  { text: "> prompt copied!", tone: "accent" },
];

const toneClassMap = {
  cmd: "text-[#76F7BE]",
  ok: "text-[#4CE88A]",
  accent: "text-[#FFD400]",
  gap: "text-transparent",
};

export default function HeroDevice() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (lineIndex >= SCRIPT_LINES.length) {
      const resetTimer = window.setTimeout(() => {
        setLineIndex(0);
        setCharIndex(0);
      }, 5000);

      return () => window.clearTimeout(resetTimer);
    }

    const currentLine = SCRIPT_LINES[lineIndex].text;
    const isTypingDone = charIndex > currentLine.length;

    if (isTypingDone) {
      const nextLineDelay = currentLine.length === 0 ? 160 : 420;
      const nextLineTimer = window.setTimeout(() => {
        setLineIndex((prev) => prev + 1);
        setCharIndex(0);
      }, nextLineDelay);

      return () => window.clearTimeout(nextLineTimer);
    }

    const speed = currentLine.startsWith("$") ? 198 : 146;
    const typingTimer = window.setTimeout(() => {
      setCharIndex((prev) => prev + 1);
    }, speed);

    return () => window.clearTimeout(typingTimer);
  }, [lineIndex, charIndex]);

  return (
    <div className="hero-device-float relative w-75 sm:w-85 hero-device--default">
      <div
        className="hero-device-glow absolute -inset-4.5 rounded-[28px]"
        aria-hidden="true"
      />
      <div className="relative z-10 rounded-[26px] px-5 py-4 border border-[#39FF14]/60 bg-[#0A1022] shadow-[0_0_30px_rgba(57,255,20,0.25)]">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#7DFFA7]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFD400]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#C039FF]" />
        </div>

        <div className="rounded-xl bg-[#081126] px-4 py-4 text-left text-[13px] leading-7 text-[#76F7BE] shadow-inner shadow-[#39FF14]/10">
          <div className="min-h-35">
            {SCRIPT_LINES.map((line, index) => {
              const isDone = index < lineIndex;
              const isCurrentLine = index === lineIndex;
              const isFinalLinePause =
                lineIndex >= SCRIPT_LINES.length &&
                index === SCRIPT_LINES.length - 1;

              const visibleText = isDone
                ? line.text
                : isCurrentLine
                  ? line.text.slice(0, charIndex)
                  : "";

              return (
                <div
                  key={`${line.text}-${index}`}
                  className={toneClassMap[line.tone]}
                >
                  <span>{visibleText}</span>
                  {(isCurrentLine || isFinalLinePause) && (
                    <span className="hero-caret">|</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
