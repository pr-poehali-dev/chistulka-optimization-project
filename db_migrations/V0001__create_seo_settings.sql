-- =============================================
-- SEO TABLES OPTIMIZED VERSION
-- =============================================

BEGIN;

-- =============================================
-- 1. ОСНОВНАЯ ТАБЛИЦА SEO НАСТРОЕК (улучшенная)
-- =============================================

-- Удаляем старую таблицу если нужно (осторожно!)
-- DROP TABLE IF EXISTS seo_settings CASCADE;
-- DROP TABLE IF EXISTS seo_robots CASCADE;

CREATE TABLE IF NOT EXISTS seo_settings (
    id SERIAL PRIMARY KEY,
    page_key VARCHAR(100) NOT NULL UNIQUE,
    page_label VARCHAR(200) NOT NULL,
    title TEXT,
    description TEXT,
    keywords TEXT,
    schema_json TEXT,
    -- Дополнительные поля для лучшего SEO
    canonical_url VARCHAR(500),
    meta_robots VARCHAR(100) DEFAULT 'index,follow',
    og_title VARCHAR(200),
    og_description TEXT,
    og_image VARCHAR(500),
    og_type VARCHAR(50) DEFAULT 'website',
    h1_heading VARCHAR(200),
    breadcrumb_json TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 5  -- 1-10, где 10 - наивысший приоритет
);

-- Комментарии к полям
COMMENT ON TABLE seo_settings IS 'SEO настройки для страниц сайта';
COMMENT ON COLUMN seo_settings.page_key IS 'Уникальный ключ страницы (URL path)';
COMMENT ON COLUMN seo_settings.page_label IS 'Название страницы для админки';
COMMENT ON COLUMN seo_settings.title IS 'SEO заголовок (title)';
COMMENT ON COLUMN seo_settings.description IS 'Мета-описание (description)';
COMMENT ON COLUMN seo_settings.keywords IS 'Ключевые слова (keywords)';
COMMENT ON COLUMN seo_settings.schema_json IS 'Структурированные данные (JSON-LD)';
COMMENT ON COLUMN seo_settings.canonical_url IS 'Канонический URL';
COMMENT ON COLUMN seo_settings.meta_robots IS 'Meta robots (index/noindex, follow/nofollow)';
COMMENT ON COLUMN seo_settings.og_title IS 'Open Graph заголовок';
COMMENT ON COLUMN seo_settings.og_description IS 'Open Graph описание';
COMMENT ON COLUMN seo_settings.og_image IS 'Open Graph изображение';
COMMENT ON COLUMN seo_settings.priority IS 'Приоритет страницы (1-10)';

-- =============================================
-- 2. ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- =============================================

CREATE INDEX IF NOT EXISTS idx_seo_settings_page_key ON seo_settings(page_key);
CREATE INDEX IF NOT EXISTS idx_seo_settings_updated_at ON seo_settings(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_settings_is_active ON seo_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_seo_settings_priority ON seo_settings(priority DESC);
CREATE INDEX IF NOT EXISTS idx_seo_settings_page_label ON seo_settings(page_label);

-- Полнотекстовый поиск
CREATE INDEX IF NOT EXISTS idx_seo_settings_search ON seo_settings 
    USING GIN(to_tsvector('russian', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(keywords, '')));

-- =============================================
-- 3. ТАБЛИЦА ROBOTS.TXT (улучшенная)
-- =============================================

CREATE TABLE IF NOT EXISTS seo_robots (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    user_agent VARCHAR(100),
    environment VARCHAR(50) DEFAULT 'production',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100)
);

COMMENT ON TABLE seo_robots IS 'Настройки robots.txt';
COMMENT ON COLUMN seo_robots.user_agent IS 'Для конкретного user-agent (NULL - для всех)';
COMMENT ON COLUMN seo_robots.environment IS 'Окружение (production/staging/development)';

CREATE INDEX IF NOT EXISTS idx_seo_robots_environment ON seo_robots(environment);
CREATE INDEX IF NOT EXISTS idx_seo_robots_updated_at ON seo_robots(updated_at DESC);

-- =============================================
-- 4. ТАБЛИЦА ДЛЯ ХРАНЕНИЯ 301 РЕДИРЕКТОВ
-- =============================================

CREATE TABLE IF NOT EXISTS seo_redirects (
    id SERIAL PRIMARY KEY,
    old_url VARCHAR(500) NOT NULL UNIQUE,
    new_url VARCHAR(500) NOT NULL,
    redirect_type INTEGER DEFAULT 301, -- 301, 302, 307
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seo_redirects_old_url ON seo_redirects(old_url);
CREATE INDEX IF NOT EXISTS idx_seo_redirects_is_active ON seo_redirects(is_active);

-- =============================================
-- 5. ТАБЛИЦА ДЛЯ SITEMAP
-- =============================================

CREATE TABLE IF NOT EXISTS seo_sitemap (
    id SERIAL PRIMARY KEY,
    page_key VARCHAR(100) REFERENCES seo_settings(page_key) ON DELETE CASCADE,
    loc VARCHAR(500) NOT NULL,
    lastmod TIMESTAMP DEFAULT NOW(),
    changefreq VARCHAR(20) DEFAULT 'weekly', -- always, hourly, daily, weekly, monthly, yearly, never
    priority DECIMAL(3,1) DEFAULT 0.5,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_seo_sitemap_page_key ON seo_sitemap(page_key);
CREATE INDEX IF NOT EXISTS idx_seo_sitemap_lastmod ON seo_sitemap(lastmod DESC);

-- =============================================
-- 6. АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры
DROP TRIGGER IF EXISTS update_seo_settings_updated_at ON seo_settings;
CREATE TRIGGER update_seo_settings_updated_at 
    BEFORE UPDATE ON seo_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seo_robots_updated_at ON seo_robots;
CREATE TRIGGER update_seo_robots_updated_at 
    BEFORE UPDATE ON seo_robots 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seo_redirects_updated_at ON seo_redirects;
CREATE TRIGGER update_seo_redirects_updated_at 
    BEFORE UPDATE ON seo_redirects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. ВСТАВКА ДАННЫХ
-- =============================================

-- Очистка существующих данных (опционально)
-- TRUNCATE seo_settings RESTART IDENTITY CASCADE;

-- Вставка SEO настроек
INSERT INTO seo_settings (page_key, page_label, title, description, keywords, priority, h1_heading) VALUES
    ('/', 'Главная', 
     'Химчистка мебели в Краснодаре с выездом | Аренда Чистоты', 
     '★4.98/5 (1240 отзывов) Химчистка диванов, кресел, матрасов и ковров в Краснодаре. Выезд на дом, сушка 2–4 часа, безопасные средства. ☎ 8 918 968-28-82', 
     'химчистка мебели, химчистка мебели краснодар, химчистка диванов краснодар',
     10, 'Химчистка мебели в Краснодаре'),
     
    ('/nashi-raboty', 'Наши работы',
     'Наши работы — фото до и после химчистки | Аренда Чистоты',
     'Реальные примеры химчистки диванов, матрасов, кресел и ковров в Краснодаре. Фото до и после.',
     'химчистка фото, наши работы, до и после',
     8, 'Фото наших работ'),
     
    ('/uslugi/himchistka-divanov', 'Услуга: Диваны',
     'Химчистка диванов в Краснодаре с выездом | Аренда Чистоты',
     'Химчистка диванов в Краснодаре с гарантией. Удаляем пятна, запахи, клещей. Ткань, кожа, велюр. Выезд на дом.',
     'химчистка диванов, химчистка дивана краснодар',
     9, 'Химчистка диванов'),
     
    ('/uslugi/himchistka-kresel', 'Услуга: Кресла',
     'Химчистка кресел в Краснодаре | Аренда Чистоты',
     'Профессиональная химчистка кресел в Краснодаре. Офисные, обеденные, игровые. Выезд на дом.',
     'химчистка кресел краснодар',
     8, 'Химчистка кресел'),
     
    ('/uslugi/himchistka-matrasov', 'Услуга: Матрасы',
     'Химчистка матрасов в Краснодаре | Аренда Чистоты',
     'Химчистка матрасов в Краснодаре. Устраняем клещей, грибок, пятна. Безопасно для детей.',
     'химчистка матрасов краснодар',
     8, 'Химчистка матрасов'),
     
    ('/uslugi/himchistka-kovrov', 'Услуга: Ковры',
     'Химчистка ковров в Краснодаре | Аренда Чистоты',
     'Химчистка ковров в Краснодаре. Шерсть, синтетика, ковры ручной работы. Выезд на дом.',
     'химчистка ковров краснодар',
     7, 'Химчистка ковров'),
     
    ('/uslugi/himchistka-stulev', 'Услуга: Стулья',
     'Химчистка стульев в Краснодаре | Аренда Чистоты',
     'Химчистка стульев в Краснодаре. Обеденные группы, барные стулья, пуфики. Быстро и недорого.',
     'химчистка стульев краснодар',
     7, 'Химчистка стульев'),
     
    ('/uslugi/himchistka-avtosalona', 'Услуга: Автосалон',
     'Химчистка автосалона в Краснодаре | Аренда Чистоты',
     'Химчистка автосалона в Краснодаре. Сиденья, потолок, дверные панели. Профессиональное оборудование.',
     'химчистка автосалона краснодар, химчистка авто',
     8, 'Химчистка автосалона');

-- Вставка robots.txt (исправленная версия)
INSERT INTO seo_robots (content, environment, created_by) VALUES (
'# robots.txt для arenda-chistoty.online
# Обновлено: ' || NOW() || '

User-agent: *
Allow: /
Disallow: /cookie-policy
Disallow: /privacy
Disallow: /hello-world/
Disallow: /sample-page/
Disallow: /voprosy-i-otvety-faq.html
Disallow: /akcii-i-skidki.html

# Динамические страницы
Disallow: /*.html$
Disallow: /?s=

# Основные настройки
Host: https://arenda-chistoty.online
Sitemap: https://arenda-chistoty.online/sitemap.xml

# Для Googlebot
User-agent: Googlebot
Allow: /
Crawl-delay: 0.5

# Для Yandex
User-agent: Yandex
Allow: /
Crawl-delay: 1

# Для Bing
User-agent: Bingbot
Allow: /
Crawl-delay: 0.5
',
'production',
'initial_migration');

-- Вставка данных для sitemap
INSERT INTO seo_sitemap (page_key, loc, changefreq, priority) 
SELECT page_key, 
       CONCAT('https://arenda-chistoty.online', page_key) as loc,
       CASE 
           WHEN page_key = '/' THEN 'daily'
           WHEN page_key LIKE '/uslugi/%' THEN 'weekly'
           ELSE 'weekly'
       END as changefreq,
       CASE 
           WHEN page_key = '/' THEN 1.0
           WHEN page_key LIKE '/uslugi/%' THEN 0.8
           ELSE 0.5
       END as priority
FROM seo_settings;

-- =============================================
-- 8. ПОЛЕЗНЫЕ ФУНКЦИИ
-- =============================================

-- Функция для получения SEO настроек по ключу
CREATE OR REPLACE FUNCTION get_seo_by_key(p_page_key VARCHAR)
RETURNS TABLE(
    title TEXT,
    description TEXT,
    keywords TEXT,
    canonical_url VARCHAR,
    meta_robots VARCHAR,
    schema_json TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(s.title, s.page_label),
        s.description,
        s.keywords,
        s.canonical_url,
        s.meta_robots,
        s.schema_json
    FROM seo_settings s
    WHERE s.page_key = p_page_key AND s.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Функция для поиска по страницам
CREATE OR REPLACE FUNCTION search_seo_pages(search_query TEXT)
RETURNS TABLE(
    page_key VARCHAR,
    page_label VARCHAR,
    title TEXT,
    description TEXT,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.page_key,
        s.page_label,
        s.title,
        s.description,
        ts_rank(to_tsvector('russian', COALESCE(s.title, '') || ' ' || COALESCE(s.description, '') || ' ' || COALESCE(s.keywords, '')), 
                plainto_tsquery('russian', search_query)) as relevance
    FROM seo_settings s
    WHERE to_tsvector('russian', COALESCE(s.title, '') || ' ' || COALESCE(s.description, '') || ' ' || COALESCE(s.keywords, '')) @@ plainto_tsquery('russian', search_query)
    ORDER BY relevance DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения статистики
CREATE OR REPLACE FUNCTION get_seo_statistics()
RETURNS TABLE(
    total_pages BIGINT,
    pages_with_title BIGINT,
    pages_with_description BIGINT,
    pages_with_keywords BIGINT,
    pages_with_schema BIGINT,
    avg_priority NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_pages,
        COUNT(CASE WHEN title IS NOT NULL AND title != '' THEN 1 END) as pages_with_title,
        COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as pages_with_description,
        COUNT(CASE WHEN keywords IS NOT NULL AND keywords != '' THEN 1 END) as pages_with_keywords,
        COUNT(CASE WHEN schema_json IS NOT NULL AND schema_json != '' THEN 1 END) as pages_with_schema,
        AVG(priority) as avg_priority
    FROM seo_settings
    WHERE is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 9. ПРЕДСТАВЛЕНИЯ ДЛЯ УДОБНОГО ДОСТУПА
-- =============================================

-- Активные страницы с сортировкой по приоритету
CREATE OR REPLACE VIEW v_active_pages AS
SELECT 
    page_key,
    page_label,
    title,
    description,
    priority,
    updated_at
FROM seo_settings
WHERE is_active = TRUE
ORDER BY priority DESC, page_label;

-- Страницы, требующие внимания (пустые SEO поля)
CREATE OR REPLACE VIEW v_pages_needing_attention AS
SELECT 
    page_key,
    page_label,
    CASE WHEN title IS NULL OR title = '' THEN '❌' ELSE '✅' END as has_title,
    CASE WHEN description IS NULL OR description = '' THEN '❌' ELSE '✅' END as has_description,
    CASE WHEN keywords IS NULL OR keywords = '' THEN '❌' ELSE '✅' END as has_keywords,
    updated_at
FROM seo_settings
WHERE title IS NULL OR title = '' OR description IS NULL OR description = ''
ORDER BY updated_at;

-- =============================================
-- 10. ПРОВЕРКА И СТАТИСТИКА
-- =============================================

DO $$
DECLARE
    pages_count INTEGER;
    robots_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO pages_count FROM seo_settings;
    SELECT COUNT(*) INTO robots_count FROM seo_robots;
    
    RAISE NOTICE '✅ Migration completed!';
    RAISE NOTICE '   📊 Pages in seo_settings: %', pages_count;
    RAISE NOTICE '   📄 Records in seo_robots: %', robots_count;
    RAISE NOTICE '   🔍 Search index created';
    RAISE NOTICE '   ⚡ Performance indexes added';
END $$;

COMMIT;

-- =============================================
-- 11. ТЕСТОВЫЕ ЗАПРОСЫ
-- =============================================

-- Статистика по SEO настройкам
SELECT * FROM get_seo_statistics();

-- Поиск страниц
SELECT * FROM search_seo_pages('химчистка диванов');

-- Страницы требующие внимания
SELECT * FROM v_pages_needing_attention;

-- Активные страницы
SELECT * FROM v_active_pages LIMIT 5;