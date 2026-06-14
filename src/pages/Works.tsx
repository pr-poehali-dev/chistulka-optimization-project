import { useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { WorkCase } from "@/data/works";

interface WorkModalProps {
  work: WorkCase;
  onClose: () => void;
}

export default function WorkModal({ work, onClose }: WorkModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  // Закрытие по клику вне модального окна
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        style={{ animation: "modalSlideIn 0.2s ease-out" }}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-colors"
          aria-label="Закрыть"
        >
          <Icon name="X" size={18} />
        </button>

        {/* Контент */}
        <div className="p-6 sm:p-8">
          <h2
            id="modal-title"
            className="font-oswald font-bold text-2xl sm:text-3xl mb-2 text-dark pr-8"
          >
            {work.title}
          </h2>
          <p className="text-sm text-gray mb-6">{work.stain}</p>

          {/* Фото до/после */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold mb-2 text-gray">До чистки</p>
              <img
                src={work.beforeImg}
                alt={`До химчистки: ${work.title}`}
                className="w-full rounded-lg object-cover"
                style={{ aspectRatio: "4/3" }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold mb-2 text-gray">
                После чистки
              </p>
              <img
                src={work.afterImg}
                alt={`После химчистки: ${work.title}`}
                className="w-full rounded-lg object-cover"
                style={{ aspectRatio: "4/3" }}
              />
            </div>
          </div>

          {/* Описание */}
          <div className="prose prose-sm max-w-none">
            <p className="text-gray mb-4">{work.description}</p>

            {/* Результаты работы */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-dark mb-2">
                Результаты работы:
              </h3>
              <ul className="space-y-1 text-sm text-gray">
                <li>✓ Полное удаление загрязнений</li>
                <li>✓ Уничтожение бактерий и клещей</li>
                <li>✓ Устранение неприятных запахов</li>
              </ul>
            </div>

            {/* Информация о чистке */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <span className="text-sm font-semibold text-teal">
                Результат:
              </span>
              <span className="text-sm text-gray">
                Идеальная чистота и свежесть
              </span>
            </div>
          </div>

          {/* Кнопка заказа */}
          <div className="mt-6 pt-4 flex justify-end">
            <a
              href="tel:+79189682882"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-yellow hover:bg-yellow-dark text-dark rounded-lg font-semibold transition-colors"
            >
              <Icon name="Phone" size={16} />
              Заказать такую же чистку
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
