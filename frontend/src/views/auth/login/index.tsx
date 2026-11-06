import { Mail, Loader2, Headset } from 'lucide-react';
import { useLogin } from './hooks/useLogin';
import { StandardInput } from '../../../components/inputs/StandardInput';
import { PasswordInput } from '../../../components/inputs/PasswordInput';

export default function LoginPage() {
  const { email, setEmail, password, setPassword, errors, isLoading, handleSubmit } = useLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-3">
            <Headset className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">AlusDesk</h1>
          <p className="text-sm text-slate-500 mt-1">Multi-Tenant Helpdesk & Support Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <StandardInput
            label="Email Address"
            type="email"
            placeholder="agent@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            leftIcon={<Mail className="h-4 w-4" />}
            autoComplete="email"
            disabled={isLoading}
          />

          <PasswordInput
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
