import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie_consent");
    if (!accepted) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "yes");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-2xl animate-fade-up">
      <div className="bg-white rounded-2xl shadow-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4" style={{ borderColor: "rgba(12,184,160,0.2)" }}>
        <div className="flex items-start gap-3 flex-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--teal-light)" }}>
            <Icon name="Cookie" size={18} style={{ color: "var(--teal)" }} />
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--dark)" }}>
            Мы используем файлы cookie, чтобы сайт работал лучше. Продолжая пользоваться сайтом, вы соглашаетесь с обработкой данных в соответствии с{" "}
            <a href="/privacy" className="underline font-medium" style={{ color: "var(--teal)" }}>политикой конфиденциальности</a>.
          </p>
        </div>
        <button onClick={accept} className="btn-primary px-6 py-2.5 text-sm font-semibold whitespace-nowrap w-full sm:w-auto">
          Принять
        </button>
      </div>
    </div>
  );
}
