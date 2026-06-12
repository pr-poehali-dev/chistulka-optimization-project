export interface WorkCase {
  id: number;
  category: "sofa" | "armchair" | "mattress" | "carpet" | "auto";
  categoryLabel: string;
  title: string;
  description: string;
  stain: string;
  beforeImg: string;
  afterImg: string;
  result: string;
}

export const WORKS: WorkCase[] = [
  {
    id: 1,
    category: "sofa",
    categoryLabel: "Диван",
    title: "Угловой диван-кровать велюр",
    description: "Светло-бежевый угловой диван с механизмом трансформации. Половина дивана уже почищена — видна разница.",
    stain: "Общее загрязнение, потемнение ткани",
    beforeImg: "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/19a85ebd-07f4-41ee-b669-283901cc5d56.jpg",
    afterImg: "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/19a85ebd-07f4-41ee-b669-283901cc5d56.jpg",
    result: "Ткань восстановлена, цвет выровнен, пятна удалены",
  },
  {
    id: 2,
    category: "sofa",
    categoryLabel: "Диван",
    title: "Розовый диван на деревянном каркасе",
    description: "Классический двухместный диван на деревянном каркасе в розовом цвете. Коллаж до и после.",
    stain: "Сильное загрязнение по всей поверхности, потемнение",
    beforeImg: "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/0d399941-6be9-402b-a9b0-6fdc6aa76976.jpg",
    afterImg: "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/0d399941-6be9-402b-a9b0-6fdc6aa76976.jpg",
    result: "Цвет восстановлен, ткань стала мягкой и чистой",
  },
  {
    id: 3,
    category: "sofa",
    categoryLabel: "Диван",
    title: "Угловой диван малиновый",
    description: "Угловой диван-кровать из рогожки в малиновом цвете. Коллаж до и после.",
    stain: "Пятна от еды и напитков, общее загрязнение",
    beforeImg: "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/0795fb22-d0f2-4e07-b371-104be7b65f25.jpg",
    afterImg: "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/0795fb22-d0f2-4e07-b371-104be7b65f25.jpg",
    result: "Цвет обновлён, ткань свежая и чистая",
  },
  {
    id: 4,
    category: "mattress",
    categoryLabel: "Матрас",
    title: "Двуспальный матрас",
    description: "Белый стёганый матрас. Коллаж до и после — видны жёлтые органические пятна до чистки.",
    stain: "Жёлтые пятна, органические загрязнения",
    beforeImg: "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/c8083665-fe6c-4b01-a3fd-e72b11ac9161.jpg",
    afterImg: "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/c8083665-fe6c-4b01-a3fd-e72b11ac9161.jpg",
    result: "Матрас обеззаражен, пятна выведены, запах устранён",
  },
  {
    id: 5,
    category: "sofa",
    categoryLabel: "Диван",
    title: "Диван на деревянных подлокотниках",
    description: "Двухместный диван на деревянных подлокотниках в бежевом цвете. Коллаж до и после.",
    stain: "Общее загрязнение, жирные пятна",
    beforeImg: "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/de8a7092-f0d1-4176-91fc-8f045dbc7bb0.jpg",
    afterImg: "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/de8a7092-f0d1-4176-91fc-8f045dbc7bb0.jpg",
    result: "Ткань очищена, цвет восстановлен",
  },
  {
    id: 6,
    category: "mattress",
    categoryLabel: "Матрас",
    title: "Детский матрас — до и после",
    description: "Односпальный матрас с цветочным принтом. Сильные органические пятна слева — результат после чистки.",
    stain: "Органические пятна, пожелтение",
    beforeImg: "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/4bc0afcd-6c3b-4c6e-89d0-51569d1ef36e.jpg",
    afterImg: "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/041e747b-9a0e-4bea-9335-238eabfa4473.jpg",
    result: "Пятна выведены, матрас обеззаражен, запах устранён",
  },
  {
    id: 7,
    category: "sofa",
    categoryLabel: "Диван",
    title: "Угловой диван из рогожки — до и после",
    description: "Угловой диван коричневого цвета из рогожки. Множество пятен от напитков до чистки — результат после.",
    stain: "Пятна от напитков, общее загрязнение",
    beforeImg: "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/38109181-291f-43d2-acbc-d8059547943b.jpg",
    afterImg: "https://cdn.poehali.dev/projects/4c38c16c-b9b4-483b-8a85-5827a4cc2141/bucket/51340069-99b0-4850-915a-6563a587e2b6.jpg",
    result: "Все пятна выведены, ткань освежена, цвет восстановлен",
  },
];

export const WORK_CATEGORIES = [
  { key: "all", label: "Все" },
  { key: "sofa", label: "Диваны" },
  { key: "armchair", label: "Кресла" },
  { key: "mattress", label: "Матрасы" },
  { key: "carpet", label: "Ковры" },
  { key: "auto", label: "Авто" },
] as const;