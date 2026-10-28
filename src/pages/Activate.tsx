import { useState } from 'react';
import { api } from '../api/client';
import { Alert, Field, Spinner } from '../components/ui';
import { Link, useRouter } from '../lib/router';
import { useSession } from '../lib/session';

export function Activate() {
  const { navigate } = useRouter();
  const { signIn } = useSession();
  const [form, setForm] = useState({ aicte_permanent_id: '', nodal_officer_email: '', otp: '', password: '', confirm_password: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!otpSent) {
      if (!/^\d+-\d+$/.test(form.aicte_permanent_id.trim())) {
        setError('The Permanent ID looks like 1-1234567. It is printed on your AICTE approval letter.');
        return;
      }
      setOtpSent(true);
      return;
    }
    if (form.password !== form.confirm_password) {
      setError('The two passwords do not match.');
      return;
    }
    setPending(true);
    try {
      const res = await api.auth.activate(form);
      signIn(res);
      navigate('/institution', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mt-0 mb-1">Activate an institution account</h1>
      <p className="text-muted mt-0 mb-5">
        For institutions that AICTE has approved but that have not used the ledger yet. The nodal officer named in
        your approval does this once.
      </p>

      <form onSubmit={submit} className="panel p-5 sm:p-6 space-y-4">
        {error && <Alert tone="bad">{error}</Alert>}

        <Field label="AICTE Permanent ID" hint="Try 1-9900112 (Malaviya Institute of Technology, not yet activated)." htmlFor="act-pid">
          <input id="act-pid" className="input mono" required value={form.aicte_permanent_id} onChange={set('aicte_permanent_id')}
                 disabled={otpSent} placeholder="1-1234567" />
        </Field>
        <Field label="Nodal officer’s email, as held by AICTE" hint="For the demo institution: registrar@mitjaipur.edu.in" htmlFor="act-email">
          <input id="act-email" className="input" type="email" required value={form.nodal_officer_email}
                 onChange={set('nodal_officer_email')} disabled={otpSent} />
        </Field>

        {otpSent && (
          <>
            <Alert tone="info">
              A one-time code was sent to {form.nodal_officer_email}. <span className="text-xs">(Prototype code: 123456)</span>{' '}
              <button type="button" className="underline text-brand bg-transparent border-0 p-0 cursor-pointer" onClick={() => setOtpSent(false)}>Change details</button>
            </Alert>
            <Field label="One-time code" htmlFor="act-otp">
              <input id="act-otp" className="input mono max-w-[180px]" inputMode="numeric" maxLength={6} required value={form.otp} onChange={set('otp')} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New password" hint="At least 8 characters." htmlFor="act-pw">
                <input id="act-pw" className="input" type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={set('password')} />
              </Field>
              <Field label="Repeat password" htmlFor="act-pw2">
                <input id="act-pw2" className="input" type="password" autoComplete="new-password" required value={form.confirm_password} onChange={set('confirm_password')} />
              </Field>
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending && <Spinner />} {otpSent ? 'Activate account' : 'Send code'}
          </button>
          <Link to="/sign-in" className="text-sm">Already activated? Sign in</Link>
        </div>
      </form>
    </div>
  );
}
