"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";

type Msg = {
  role: "bot" | "user";
  text: string;
  actions?: { label: string; q: string }[];
};

const HELP: Record<string, Msg> = {
  start: {
    role: "bot",
    text: "سلام! 👋 من راهنمای کسب‌یاب هستم. چه سؤالی دارید؟",
    actions: [
      { label: "ثبت کسب‌وکار", q: "ثبت کسب‌وکار" },
      { label: "اشتراک و ویترین", q: "اشتراک" },
      { label: "گزارش اطلاعات نادرست", q: "گزارش" },
      { label: "کارت‌ویزیت", q: "کارت‌ویزیت" },
      { label: "طراحان و معرفی", q: "طراح" },
    ],
  },
};

function answer(q: string): Msg {
  const t = q.replace(/\s+/g, " ").trim();
  if (/ثبت|کسب.*کار|پنل|owner|ورود/.test(t)) {
    return {
      role: "bot",
      text: "برای ثبت کسب‌وکار از بخش «پنل من» یا صفحه اصلی روی «ثبت کسب‌وکار من» بزنید. بعد از ثبت‌نام و تأیید حساب توسط مدیریت، می‌توانید پروفایل کسب‌وکار خود را بسازید. تا زمان تأیید، پروفایل عمومی نمایش داده نمی‌شود.",
    };
  }
  if (/اشتراک|ویترین|پلن|قیمت|هزینه|پرداخت/.test(t)) {
    return {
      role: "bot",
      text: "پروفایل، کارت معرفی، لینک اختصاصی و QR در طرح رایگان فعال است. با اشتراک «ویترین حرفه‌ای» گالری تصاویر بزرگ‌تر، معرفی کامل‌تر خدمات و قیمت‌ها فعال می‌شود. درخواست اشتراک را از پنل خود ثبت کنید؛ پس از بررسی مدیریت فعال می‌شود.",
    };
  }
  if (/گزارش|نادرست|اشتباه|خطا/.test(t)) {
    return {
      role: "bot",
      text: "در هر صفحه کسب‌وکار دکمه «گزارش اطلاعات نادرست» (در موبایل از نوار پایین) وجود دارد. گزارش‌ها مستقیماً به پنل مدیریت می‌رود و بررسی می‌شود.",
    };
  }
  if (/کارت|ویزیت|کارت‌ویزیت/.test(t)) {
    return {
      role: "bot",
      text: "در پنل مدیریت، کنار هر کسب‌وکار دکمه «کارت ویزیت» هست: قالب و رنگ و اندازه متن را انتخاب کنید؛ نام، تماس، آدرس و QR به‌صورت خودکار از پروفایل پر می‌شود و خروجی PNG با کیفیت چاپ دانلود می‌کنید.",
    };
  }
  if (/طراح|معرفی|کد معرف|پورسانت/.test(t)) {
    return {
      role: "bot",
      text: "طراحان کارت‌ویزیت در صفحه «طراحان» معرفی شده‌اند و هر کدام کد معرفی اختصاصی دارند. هنگام درخواست اشتراک، کد طراح را وارد کنید تا معرفی ثبت شود.",
    };
  }
  if (/تأیید|اعتماد|جواز|اتحادیه|ضمانت/.test(t)) {
    return {
      role: "bot",
      text: "نشان‌های «جواز کسب»، «عضویت اتحادیه» و «ضمانت» بر اساس اظهار خود کسب‌وکار نمایش داده می‌شود. نشان «تأیید پلتفرم» به‌معنای احراز توسط تیم کسب‌یاب است.",
    };
  }
  return {
    role: "bot",
    text: "برای راهنمایی دقیق‌تر می‌توانید از طریق گزارش‌ها یا پنل با ما در ارتباط باشید. سؤال‌های پرتکرار: ثبت کسب‌وکار، اشتراک، کارت‌ویزیت، طراحان و گزارش خطا.",
    actions: [
      { label: "ثبت کسب‌وکار", q: "ثبت کسب‌وکار" },
      { label: "اشتراک", q: "اشتراک" },
      { label: "گزارش اطلاعات نادرست", q: "گزارش" },
    ],
  };
}

export function SupportChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([HELP.start]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // در صفحات کسب‌وکار، نوار اقدام پایین جای ربات را می‌گیرد
  const hidden = pathname.startsWith("/business/") || pathname.startsWith("/admin");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  if (hidden) return null;

  function ask(q: string) {
    if (!q.trim()) return;
    setMsgs((prev) => [...prev, { role: "user", text: q }, answer(q)]);
    setInput("");
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 left-3 right-3 z-[70] mx-auto flex h-[26rem] max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-ink/20 ring-1 ring-slate-200 sm:bottom-6 sm:left-6 sm:right-auto sm:w-96"
            role="dialog"
            aria-label="پشتیبانی"
          >
            <div className="flex items-center justify-between bg-gradient-to-l from-primary-700 to-primary-600 px-4 py-3.5 text-white">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
                  <MessageCircle className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-extrabold">پشتیبانی کسب‌یاب</p>
                  <p className="text-[10px] text-primary-100">
                    پاسخگوی سؤالات پرتکرار
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="بستن"
                className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-white/15"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4">
              {msgs.map((m, i) =>
                m.role === "bot" ? (
                  <div key={i} className="flex items-end gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-white">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </span>
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-white px-3.5 py-2.5 text-xs leading-6 text-slate-700 shadow-sm ring-1 ring-slate-100">
                      {m.text}
                      {m.actions && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {m.actions.map((a) => (
                            <button
                              key={a.label}
                              onClick={() => ask(a.q)}
                              className="cursor-pointer rounded-full bg-primary-50 px-3 py-1.5 text-[11px] font-bold text-primary-700 ring-1 ring-inset ring-primary-200 transition-colors hover:bg-primary-100"
                            >
                              {a.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-primary px-3.5 py-2.5 text-xs leading-6 text-white">
                      {m.text}
                    </div>
                  </div>
                )
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2 border-t border-slate-100 bg-white p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="سؤال خود را بنویسید…"
                className="input flex-1 py-2.5 text-xs"
                aria-label="پیام شما"
              />
              <button
                type="submit"
                aria-label="ارسال"
                className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl bg-primary text-white transition-transform hover:scale-105"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "بستن پشتیبانی" : "باز کردن پشتیبانی"}
        className="fixed bottom-24 left-4 z-[60] grid h-13 w-13 cursor-pointer place-items-center rounded-full bg-primary p-3.5 text-white shadow-xl shadow-primary-600/30 sm:bottom-6 sm:left-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
