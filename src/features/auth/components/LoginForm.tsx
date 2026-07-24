import { useId, useState } from 'react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';

import type { LoginFormValues } from '@/features/auth/schemas';
import { DEMO_SHARED_PASSWORD } from '@/features/auth/role-presentation';

type LoginFormProps = {
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  onSubmit: () => void;
  onFillCredentials: () => void;
  isPending: boolean;
  serverError?: string;
};

export function LoginForm({
  register,
  errors,
  onSubmit,
  onFillCredentials,
  isPending,
  serverError,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const emailId = useId();
  const passwordId = useId();
  const emailErrorId = `${emailId}-error`;
  const passwordErrorId = `${passwordId}-error`;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Todas las cuentas de demostración usan la contraseña:{' '}
        <strong>{DEMO_SHARED_PASSWORD}</strong>
      </p>
      <div>
        <label htmlFor={emailId} className="block text-sm font-medium">
          Correo
        </label>
        <input
          id={emailId}
          type="email"
          autoComplete="username"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? emailErrorId : undefined}
          className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          {...register('email')}
        />
        {errors.email && (
          <p
            id={emailErrorId}
            className="mt-1 text-sm text-red-700"
            role="alert"
          >
            {errors.email.message}
          </p>
        )}
      </div>
      <div>
        <label htmlFor={passwordId} className="block text-sm font-medium">
          Contraseña
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id={passwordId}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? passwordErrorId : undefined}
            className="w-full rounded-lg border border-slate-300 p-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            {...register('password')}
          />
          <button
            type="button"
            className="min-h-11 shrink-0 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            onClick={() => setShowPassword((value) => !value)}
            aria-pressed={showPassword}
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        {errors.password && (
          <p
            id={passwordErrorId}
            className="mt-1 text-sm text-red-700"
            role="alert"
          >
            {errors.password.message}
          </p>
        )}
      </div>
      {serverError && (
        <p role="alert" className="text-sm text-red-700">
          {serverError}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={isPending}
          onClick={onFillCredentials}
          className="min-h-11 flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          Completar credenciales del rol
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="min-h-11 flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          {isPending ? 'Ingresando…' : 'Ingresar'}
        </button>
      </div>
    </form>
  );
}
