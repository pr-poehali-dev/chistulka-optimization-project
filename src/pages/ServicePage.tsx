import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, lazy, Suspense } from "react";
import Icon from "@/components/ui/icon";
import Seo from "@/components/Seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getServiceBySlug, SERVICES_DATA } from "@/data/services";

// Lazy loading для не критических компонентов
const ServiceCard = lazy(() => import("@/components/ServiceCard"));

// Компонент скелетона для загрузки
const ServiceCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="aspect-[4/3] bg-gray-200" />
    <div className="p-4 space-y-2">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

// Компонент преимущества
const BenefitCard = ({
  benefit,
}: {
  benefit: { title: string; text: string; icon: string };
}) => (
  <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex gap-3 sm:gap-4 items-start group">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-teal/10 group-hover:bg-teal/20 transition-colors">
      <Icon name={benefit.icon} size={20} className="text-teal" />
    </div>
    <div>
      <p className="font-semibold mb-1 text-dark">{benefit.title}</p>
      <p className="text-sm leading-snug text-gray">{benefit.text}</p>
    </div>
  </div>
);

// Компонент FAQ
const FAQItem = ({
  item,
  isLast,
}: {
  item: { q: string; a: string };
  isLast: boolean;
}) => (
  <div
    className={`bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow ${!isLast ? "mb-3" : ""}`}
  >
    <p className="font-semibold mb-2 text-dark flex items-start gap-2">
      <span className="text-teal text-lg">❓</span>
      {item.q}
    </p>
    <p className="text-sm leading-relaxed text-gray pl-6">{item.a}</p>
  </div>
);

// Компонент цен
const PriceList = ({
  prices,
}: {
  prices: { label: string; price: string }[];
}) => (
  <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
    <div className="divide-y divide-gray-100">
      {prices.map((item, i) => (
        <div
          key={item.label}
          className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium text-dark">{item.label}</span>
          <span className="font-oswald font-bold text-lg text-teal">
            {item.price}
          </span>
        </div>
      ))}
    </div>
    <div className="px-6 py-4 text-xs bg-teal/5 text-gray">
      <Icon name="Info" size={14} className="inline mr-1 align-text-bottom" />
      Точную стоимость назовёт мастер при осмотре. Выезд и оценка — бесплатно.
    </div>
  </div>
);

export default function ServicePage() {
  const { slug } = useParams();
  const service = useMemo(() => getServiceBySlug(slug), [slug]);

  // Скролл наверх при смене услуги
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  // Обработчик для телефона с аналитикой
  const handlePhoneClick = useCallback(() => {
    if (typeof window !== "undefined" && window.ym) {
      window.ym(109765159, "reachGoal", "phone_click");
    }
  }, []);

  // Другие услуги (исключая текущую)
  const otherServices = useMemo(
    () => SERVICES_DATA.filter((s) => s.slug !== service?.slug).slice(0, 3),
    [service?.slug],
  );

  // SEO структурированные данные
  const jsonLd = useMemo(() => {
    if (!service) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.title,
      description: service.seoDescription,
      image: service.img,
      provider: {
        "@type": "LocalBusiness",
        name: "Аренда Чистоты",
        telephone: "+79189682882",
        image:
          "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/b6cb14ab-4c2a-4c89-a582-9b46d4e0a360.jpg",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Краснодар",
          addressRegion: "Краснодарский край",
          addressCountry: "RU",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.98",
          reviewCount: "1240",
          bestRating: "5",
        },
      },
      areaServed: { "@type": "City", name: "Краснодар" },
      offers: service.prices.map((p) => ({
        "@type": "Offer",
        name: p.label,
        price: p.price.replace(/[^\d]/g, ""),
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
      })),
    };
  }, [service]);

  // 404 страница
  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-light-bg">
        <div className="text-center">
          <Icon
            name="FileQuestion"
            size={64}
            className="text-teal mb-4 opacity-50"
          />
          <h1 className="font-oswald font-bold text-3xl mb-2 text-dark">
            Услуга не найдена
          </h1>
          <p className="text-gray mb-6">
            Запрашиваемая страница не существует или была перемещена
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full bg-teal text-white hover:bg-teal-dark transition-colors"
          >
            <Icon name="ArrowLeft" size={16} />
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg">
      <Seo
        title={service.seoTitle}
        description={service.seoDescription}
        keywords={service.keywords}
        path={`/uslugi/${service.slug}`}
        image={service.img}
        jsonLd={jsonLd}
        breadcrumbs={[
          { label: "Услуги", href: "/#services" },
          { label: service.title },
        ]}
      />

      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center hover:opacity-80 transition-opacity"
            aria-label="На главную"
          >
            <img
              src="https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/b6cb14ab-4c2a-4c89-a582-9b46d4e0a360.jpg"
              alt="Аренда Чистоты"
              className="h-10 w-auto object-contain"
              loading="eager"
            />
          </Link>
          <Link
            to="/#services"
            className="flex items-center gap-2 text-sm font-semibold text-teal hover:text-teal-dark transition-colors group"
          >
            <Icon
              name="ArrowLeft"
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Все услуги
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-12">
        {/* Хлебные крошки */}
        <Breadcrumbs
          items={[
            { label: "Услуги", href: "/#services" },
            { label: service.title },
          ]}
          className="mb-6"
        />

        {/* Hero секция */}
        <section className="grid md:grid-cols-2 gap-8 mb-12 items-start">
          <div className="space-y-4">
            <span className="section-tag inline-block">Услуга</span>
            <h1 className="font-oswald font-bold text-4xl md:text-5xl lg:text-6xl text-dark leading-tight">
              {service.h1}
            </h1>
            <p className="text-base leading-relaxed text-gray">
              {service.lead}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="tel:+79189682882"
                onClick={handlePhoneClick}
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3 font-semibold"
              >
                <Icon name="Phone" size={18} />
                Позвонить
              </a>
              <a
                href="/#contacts"
                className="flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-full border-2 border-teal text-teal hover:bg-teal hover:text-white transition-all"
              >
                Оставить заявку
              </a>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-lg bg-white">
            <div className="aspect-[4/3] relative">
              <img
                src={service.img}
                alt={service.title}
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </section>

        {/* Преимущества */}
        <section className="mb-12">
          <h2 className="font-oswald font-bold text-2xl md:text-3xl mb-6 text-dark flex items-center gap-2">
            <span>Почему выбирают нас</span>
            <span className="text-teal text-2xl">⭐</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {service.benefits.map((benefit, idx) => (
              <BenefitCard key={benefit.title} benefit={benefit} />
            ))}
          </div>
        </section>

        {/* Цены */}
        <section className="mb-12">
          <h2 className="font-oswald font-bold text-2xl md:text-3xl mb-6 text-dark">
            Стоимость {service.title.toLowerCase()}
          </h2>
          <PriceList prices={service.prices} />
        </section>

        {/* FAQ */}
        {service.faq && service.faq.length > 0 && (
          <section className="mb-12">
            <h2 className="font-oswald font-bold text-2xl md:text-3xl mb-6 text-dark">
              Частые вопросы
            </h2>
            <div>
              {service.faq.map((item, idx) => (
                <FAQItem
                  key={item.q}
                  item={item}
                  isLast={idx === service.faq.length - 1}
                />
              ))}
            </div>
          </section>
        )}

        {/* CTA секция */}
        <section className="rounded-3xl p-8 md:p-12 mb-12 text-center bg-gradient-to-br from-teal to-teal-dark shadow-lg">
          <h2 className="font-oswald font-bold text-white text-2xl md:text-3xl lg:text-4xl mb-3">
            Записаться на {service.title.toLowerCase()}
          </h2>
          <p className="text-white/90 text-sm md:text-base mb-6 max-w-md mx-auto">
            Бесплатный выезд мастера и оценка объёма работ
          </p>
          <a
            href="tel:+79189682882"
            onClick={handlePhoneClick}
            className="inline-flex items-center gap-2 bg-white font-bold px-8 py-4 rounded-full text-base transition-all hover:scale-105 shadow-lg"
            style={{ color: "var(--teal)" }}
          >
            <Icon name="Phone" size={18} />8 918 968-28-82
          </a>
          <p className="text-white/70 text-xs mt-4">
            Работаем ежедневно с 9:00 до 22:00
          </p>
        </section>

        {/* Другие услуги */}
        {otherServices.length > 0 && (
          <section>
            <h2 className="font-oswald font-bold text-2xl md:text-3xl mb-6 text-dark">
              Другие услуги химчистки
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Suspense
                fallback={
                  <>
                    <ServiceCardSkeleton />
                    <ServiceCardSkeleton />
                    <ServiceCardSkeleton />
                  </>
                }
              >
                {otherServices.map((s) => (
                  <ServiceCard key={s.slug} service={s} />
                ))}
              </Suspense>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span>© 2026 Аренда Чистоты</span>
            <span className="hidden sm:inline">•</span>
            <span>Краснодар</span>
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-teal transition-colors">
              Конфиденциальность
            </Link>
            <Link
              to="/cookie-policy"
              className="hover:text-teal transition-colors"
            >
              Cookie
            </Link>
            <a
              href="tel:+79189682882"
              onClick={handlePhoneClick}
              className="text-teal font-medium hover:text-teal-dark transition-colors"
            >
              8 918 968-28-82
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
