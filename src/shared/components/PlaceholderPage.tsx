import { EmptyState } from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/PageHeader';

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section>
      <PageHeader title={title} />
      <EmptyState title="Funcionalidad pendiente" message={description} />
    </section>
  );
}
