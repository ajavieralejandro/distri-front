import type { DemoRoleCategory } from '@/features/auth/role-presentation';
import { DEMO_ROLE_CATEGORIES } from '@/features/auth/role-presentation';

type DemoExperienceTabsProps = {
  activeCategory: DemoRoleCategory;
  onChange: (category: DemoRoleCategory) => void;
};

export function DemoExperienceTabs({
  activeCategory,
  onChange,
}: DemoExperienceTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Tipo de experiencia demo"
      className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1"
    >
      {DEMO_ROLE_CATEGORIES.map((category) => {
        const selected = category.id === activeCategory;
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            id={`experience-tab-${category.id}`}
            aria-selected={selected}
            aria-controls={`experience-panel-${category.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(category.id)}
            onKeyDown={(event) => {
              const index = DEMO_ROLE_CATEGORIES.findIndex(
                (item) => item.id === category.id,
              );
              if (event.key === 'ArrowRight') {
                event.preventDefault();
                const next =
                  DEMO_ROLE_CATEGORIES[
                    (index + 1) % DEMO_ROLE_CATEGORIES.length
                  ]!;
                onChange(next.id);
              }
              if (event.key === 'ArrowLeft') {
                event.preventDefault();
                const previous =
                  DEMO_ROLE_CATEGORIES[
                    (index - 1 + DEMO_ROLE_CATEGORIES.length) %
                      DEMO_ROLE_CATEGORIES.length
                  ]!;
                onChange(previous.id);
              }
            }}
            className={[
              'min-h-11 shrink-0 flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 motion-reduce:transition-none',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700',
              selected
                ? 'bg-white text-teal-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900',
            ].join(' ')}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
