import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { env } from '@/app/config/env';
import { useDemoSession, useLoginMutation } from '@/features/auth/hooks';
import {
  DEMO_ACCOUNT_GROUPS,
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/schemas';
import { getHomePath } from '@/features/auth/permissions';

export function LoginPage() {
  const session = useDemoSession();
  const navigate = useNavigate();
  const login = useLoginMutation();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  if (session && env.isMockDataSource)
    return <Navigate to={getHomePath(session.role)} replace />;
  if (!env.isMockDataSource)
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
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
          Distrisoft
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Inicio de sesión
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Elegí una cuenta demo o ingresá sus credenciales.
        </p>
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Los roles solo adaptan esta experiencia demo. La API aplicará la
          autenticación y autorización definitivas.
        </p>
        <div className="mt-5 space-y-4">
          {DEMO_ACCOUNT_GROUPS.map((group) => (
            <section key={group.group} aria-label={`Cuentas ${group.group}`}>
              <h2 className="text-sm font-semibold text-slate-800">
                {group.group}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.accounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    title={account.description}
                    onClick={() => {
                      setValue('email', account.email);
                      setValue('password', account.password);
                    }}
                    className="rounded border border-teal-300 bg-teal-50 px-3 py-2 text-left text-sm text-teal-900"
                  >
                    <span className="block font-medium">
                      Usar {account.label}
                    </span>
                    <span className="block text-xs">{account.description}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit((values) =>
            login.mutate(values, {
              onSuccess: (result) => navigate(getHomePath(result.role)),
            }),
          )}
        >
          <label className="block text-sm font-medium">
            Correo
            <input
              aria-label="Correo"
              className="mt-1 w-full rounded border p-2"
              {...register('email')}
            />
          </label>
          {errors.email && (
            <p className="text-sm text-red-700">{errors.email.message}</p>
          )}
          <label className="block text-sm font-medium">
            Contraseña
            <input
              aria-label="Contraseña"
              type="password"
              className="mt-1 w-full rounded border p-2"
              {...register('password')}
            />
          </label>
          {errors.password && (
            <p className="text-sm text-red-700">{errors.password.message}</p>
          )}
          {login.error && (
            <p role="alert" className="text-sm text-red-700">
              {login.error.message}
            </p>
          )}
          <button
            disabled={login.isPending}
            className="w-full rounded bg-teal-700 px-4 py-2 text-white disabled:opacity-50"
          >
            {login.isPending ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </section>
    </div>
  );
}
