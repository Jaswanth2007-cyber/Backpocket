import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StaffLogin() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/staff/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setError('');
    setIsLoading(true);

    // Brief async tick for real auth feedback without fake setTimeout
    try {
      const result = await login(code);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Incorrect code — try again');
        setIsLoading(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-16">
      <div className="card bg-base-100/95 backdrop-blur border border-base-200 shadow-lg p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-base-content">Staff Authorization</h1>
            <p className="text-xs text-base-content/60">Restricted to campus desk officers</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="form-control w-full">
            <label className="label pb-1" htmlFor="staffCodeInput">
              <span className="label-text font-semibold text-sm flex items-center gap-1.5">
                <KeyRound size={15} className="text-base-content/60" />
                Staff Access Code
              </span>
            </label>
            <input
              id="staffCodeInput"
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter STAFF2026"
              autoComplete="current-password"
              className={`input input-bordered w-full text-base ${error ? 'input-error ring-1 ring-error' : 'focus:input-primary'}`}
              disabled={isLoading}
              required
            />
            {error ? (
              <label className="label pt-1.5">
                <span className="label-text-alt text-error font-medium flex items-center gap-1">
                  <AlertCircle size={13} />
                  {error}
                </span>
              </label>
            ) : (
              <label className="label pt-1">
                <span className="label-text-alt text-base-content/50">
                  Demo access code: <code className="font-mono bg-base-200 px-1 rounded">STAFF2026</code>
                </span>
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="btn btn-primary w-full gap-2 text-base font-bold shadow-sm"
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Shield size={16} />
                <span>Authorize &amp; Continue</span>
              </>
            )}
          </button>
        </form>

        <div className="divider my-4 text-xs text-base-content/40">OR</div>

        <button
          type="button"
          onClick={() => navigate('/search')}
          className="btn btn-ghost btn-sm w-full gap-1.5 text-base-content/70"
        >
          <ArrowLeft size={14} />
          <span>Return to Public Search</span>
        </button>
      </div>
    </div>
  );
}
