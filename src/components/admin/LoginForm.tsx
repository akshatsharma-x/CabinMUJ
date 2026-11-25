'use client';

import React, { useState, useTransition } from 'react';
import { unstable_rethrow } from 'next/navigation';
import { login } from '@/lib/actions/admin';

export function LoginForm({ next, setupProblem }: { next: string; setupProblem: string | null }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      try {
        // On success the server redirects to the admin panel; otherwise we get an error back.
        const res = await login({ username, password, next });
        if (res?.error) {
          setError(res.error);
          setPassword('');
        }
      } catch (err) {
        unstable_rethrow(err); // the redirect after a successful sign-in
        setError('Could not reach the server. Check your connection and try again.');
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 text-left" noValidate>
      {setupProblem && <div className="alert alert-warning">{setupProblem}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <div className="field">
        <label htmlFor="username" className="field-label">Username</label>
        <input
          id="username"
          name="username"
          className="input"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          required
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ padding: '0.75rem 0.875rem' }}
        />
      </div>

      <div className="field">
        <label htmlFor="password" className="field-label">Password</label>
        <div style={{ position: 'relative' }}>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            className="input"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ padding: '0.75rem 4.5rem 0.75rem 0.875rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            className="btn btn-ghost btn-sm"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending || Boolean(setupProblem)} style={{ padding: '0.75rem', borderRadius: '8px', fontSize: '0.9375rem' }}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
