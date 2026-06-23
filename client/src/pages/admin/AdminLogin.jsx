import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../AuthContext';
import './AdminAuth.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, admin } = useAuth();
  const [needsSetup, setNeedsSetup] = useState(null);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (admin) {
      navigate('/admin');
      return;
    }
    api
      .setupStatus()
      .then((d) => setNeedsSetup(d.needsSetup))
      .catch(() => setNeedsSetup(false));
  }, [admin, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (needsSetup) {
        await api.setupAdmin(form);
      }
      await login(form.username, form.password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (needsSetup === null) return null;

  return (
    <div className="admin-auth">
      <div className="admin-auth__card">
        <p className="eyebrow">Aurelle &amp; Co.</p>
        <h1>{needsSetup ? 'Create your admin account' : 'Admin sign in'}</h1>
        {needsSetup && (
          <p className="admin-auth__hint">
            This runs once. Whoever sets this up first becomes the store admin.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={needsSetup ? 8 : undefined}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </label>

          {error && <p className="admin-auth__error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Please wait…' : needsSetup ? 'Create account & sign in' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
