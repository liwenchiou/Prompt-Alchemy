import { useEffect, useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { getFaqs } from "../../api/faqApi";

export default function FAQSection() {
  const [faqs, setFaqs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    getFaqs()
      .then((list) => {
        if (!isCurrent) return;
        setFaqs(list);
        setActiveId(null);
      })
      .catch(() => {
        if (!isCurrent) return;
        setFaqs([]);
        setError(true);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const handleRetry = async () => {
    setLoading(true);
    setError(false);

    try {
      const list = await getFaqs();
      setFaqs(list);
      setActiveId(null);
    } catch {
      setFaqs([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const entryCount = loading ? "--" : String(faqs.length).padStart(2, "0");

  return (
    <section
      aria-labelledby="faq-heading"
      aria-busy={loading}
      data-pencil-name="FAQ Section"
      className="w-full max-w-350 mt-16 pb-16 sm:pb-20"
    >
      <div className="grid overflow-hidden rounded-2xl border border-[#1A3A2A] bg-[#0D1423] shadow-[0_24px_80px_rgba(0,0,0,0.22)] lg:grid-cols-[minmax(230px,0.34fr)_minmax(0,1fr)]">
        <div
          aria-hidden="true"
          data-pencil-name="Knowledge Console"
          className="relative min-h-42 overflow-hidden border-b border-[#1A3A2A] px-6 py-7 text-left lg:min-h-full lg:border-r lg:border-b-0 lg:px-8 lg:py-10"
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-[#00FFFF] via-[#39FF14] to-transparent opacity-80" />
          <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-[#00FFFF]/6 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between gap-8 font-mono">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold tracking-[0.24em] text-[#00FFFF]">
                KNOWLEDGE CONSOLE
              </p>
              <p className="text-[22px] font-bold tracking-[-0.04em] text-[#E0F0E8]">
                FAQ INDEX
              </p>
            </div>

            <div className="flex items-end gap-3">
              <span className="text-[38px] leading-none font-bold text-[#39FF14]">
                {entryCount}
              </span>
              <span className="pb-1 text-[10px] leading-4 tracking-[0.16em] text-[#7DCEA0]">
                ACTIVE
                <br />
                ENTRIES
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 py-7 text-left sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <div className="mb-7 border-b border-[#39FF14]/15 pb-5">
            <p className="mb-2 font-mono text-[11px] tracking-[0.2em] text-[#7DCEA0]">
              &gt; HELP / QUICK ANSWERS
            </p>
            <h2
              id="faq-heading"
              className="m-0 text-[26px] leading-tight font-bold text-[#FFD700] sm:text-[30px]"
            >
              常見問題
            </h2>
            <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#7DCEA0] sm:text-[15px]">
              從瀏覽、收藏到複製使用，快速找到開始使用 Prompt 鍊金坊所需的答案。
            </p>
          </div>

          {loading && (
            <div role="status" className="space-y-3 text-[#7DCEA0]">
              <span className="sr-only">載入常見問題中…</span>
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  aria-hidden="true"
                  className="h-15 animate-pulse rounded-xl border border-[#1A3A2A] bg-[#111827] motion-reduce:animate-none"
                />
              ))}
            </div>
          )}

          {!loading && error && (
            <div
              role="alert"
              className="rounded-xl border border-[#FF8C00]/45 bg-[#FF8C00]/6 p-5"
            >
              <p className="text-[15px] leading-6 text-[#E0F0E8]">
                目前無法載入常見問題，請稍後再試。
              </p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#00FFFF]/70 bg-transparent px-4 py-2 text-[14px] font-semibold text-[#00FFFF] transition-colors hover:bg-[#00FFFF]/10 focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
              >
                <RotateCcw aria-hidden="true" size={15} />
                重新載入
              </button>
            </div>
          )}

          {!loading && !error && faqs.length === 0 && (
            <p
              role="status"
              className="rounded-xl border border-[#1A3A2A] bg-[#111827] p-5 text-[15px] text-[#7DCEA0]"
            >
              目前沒有可顯示的常見問題。
            </p>
          )}

          {!loading && !error && faqs.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-[#1A3A2A] bg-[#111827]">
              {faqs.map((faq, index) => {
                const isOpen = activeId === faq.id;
                const questionId = `faq-question-${faq.id}`;
                const answerId = `faq-answer-${faq.id}`;

                return (
                  <div
                    key={faq.id}
                    data-pencil-name="FAQ Item"
                    className={
                      index === 0 ? "" : "border-t border-[#1A3A2A]"
                    }
                  >
                    <button
                      type="button"
                      id={questionId}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setActiveId(isOpen ? null : faq.id)}
                      className={`flex w-full items-center justify-between gap-5 px-5 py-5 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#39FF14] motion-safe:transition-colors motion-safe:duration-200 sm:px-6 ${
                        isOpen
                          ? "bg-[#39FF14]/6 text-[#FFFFFF]"
                          : "bg-transparent text-[#E0F0E8] hover:bg-[#39FF14]/4"
                      }`}
                    >
                      <span className="text-[15px] leading-6 font-semibold sm:text-[16px]">
                        {faq.question}
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        size={19}
                        className={`shrink-0 text-[#39FF14] motion-safe:transition-transform motion-safe:duration-200 ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>

                    <div
                      id={answerId}
                      role="region"
                      aria-labelledby={questionId}
                      hidden={!isOpen}
                      data-pencil-name="FAQ Answer"
                      className="border-t border-[#39FF14]/10 bg-[#0A0E1A]/55 px-5 py-5 sm:px-6"
                    >
                      <p className="max-w-3xl text-[14px] leading-7 text-[#9ADDB5] sm:text-[15px]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
