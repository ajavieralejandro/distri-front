import { useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';

import { env } from '@/app/config/env';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { LoginHeroPanel } from '@/features/auth/components/LoginHeroPanel';
import { useDemoSession, useLoginMutation } from '@/features/auth/hooks';
import { LOGIN_PROFILE_CARDS } from '@/features/auth/login-profiles';
import { getHomePath } from '@/features/auth/permissions';
import { getCredentialsForRole } from '@/features/auth/role-presentation';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas';
import type { DemoRole } from '@/shared/types/demo';

export function LoginPage() {
  const session = useDemoSession();
  const navigate = useNavigate();
  const login = useLoginMutation();
  const submittingRef = useRef(false);
  const [selectedRole, setSelectedRole] =
    useState<DemoRole>('DISTRIBUTOR_ADMIN');
  const [showManual, setShowManual] = useState(false);

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

  const enterAsRole = (role: DemoRole) => {
    const credentials = getCredentialsForRole(role);
    if (!credentials || login.isPending || submittingRef.current) return;
    setSelectedRole(role);
    authenticate({
      email: credentials.email,
      password: credentials.password,
    });
  };

  const fillCredentials = (role: DemoRole) => {
    const credentials = getCredentialsForRole(role);
    if (!credentials) return;
    setValue('email', credentials.email, { shouldValidate: true });
    setValue('password', credentials.password, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2 lg:gap-8">
        <LoginHeroPanel />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-2xl font-semibold text-slate-900">
            Ingresar a Distrisoft
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Elegí cómo querés recorrer la demo: como administrador de la
            distribuidora o como comercio cliente.
          </p>

          <div
            className="mt-6 grid gap-4"
            role="listbox"
            aria-label="Perfiles demo"
          >
            {LOGIN_PROFILE_CARDS.map((profile) => {
              const selected = profile.role === selectedRole;
              return (
                <article
                  key={profile.role}
                  role="option"
                  aria-selected={selected}
                  className={[
                    'rounded-xl border p-4 transition',
                    selected
                      ? 'border-teal-700 bg-teal-50/60 ring-2 ring-teal-700/20'
                      : 'border-slate-200 bg-white hover:border-teal-600/40',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => {
                      setSelectedRole(profile.role);
                      fillCredentials(profile.role);
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
                      {profile.subtitle}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">
                      {profile.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {profile.description}
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {profile.highlights.map((item) => (
                        <li
                          key={item}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </button>
                  <button
                    type="button"
                    disabled={login.isPending}
                    onClick={() => enterAsRole(profile.role)}
                    className="mt-4 min-h-11 w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                  >
                    {login.isPending && selectedRole === profile.role
                      ? 'Ingresando…'
                      : profile.cta}
                  </button>
                </article>
              );
            })}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-4">
            <button
              type="button"
              className="text-sm font-medium text-teal-800 underline"
              onClick={() => setShowManual((value) => !value)}
              aria-expanded={showManual}
            >
              {showManual
                ? 'Ocultar acceso manual'
                : 'Usar correo y contraseña'}
            </button>
            {showManual ? (
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
                />
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
