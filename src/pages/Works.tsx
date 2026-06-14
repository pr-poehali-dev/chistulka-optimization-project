import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/Seo";
import { WORKS, WORK_CATEGORIES, WorkCase } from "@/data/works";

const ITEMS_PER_PAGE = 6;

// Lazy loading для модального окна
const WorkModal = lazy(() => import("@/components/WorkModal"));

// Компонент скелетона для загрузки
const WorkCardSkeleton = () => (
  <div className="card-clean overflow-hidden animate-pulse">
    <div className="bg-gray-200" style={{ aspectRatio: "4/3" }} />
    <div className="p-4 space-y-2">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

// Оптимизированный компонент карточки
const WorkCard = memo(
  ({
    work,
    onClick,
    priority = false,
  }: {
    work: WorkCase;
    onClick: () => void;
    priority?: boolean;
  }) => {
    const [hovered, setHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
      <div
        className="card-clean overflow-hidden cursor-pointer group focus:outline-none focus:ring-2 focus:ring-teal"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
        tabIndex={0}
        role="button"
        aria-label={`Открыть кейс: ${work.title}`}
      >
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "4/3" }}
        >
          {/* Ленивая загрузка изображений */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}
          <img
            src={work.beforeImg}
            alt={`До — ${work.title}`}
            loading={priority ? "eager" : "lazy"}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ opacity: hovered ? 0 : 1 }}
            onLoad={() => setImageLoaded(true)}
          />
          <img
            src={work.afterImg}
            alt={`После — ${work.title}`}
            loading={priority ? "eager" : "lazy"}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ opacity: hovered ? 1 : 0 }}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Категория */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal text-white">
              {work.categoryLabel}
            </span>
          </div>

          {/* Индикатор до/после */}
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-300"
            style={{
              background: hovered ? "var(--yellow)" : "rgba(0,0,0,0.55)",
              color: hovered ? "var(--dark)" : "white",
            }}
          >
            <span>{hovered ? "После" : "До"}</span>
            <Icon name="ArrowLeftRight" size={12} aria-hidden="true" />
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-oswald font-bold text-base mb-1 text-dark">
            {work.title}
          </h3>
          <p className="text-xs mb-3 line-clamp-2 text-gray">{work.stain}</p>
          <button
            className="text-xs font-semibold flex items-center gap-1 transition-colors text-teal hover:text-teal-dark group"
            aria-label={`Подробнее о ${work.title}`}
          >
            <span>Подробнее</span>
            <Icon
              name="ChevronRight"
              size={14}
              className="group-hover:translate-x-1 transition-transform"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    );
  },
);

WorkCard.displayName = "WorkCard";

// Компонент пагинации
const Pagination = memo(
  ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    const pages = useMemo(() => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];
      let l;

      for (let i = 1; i <= totalPages; i++) {
        if (
          i === 1 ||
          i === totalPages ||
          (i >= currentPage - delta && i <= currentPage + delta)
        ) {
          range.push(i);
        }
      }

      range.forEach((i) => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push("...");
          }
        }
        rangeWithDots.push(i);
        l = i;
      });

      return rangeWithDots;
    }, [currentPage, totalPages]);

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mb-12">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 hover:bg-gray-100"
          style={{ border: "1px solid #e5e7eb", color: "var(--gray)" }}
          aria-label="Предыдущая страница"
        >
          <Icon name="ChevronLeft" size={16} aria-hidden="true" />
        </button>

        {pages.map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${
              currentPage === page
                ? "bg-teal text-white"
                : "border border-gray-200 text-gray hover:bg-gray-50"
            }`}
            aria-label={`Страница ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 hover:bg-gray-100"
          style={{ border: "1px solid #e5e7eb", color: "var(--gray)" }}
          aria-label="Следующая страница"
        >
          <Icon name="ChevronRight" size={16} aria-hidden="true" />
        </button>
      </div>
    );
  },
);

Pagination.displayName = "Pagination";

// Основной компонент
export default function Works() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWork, setSelectedWork] = useState<WorkCase | null>(null);

  // Фильтрация и пагинация
  const filtered = useMemo(() => {
    return activeCategory === "all"
      ? WORKS
      : WORKS.filter((w) => w.category === activeCategory);
  }, [activeCategory]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginated = useMemo(() => {
    return filtered.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );
  }, [filtered, currentPage]);

  // Обработчики
  const handleCategory = useCallback((cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    // Прокрутка к началу списка
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // SEO структурированные данные для изображений
  const imageSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      name: "Наши работы по химчистке мебели",
      description:
        "Реальные примеры химчистки диванов, матрасов, кресел и ковров в Краснодаре",
      image: WORKS.map((work) => ({
        "@type": "ImageObject",
        contentUrl: work.afterImg,
        name: work.title,
        description: work.description,
      })),
    }),
    [],
  );

  return (
    <>
      <Seo
        title="Наши работы — фото до и после химчистки мебели | Аренда Чистоты"
        description="Реальные примеры химчистки диванов, матрасов, кресел и ковров в Краснодаре. Фото до и после. Выезд на дом — от 1 500 ₽."
        keywords="химчистка мебели фото до после, примеры работ химчистки краснодар, портфолио химчистка диванов, до и после химчистка диван, результаты химчистки краснодар"
        path="/nashi-raboty"
        breadcrumbs={[{ label: "Наши работы" }]}
        additionalSchema={imageSchema}
      />

      <div style={{ background: "var(--light-bg)", minHeight: "100vh" }}>
        <div className="container max-w-5xl mx-auto px-4 py-8">
          {/* Хлебные крошки */}
          <nav
            className="flex items-center gap-2 text-sm mb-6 text-gray"
            aria-label="Breadcrumb"
          >
            <Link
              to="/"
              className="hover:text-teal transition-colors text-teal"
            >
              Главная
            </Link>
            <Icon name="ChevronRight" size={14} aria-hidden="true" />
            <span aria-current="page">Наши работы</span>
          </nav>

          {/* Заголовок */}
          <div className="mb-8">
            <span className="section-tag mb-3">Портфолио</span>
            <h1 className="font-oswald font-bold text-3xl sm:text-4xl mb-3 text-dark">
              Наши работы: реальные примеры химчистки мебели в Краснодаре
            </h1>
            <p className="text-base text-gray">
              Только честные фото «до» и «после» — без фотошопа и постановочных
              снимков. Наведите на карточку, чтобы увидеть результат.
            </p>
          </div>

          {/* Фильтры */}
          <div className="flex flex-wrap gap-2 mb-8">
            {WORK_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat.key
                    ? "bg-teal text-white"
                    : "bg-white text-gray border border-gray-200 hover:border-teal"
                }`}
                aria-pressed={activeCategory === cat.key}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Сетка кейсов */}
          {paginated.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {paginated.map((work, idx) => (
                  <WorkCard
                    key={work.id}
                    work={work}
                    onClick={() => setSelectedWork(work)}
                    priority={idx < 3}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="text-center py-20 text-gray">
              <Icon
                name="ImageOff"
                size={48}
                className="mx-auto mb-4 opacity-30"
                aria-hidden="true"
              />
              <p className="text-lg">Пока нет работ в этой категории</p>
            </div>
          )}

          {/* Видео секция */}
          <div className="mb-12">
            <div className="text-center mb-6">
              <span className="section-tag mb-2">Видео</span>
              <h2 className="font-oswald font-bold text-2xl sm:text-3xl mt-3 text-dark">
                Смотрите процесс чистки
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/a09dded2-1bce-46ac-8780-85fe20b3c779.mp4",
                "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/8c635586-f22a-4b62-a465-7d9b741cd25c.mp4",
              ].map((src, i) => (
                <div key={i} className="card-clean overflow-hidden">
                  <video
                    src={src}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full"
                    style={{
                      aspectRatio: "16/9",
                      objectFit: "cover",
                      display: "block",
                    }}
                    poster={src.replace(".mp4", "-poster.jpg")}
                  >
                    <track
                      kind="captions"
                      srcLang="ru"
                      label="Русские субтитры"
                      default
                    />
                  </video>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Блок */}
          <div className="rounded-2xl p-8 text-center mb-12 bg-gradient-to-br from-teal to-teal-dark">
            <h2 className="font-oswald font-bold text-2xl sm:text-3xl text-white mb-2">
              Хотите такой же результат?
            </h2>
            <p className="text-white/80 mb-6 text-sm">
              Выезд мастера бесплатно. Оценка стоимости на месте.
            </p>
            <a
              href="tel:+79189682882"
              className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base bg-yellow hover:bg-yellow-dark text-dark"
            >
              <Icon name="Phone" size={18} aria-hidden="true" />
              Заказать чистку
            </a>
          </div>

          {/* SEO-текст */}
          <div className="prose max-w-none">
            <div className="rounded-2xl p-6 sm:p-8 bg-white border border-teal/10">
              <h2 className="font-oswald font-bold text-xl mb-4 text-dark">
                О нашей технологии химчистки мебели
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-gray">
                <p>
                  <strong className="text-dark">
                    Химчистка диванов в Краснодаре
                  </strong>{" "}
                  — одна из наших ключевых услуг. Мы используем профессиональное
                  оборудование итальянских и немецких производителей: аппараты
                  горячей экстракции удаляют загрязнения из глубины ворса, а не
                  только с поверхности. Результат сохраняется 6–12 месяцев при
                  обычной эксплуатации.
                </p>
                <p>
                  <strong className="text-dark">Химчистка матрасов</strong> —
                  особенно важна для семей с детьми и аллергиков. В матрасе
                  накапливаются пылевые клещи, споры плесени и органические
                  загрязнения. После нашей обработки матрас проходит
                  ультрафиолетовую санацию и дезинфицирующую обработку —
                  безопасную для детей и домашних животных.
                </p>
                <p>
                  <strong className="text-dark">
                    Химчистка кресел и мягкой мебели
                  </strong>{" "}
                  на деревянном каркасе требует особой аккуратности: мы защищаем
                  деревянные элементы и фурнитуру при работе с влажными
                  составами. Кожаную мебель дополнительно обрабатываем
                  кондиционирующим составом, восстанавливающим эластичность
                  кожи.
                </p>
                <p>
                  Все работы выполняем{" "}
                  <strong className="text-dark">
                    с выездом на дом в Краснодаре
                  </strong>
                  . Время высыхания — 2–4 часа. Принимаем заказы ежедневно с
                  8:00 до 21:00.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Плавающая кнопка */}
      <a
        href="tel:+79189682882"
        className="fixed bottom-6 right-6 z-50 btn-primary flex items-center gap-2 px-5 py-3 text-sm font-semibold shadow-xl bg-yellow hover:bg-yellow-dark text-dark"
        style={{ boxShadow: "0 8px 32px rgba(255,226,39,0.45)" }}
        aria-label="Позвонить для заказа выезда"
      >
        <Icon name="Phone" size={16} aria-hidden="true" />
        Заказать выезд
      </a>

      {/* Модальное окно с lazy loading */}
      <Suspense fallback={null}>
        {selectedWork && (
          <WorkModal
            work={selectedWork}
            onClose={() => setSelectedWork(null)}
          />
        )}
      </Suspense>
    </>
  );
}
