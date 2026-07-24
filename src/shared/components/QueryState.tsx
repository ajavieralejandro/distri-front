import type { ReactNode } from 'react';

import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingIndicator } from '@/shared/components/LoadingIndicator';

type QueryStateProps = {
  isPending: boolean;
  isError: boolean;
  isEmpty: boolean;
  children: ReactNode;
  emptyMessage?: string;
  errorMessage?: string;
};

export function QueryState({
  isPending,
  isError,
  isEmpty,
  children,
  emptyMessage = 'Probá modificando los filtros.',
  errorMessage = 'Volvé a intentarlo en unos instantes.',
}: QueryStateProps) {
  if (isPending) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return (
      <ErrorState
        title="No se pudieron cargar los datos"
        message={errorMessage}
      />
    );
  }

  if (isEmpty) {
    return <EmptyState title="No hay resultados" message={emptyMessage} />;
  }

  return <>{children}</>;
}
