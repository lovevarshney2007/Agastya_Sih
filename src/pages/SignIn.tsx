import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { DemoAccounts, LoginResponse } from '../api/types';
import { Alert, Field, Spinner } from '../components/ui';
import { Link, useRouter } from '../lib/router';
import { PORTAL_FOR_ROLE, portalHome, useSession, type Portal } from '../lib/session';

const DOORS: { id: Portal; title: string; idLabel: string; placeholder: string; note: string }[] = [
  { id: 'institution', title: 'Institution', idLabel: 'AICTE Permanent ID or registered email', placeholder: '1-1049281',
    note: 'For registrars and nodal officers of AICTE-approved institutions.' },
  { id: 'aicte', title: 'AICTE', idLabel: 'Official email', placeholder: 'name@gov.in',
    note: 'In production AICTE staff sign in through Parichay. Here it uses a password.' },
  { id: 'verifier', title: 'Verifier organisation', idLabel: 'Work email', placeholder: 'name@company.com',
    note: 'For organisations AICTE has approved to verify student records.' },
  { id: 'student', title: 'Student', idLabel: 'Registered email', placeholder: 'name@student.aicte.gov.in',
    note: 'In production students sign in with Meri Pehchaan or their APAAR ID. Here it uses a password.' },
];

const DEMO_FOR_DOOR: Record<Portal, string[]> = {
  institution: ['INSTITUTION_REGISTRAR'],
  aicte: ['AICTE_MAKER', 'AICTE_CHECKER'],
  verifier: ['VERIFIER'],
  student: ['STUDENT'],
};

export function SignIn() {
  const { search, navigate } = useRouter();
  const { user, portal, signIn, expired } = useSession();
  const initialDoor = (DOORS.find((d) => d.id === search.get('as'))?.id ?? 'institution') as Portal;
  const [door, setDoor] = useState<Portal>(initialDoor);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState<DemoAccounts | null>(null);
  const [pendingLogin, setPendingLogin] = useState<LoginResponse | null>(null);
  const next = search.get('next');

  useEffect(() => { api.auth.demoAccounts().then(setDemo).catch(() => setDemo(null)); }, []);

  // Already signed in: go straight to the portal.
  useEffect(() => {
    if (user && !pendingLogin) navigate(next && next.startsWith(`/${portal}`) ? next : portalHome(portal), { replace: true });
  }, [user, portal, next, navigate, pendingLogin]);

  const doorInfo = DOORS.find((d) => d.id === door)!;

  function finish(res: LoginResponse) {
    const target = PORTAL_FOR_ROLE[res.user.role];
    if (target !== door) {
      setError(`This account belongs to the ${DOORS.find((d) => d.id === target)?.title} portal. Use that tab to sign in.`);
      setStep('credentials');
      setPendingLogin(null);
      return;
    }
    signIn(res);
    navigate(next && next.startsWith(`/${target}`) ? next : `/${target}`, { replace: true });
  }

  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await api.auth.login(identifier, password);
      if (PORTAL_FOR_ROLE[res.user.role] !== door) {
        finish(res);
        return;
      }
      setPendingLogin(res);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setPending(false);
    }
  }

  function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code.');
      return;
    }
    if (pendingLogin) finish(pendingLogin);
  }

  async function demoSignIn(personaId: string) {
    setPending(true);
    setError(null);
    try {
      finish(await api.auth.demoLogin(personaId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mt-0 mb-1">Sign in</h1>
      <p className="text-muted mt-0 mb-5">Choose who you are signing in as.</p>

      {expired && <div className="mb-4"><Alert tone="warn" title="Your session expired">Sign in again to continue.</Alert></div>}
      {search.get('signedout') && !expired && <div className="mb-4"><Alert tone="ok">You have signed out.</Alert></div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 border border-line rounded-t-md overflow-hidden bg-white" role="tablist">
        {DOORS.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={door === d.id}
            onClick={() => { setDoor(d.id); setError(null); setStep('credentials'); setPendingLogin(null); setIdentifier(''); setPassword(''); }}
            className={`px-3 py-2.5 text-sm border-0 cursor-pointer ${door === d.id ? 'bg-navy text-white font-semibold' : 'bg-white text-ink hover:bg-wash'}`}
          >
            {d.title}
          </button>
        ))}
      </div>

      <div className="panel rounded-t-none border-t-0 p-5 sm:p-6">
        <p className="text-sm text-muted mt-0">{doorInfo.note}</p>

        {error && <div className="mb-4"><Alert tone="bad">{error}</Alert></div>}

        {step === 'credentials' ? (
          <form onSubmit={submitCredentials} className="space-y-4">
            <Field label={doorInfo.idLabel} htmlFor="signin-id">
              <input id="signin-id" className="input" autoComplete="username" required value={identifier}
                     onChange={(e) => setIdentifier(e.target.value)} placeholder={doorInfo.placeholder} />
            </Field>
            <Field label="Password" htmlFor="signin-pw">
              <input id="signin-pw" className="input" type="password" autoComplete="current-password" required value={password}
                     onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button type="submit" className="btn btn-primary" disabled={pending}>{pending && <Spinner />} Continue</button>
              <span className="text-sm text-muted">Forgot your password? Contact your nodal officer or the AICTE help desk.</span>
            </div>
          </form>
        ) : (
          <form onSubmit={submitOtp} className="space-y-4">
            <Alert tone="info">
              We sent a 6-digit code to the mobile number registered for <strong>{pendingLogin?.user.email}</strong>.
              <span className="block text-xs mt-1">Prototype: any 6 digits are accepted.</span>
            </Alert>
            <Field label="One-time code" htmlFor="signin-otp">
              <input id="signin-otp" className="input mono tracking-[0.3em] max-w-[180px]" inputMode="numeric" autoComplete="one-time-code"
                     maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} autoFocus />
            </Field>
            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">Sign in</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setStep('credentials'); setPendingLogin(null); setOtp(''); }}>Back</button>
            </div>
          </form>
        )}

        {door === 'institution' && step === 'credentials' && (
          <p className="text-sm mt-5 pt-4 border-t border-line-soft">
            First time here? <Link to="/activate">Activate your institution’s account</Link> with your AICTE Permanent ID.
          </p>
        )}
      </div>

      {demo && (
        <div className="panel mt-6 p-5">
          <h2 className="text-base font-bold">Demo accounts</h2>
          <p className="text-sm text-muted mt-1 mb-3">
            For evaluation. Every account uses the password <span className="mono">{demo.password}</span>, or sign straight in:
          </p>
          <ul className="list-none p-0 divide-y divide-line-soft">
            {demo.accounts.filter((a) => DEMO_FOR_DOOR[door].includes(a.persona_id)).map((a) => (
              <li key={a.persona_id} className="py-2.5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm">
                  <div className="font-semibold">{a.label}</div>
                  <div className="text-muted">{a.organisation} · <span className="mono">{a.email}</span></div>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-secondary btn-sm"
                          onClick={() => { setIdentifier(a.email); setPassword(demo.password); setError(null); }}>Fill in</button>
                  <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={() => demoSignIn(a.persona_id)}>Sign in</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
