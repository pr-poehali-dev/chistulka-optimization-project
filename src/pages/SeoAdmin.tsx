import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import Icon from "@/components/ui/icon";

const API_URL =
  "https://functions.poehali.dev/0cb39cbb-0651-41ab-bd6f-8c9932206449";

interface PageSeo {
  page_key: string;
  page_label: string;
  title: string;
  description: string;
  keywords: string;
  schema_json: string;
  updated_at: string | null;
}

interface SeoData {
  pages: PageSeo[];
  robots: string;
}

type Tab = "pages" | "robots" | "sitemap";

// Компонент превью поисковой выдачи
const SearchPreview = ({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) => (
  <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10">
    <p className="text-xs mb-1 text-white/30">Превью в поиске:</p>
    <p className="text-sm text-[#4285f4] line-clamp-1">
      {title || "Заголовок не задан"}
    </p>
    <p className="text-xs mt-0.5 text-[#0d904f]">{url}</p>
    {description && (
      <p className="text-xs mt-0.5 text-white/50 line-clamp-2">{description}</p>
    )}
  </div>
);

// Компонент индикатора длины
const LengthIndicator = ({
  length,
  max,
  label,
}: {
  length: number;
  max: number;
  label: string;
}) => {
  const getColor = () => {
    if (length > max) return "#ef4444";
    if (length > max - 10) return "#f59e0b";
    return "rgba(255,255,255,0.3)";
  };

  return (
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-xs font-semibold text-white/60">{label}</label>
      <span className="text-xs" style={{ color: getColor() }}>
        {length}/{max}
      </span>
    </div>
  );
};

// Компонент списка страниц
const PageList = ({
  pages,
  selectedPage,
  onSelectPage,
}: {
  pages: PageSeo[];
  selectedPage: PageSeo | null;
  onSelectPage: (page: PageSeo) => void;
}) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-white/40">
      Страницы ({pages.length})
    </p>
    <div className="max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar space-y-2 pr-1">
      {pages.map((page) => (
        <button
          key={page.page_key}
          onClick={() => onSelectPage(page)}
          className="w-full text-left px-4 py-3 rounded-xl transition-all group"
          style={{
            background:
              selectedPage?.page_key === page.page_key
                ? "rgba(12,184,160,0.15)"
                : "#1e293b",
            border:
              selectedPage?.page_key === page.page_key
                ? "1px solid var(--teal)"
                : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="text-sm font-medium text-white line-clamp-1">
            {page.page_label}
          </div>
          <div className="text-xs mt-0.5 truncate text-white/35">
            {page.page_key}
          </div>
          <div className="flex gap-2 mt-2">
            <span
              className="text-xs px-1.5 py-0.5 rounded transition-colors"
              style={{
                background: page.title
                  ? "rgba(12,184,160,0.2)"
                  : "rgba(255,255,255,0.06)",
                color: page.title ? "var(--teal)" : "rgba(255,255,255,0.3)",
              }}
            >
              Title {page.title ? "✓" : "—"}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded transition-colors"
              style={{
                background: page.description
                  ? "rgba(12,184,160,0.2)"
                  : "rgba(255,255,255,0.06)",
                color: page.description
                  ? "var(--teal)"
                  : "rgba(255,255,255,0.3)",
              }}
            >
              Desc {page.description ? "✓" : "—"}
            </span>
          </div>
        </button>
      ))}
    </div>
  </div>
);

export default function SeoAdmin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<SeoData | null>(null);
  const [tab, setTab] = useState<Tab>("pages");
  const [selectedPage, setSelectedPage] = useState<PageSeo | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    keywords: "",
    schema_json: "",
  });
  const [robots, setRobots] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${password}`,
    }),
    [password],
  );

  // Login function
  const login = useCallback(async () => {
    if (!password) return;

    setLoading(true);
    setAuthError(false);
    setError(null);

    try {
      const res = await fetch(API_URL, { headers });

      if (res.status === 401) {
        setAuthError(true);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json: SeoData = await res.json();
      setData(json);
      setRobots(json.robots);
      setAuthed(true);

      // Сохраняем пароль в sessionStorage (опционально)
      sessionStorage.setItem("seo_admin_auth", "true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка подключения");
      setAuthError(true);
    } finally {
      setLoading(false);
    }
  }, [password, headers]);

  // Reload data
  const reload = useCallback(async () => {
    try {
      const res = await fetch(API_URL, { headers });
      if (res.ok) {
        const json: SeoData = await res.json();
        setData(json);
        setRobots(json.robots);

        // Обновляем выбранную страницу если нужно
        if (selectedPage) {
          const updatedPage = json.pages.find(
            (p) => p.page_key === selectedPage.page_key,
          );
          if (updatedPage) {
            setSelectedPage(updatedPage);
            setForm({
              title: updatedPage.title,
              description: updatedPage.description,
              keywords: updatedPage.keywords,
              schema_json: updatedPage.schema_json,
            });
          }
        }
      }
    } catch (err) {
      console.error("Reload failed:", err);
    }
  }, [headers, selectedPage]);

  // Select page handler
  const selectPage = useCallback((page: PageSeo) => {
    setSelectedPage(page);
    setForm({
      title: page.title,
      description: page.description,
      keywords: page.keywords,
      schema_json: page.schema_json,
    });
    setSaved(false);
    setError(null);
  }, []);

  // Save page handler
  const savePage = useCallback(async () => {
    if (!selectedPage) return;

    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/page`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          page_key: selectedPage.page_key,
          ...form,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      setSaved(true);
      await reload();

      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }, [selectedPage, form, headers, reload]);

  // Save robots handler
  const saveRobots = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/robots`, {
        method: "POST",
        headers,
        body: JSON.stringify({ content: robots }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }, [robots, headers]);

  // Logout handler
  const logout = useCallback(() => {
    setAuthed(false);
    setPassword("");
    setData(null);
    setSelectedPage(null);
    sessionStorage.removeItem("seo_admin_auth");
  }, []);

  // Check for saved auth on mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("seo_admin_auth");
    if (savedAuth === "true" && password) {
      login();
    }
  }, [login, password]);

  // Auto-save shortcut (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (tab === "pages" && selectedPage) {
          savePage();
        } else if (tab === "robots") {
          saveRobots();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tab, selectedPage, savePage, saveRobots]);

  const titleLen = form.title.length;
  const descLen = form.description.length;

  // Login form
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="w-full max-w-sm mx-4 rounded-2xl p-8 bg-[#1e293b] border border-white/10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal">
              <Icon name="ShieldCheck" size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-base">SEO-панель</div>
              <div className="text-xs text-white/40">Аренда Чистоты</div>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-[#0f172a] text-white"
              style={{
                border: authError
                  ? "1px solid #ef4444"
                  : "1px solid rgba(255,255,255,0.1)",
              }}
              autoFocus
            />

            {authError && (
              <p className="text-xs text-red-500">
                {error || "Неверный пароль"}
              </p>
            )}

            <button
              onClick={login}
              disabled={!password || loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 bg-teal text-white hover:bg-teal-dark"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Loader" size={16} className="animate-spin" />
                  Вход...
                </span>
              ) : (
                "Войти"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between bg-[#1e293b] border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal">
            <Icon name="Search" size={16} className="text-white" />
          </div>
          <span className="font-bold text-base">SEO-дашборд</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-teal/20 text-teal">
            arenda-chistoty.online
          </span>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-teal animate-fade-in">
              <Icon name="CheckCircle" size={15} />
              Сохранено
            </span>
          )}
          <button
            onClick={logout}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all hover:bg-white/5 text-white/40"
          >
            <Icon name="LogOut" size={13} />
            Выйти
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit bg-[#1e293b]">
          {(
            [
              { key: "pages", label: "Страницы", icon: "FileText" },
              { key: "robots", label: "Robots.txt", icon: "Bot" },
              { key: "sitemap", label: "Sitemap", icon: "Map" },
            ] as { key: Tab; label: string; icon: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: tab === t.key ? "var(--teal)" : "transparent",
                color: tab === t.key ? "white" : "rgba(255,255,255,0.5)",
              }}
            >
              <Icon name={t.icon} size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <Icon name="AlertCircle" size={16} />
            {error}
          </div>
        )}

        {/* Pages Tab */}
        {tab === "pages" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <PageList
              pages={data?.pages || []}
              selectedPage={selectedPage}
              onSelectPage={selectPage}
            />

            {/* Editor */}
            <div className="lg:col-span-2">
              {!selectedPage ? (
                <div className="rounded-2xl flex flex-col items-center justify-center gap-3 py-20 bg-[#1e293b] border border-white/10">
                  <Icon
                    name="MousePointerClick"
                    size={32}
                    className="text-white/20"
                  />
                  <p className="text-white/30 text-sm">
                    Выберите страницу слева
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl p-6 space-y-5 bg-[#1e293b] border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-base">
                        {selectedPage.page_label}
                      </h2>
                      <p className="text-xs mt-0.5 text-white/35">
                        {selectedPage.page_key}
                      </p>
                    </div>
                    <a
                      href={`https://arenda-chistoty.online${selectedPage.page_key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors"
                    >
                      <Icon name="ExternalLink" size={12} />
                      Открыть
                    </a>
                  </div>

                  {/* Title */}
                  <div>
                    <LengthIndicator length={titleLen} max={60} label="Title" />
                    <input
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-[#0f172a] text-white border border-white/10 focus:border-teal transition-colors"
                      placeholder="Заголовок страницы для поисковиков"
                    />
                    <SearchPreview
                      title={form.title}
                      description={form.description}
                      url={`arenda-chistoty.online${selectedPage.page_key}`}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <LengthIndicator
                      length={descLen}
                      max={160}
                      label="Description"
                    />
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none bg-[#0f172a] text-white border border-white/10 focus:border-teal transition-colors"
                      placeholder="Описание страницы для поисковиков (до 160 символов)"
                    />
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-white/60">
                      Keywords
                    </label>
                    <textarea
                      value={form.keywords}
                      onChange={(e) =>
                        setForm({ ...form, keywords: e.target.value })
                      }
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none bg-[#0f172a] text-white border border-white/10 focus:border-teal transition-colors"
                      placeholder="ключевое слово 1, ключевое слово 2, ..."
                    />
                  </div>

                  {/* Schema.org */}
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-white/60">
                      Schema.org JSON-LD
                    </label>
                    <textarea
                      value={form.schema_json}
                      onChange={(e) =>
                        setForm({ ...form, schema_json: e.target.value })
                      }
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none font-mono bg-[#0f172a] text-[#6ee7db] border border-white/10 focus:border-teal transition-colors"
                      placeholder={
                        '{\n  "@context": "https://schema.org",\n  "@type": "CleaningService"\n}'
                      }
                    />
                    {form.schema_json && (
                      <p className="text-xs mt-1 text-white/30">
                        <Icon name="Info" size={12} className="inline mr-1" />
                        JSON-LD разметка помогает поисковикам лучше понимать
                        контент
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={savePage}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 bg-teal text-white hover:bg-teal-dark"
                    >
                      <Icon
                        name={saving ? "Loader" : "Save"}
                        size={15}
                        className={saving ? "animate-spin" : ""}
                      />
                      {saving ? "Сохраняем..." : "Сохранить"}
                    </button>
                    <span className="text-xs text-white/30">
                      Ctrl+S для сохранения
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Robots Tab */}
        {tab === "robots" && (
          <div className="max-w-2xl">
            <div className="rounded-2xl p-6 bg-[#1e293b] border border-white/10">
              <div className="flex items-center gap-3 mb-5">
                <Icon name="Bot" size={18} className="text-teal" />
                <h2 className="font-bold">robots.txt</h2>
              </div>
              <p className="text-xs mb-4 text-white/40">
                Управляет тем, какие страницы поисковики могут индексировать.
                <code className="px-1 py-0.5 rounded text-xs bg-white/10 mx-1">
                  Disallow:
                </code>
                — закрыть страницу от индексации.
              </p>
              <textarea
                value={robots}
                onChange={(e) => setRobots(e.target.value)}
                rows={18}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none font-mono bg-[#0f172a] text-[#6ee7db] border border-white/10 focus:border-teal transition-colors"
                style={{ fontSize: "12px", lineHeight: "1.7" }}
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={saveRobots}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 bg-teal text-white hover:bg-teal-dark"
                  >
                    <Icon
                      name={saving ? "Loader" : "Save"}
                      size={15}
                      className={saving ? "animate-spin" : ""}
                    />
                    {saving ? "Сохраняем..." : "Сохранить"}
                  </button>
                  <span className="text-xs text-white/30">
                    Ctrl+S для сохранения
                  </span>
                </div>
                <a
                  href="https://arenda-chistoty.online/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-teal hover:underline"
                >
                  Проверить robots.txt
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Sitemap Tab */}
        {tab === "sitemap" && (
          <div className="max-w-2xl">
            <div className="rounded-2xl p-6 bg-[#1e293b] border border-white/10">
              <div className="flex items-center gap-3 mb-5">
                <Icon name="Map" size={18} className="text-teal" />
                <h2 className="font-bold">Sitemap.xml</h2>
              </div>
              <p className="text-sm mb-5 text-white/50">
                Sitemap генерируется автоматически на основе всех страниц сайта
                и обновляется при каждом деплое.
              </p>

              <div className="space-y-3">
                <a
                  href="https://arenda-chistoty.online/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:opacity-80 bg-teal/10 border border-teal/30"
                >
                  <div className="flex items-center gap-3">
                    <Icon name="FileCode" size={16} className="text-teal" />
                    <span className="text-sm font-medium">sitemap.xml</span>
                  </div>
                  <Icon name="ExternalLink" size={14} className="text-teal" />
                </a>

                <a
                  href="https://webmaster.yandex.ru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:opacity-80 bg-red-500/10 border border-red-500/30"
                >
                  <div className="flex items-center gap-3">
                    <Icon name="Globe" size={16} className="text-red-500" />
                    <span className="text-sm font-medium">
                      Яндекс.Вебмастер
                    </span>
                  </div>
                  <Icon
                    name="ExternalLink"
                    size={14}
                    className="text-red-500"
                  />
                </a>
              </div>

              <div className="mt-6 rounded-xl p-4 bg-white/5 border border-white/10">
                <p className="text-xs font-semibold mb-3 text-white/40">
                  Статистика sitemap
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Страниц всего", value: data?.pages.length || 0 },
                    {
                      label: "Услуги",
                      value:
                        data?.pages.filter((p) =>
                          p.page_key.startsWith("/uslugi/"),
                        ).length || 0,
                    },
                    { label: "Индексировано", value: "-" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="text-center p-3 rounded-lg bg-[#0f172a]"
                    >
                      <div className="font-bold text-xl text-teal">
                        {s.value}
                      </div>
                      <div className="text-xs mt-0.5 text-white/30">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(12,184,160,0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--teal);
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
