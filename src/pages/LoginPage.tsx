import { useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';

import { env } from '@/app/config/env';
import { DemoExperienceTabs } from '@/features/auth/components/DemoExperienceTabs';
import { DemoQuickAccess } from '@/features/auth/components/DemoQuickAccess';
import { DemoRoleCard } from '@/features/auth/components/DemoRoleCard';
import { DemoRoleDetails } from '@/features/auth/components/DemoRoleDetails';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { LoginHeroPanel } from '@/features/auth/components/LoginHeroPanel';
import { useDemoSession, useLoginMutation } from '@/features/auth/hooks';
import { getHomePath } from '@/features/auth/permissions';
import {
  getCredentialsForRole,
  getRolePresentation,
  getRolesByCategory,
  type DemoRoleCategory,
} from '@/features/auth/role-presentation';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas';
import type { DemoRole } from '@/shared/types/demo';

export function LoginPage() {
  const session = useDemoSession();
  const navigate = useNavigate();
  const login = useLoginMutation();
  const submittingRef = useRef(false);
  const [category, setCategory] = useState<DemoRoleCategory>('DISTRIBUTOR');
  const [selectedRole, setSelectedRole] =
    useState<DemoRole>('DISTRIBUTOR_ADMIN');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: getCredentialsForRole('DISTRIBUTOR_ADMIN')?.email ?? '',
      password: '',
    },
  });

  const rolesInCategory = useMemo(
    () => getRolesByCategory(category),
    [category],
  );
  const selectedPresentation =
    getRolePresentation(selectedRole) ?? rolesInCategory[0]!;

  if (session && env.isMockDataSource) {
    return <Navigate to={getHomePath(session.role)} replace />;
  }

  if (!env.isMockDataSource) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <section className="max-w-lg rounded-xl bg-white p-8 shadow">
          <h1 className="text-xl font-semibold">Autenticación no disponible</h1>
          <p className="mt-3 text-slate-600">
            La autenticación demo está deshabilitada y la autenticación por API
            todavía no está lista.
          </p>
        </section>
      </div>
    );
  }

  const authenticate = (values: LoginFormValues) => {
    if (login.isPending || submittingRef.current) return;
    submittingRef.current = true;
    login.mutate(values, {
      onSuccess: (result) => navigate(getHomePath(result.role)),
      onSettled: () => {
        submittingRef.current = false;
      },
    });
  };

  const fillCredentials = (role: DemoRole) => {
    const credentials = getCredentialsForRole(role);
    if (!credentials) return;
    setValue('email', credentials.email, { shouldValidate: true });
    setValue('password', credentials.password, { shouldValidate: true });
  };

  const enterAsRole = (role: DemoRole) => {
    const credentials = getCredentialsForRole(role);
    if (!credentials || login.isPending || submittingRef.current) return;
    authenticate({
      email: credentials.email,
      password: credentials.password,
    });
  };

  const handleCategoryChange = (next: DemoRoleCategory) => {
    setCategory(next);
    const first = getRolesByCategory(next)[0];
    if (first) {
      setSelectedRole(first.role);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2 lg:gap-8">
        <LoginHeroPanel />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-2xl font-semibold text-slate-900">
            Ingresar a Distrisoft
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Elegí una experiencia demo, revisá el rol y entrá con acceso rápido
            o credenciales manuales.
          </p>
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Los roles solo adaptan esta experiencia demo. La autorización
            definitiva será aplicada por Distrisoft API.
          </p>

          <div className="mt-5 space-y-4">
            <DemoExperienceTabs
              activeCategory={category}
              onChange={handleCategoryChange}
            />

            <div
              role="tabpanel"
              id={`experience-panel-${category}`}
              aria-labelledby={`experience-tab-${category}`}
              className="grid gap-3"
            >
              {rolesInCategory.map((presentation) => (
                <DemoRoleCard
                  key={presentation.role}
                  presentation={presentation}
                  selected={presentation.role === selectedRole}
                  onSelect={() => setSelectedRole(presentation.role)}
                />
              ))}
            </div>

            <DemoRoleDetails presentation={selectedPresentation} />

            <DemoQuickAccess
              selectedLabel={selectedPresentation.label}
              isPending={login.isPending}
              onEnterSelected={() => enterAsRole(selectedRole)}
              onExploreAdmin={() => {
                setCategory('DISTRIBUTOR');
                setSelectedRole('DISTRIBUTOR_ADMIN');
                enterAsRole('DISTRIBUTOR_ADMIN');
              }}
              onShopAsCommerce={() => {
                setCategory('COMMERCE');
                setSelectedRole('COMMERCE_OWNER');
                enterAsRole('COMMERCE_OWNER');
              }}
            />

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Acceso manual
              </h3>
              <div className="mt-3">
                <LoginForm
                  register={register}
                  errors={errors}
                  isPending={login.isPending}
                  serverError={login.error?.message}
                  onFillCredentials={() => fillCredentials(selectedRole)}
                  onSubmit={() => {
                    void handleSubmit((values) => {
                      authenticate(values);
                    })();
                  }}
                />{' '}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
