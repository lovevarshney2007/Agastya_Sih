import { useState } from 'react';
import { ArrowRight, Building2, Fingerprint, GraduationCap, Landmark, QrCode, ScrollText, SearchCheck, ShieldCheck, Users } from 'lucide-react';
import { HeroIllustration } from '../components/Illustrations';
import { Link, useRouter } from '../lib/router';
import { portalHome, useSession } from '../lib/session';

const AUDIENCES = [
  {
    who: 'Institutions', as: 'institution', icon: Building2, tint: 'bg-brand-wash text-brand',
    text: 'Registrars upload student-level admission data once admissions close, fix what the checks flag, and commit it to the national ledger.',
    cta: 'Sign in as institution',
  },
  {
    who: 'AICTE officers', as: 'aicte', icon: Landmark, tint: 'bg-saffron-wash text-saffron',
    text: 'See reporting and compliance across states, review flagged cases with a second-officer sign-off, and rank institutions for inspection.',
    cta: 'Sign in as AICTE officer',
  },
  {
    who: 'Verifiers', as: 'verifier', icon: SearchCheck, tint: 'bg-ok-wash text-ok',
    text: 'Approved employers, banks and universities confirm a student’s enrolment — only after the student agrees, and only the fields needed.',
    cta: 'Sign in as verifier',
  },
  {
    who: 'Students', as: 'student', icon: GraduationCap, tint: 'bg-[#e7f7f6] text-teal',
    text: 'See what each institution has reported about you, approve or refuse verification requests, and share a signed record.',
    cta: 'Sign in as student',
  },
];

const FEATURES = [
  { icon: Fingerprint, title: 'APAAR-keyed identity', text: 'Every record is tied to the 12-digit APAAR ID, checked against the ABC registry.' },
  { icon: Users, title: 'Duplicate detection', text: 'Students active full-time at two colleges are caught the moment the second one reports.' },
  { icon: ShieldCheck, title: 'Consent first', text: 'Nothing is shared with a verifier until the student approves, and it can be withdrawn any time.' },
  { icon: ScrollText, title: 'Tamper-evident log', text: 'Every action is hash-chained, so a single edited entry is detected instantly.' },
];

const STAGES = [
  ['Upload', 'The institution submits a CSV or Excel file in the published template, or enters students one at a time.'],
  ['APAAR check', 'Every APAAR ID is checked for format and against the ABC registry. Students without one are held, not rejected.'],
  ['Rule checks', 'Duplicates, students active at another college, intake and supernumerary caps, and category mismatches are flagged row by row.'],
  ['Commit', 'The nodal officer reviews the report and commits. Accepted rows enter the repository; held rows wait for correction.'],
  ['Review', 'Conflicts become cases for AICTE. A proposed outcome only takes effect after a second officer approves it.'],
  ['Verification', 'With the student’s consent, a verifier receives a signed result with a QR code that anyone can re-check.'],
];

export function Home() {
  const { user, portal } = useSession();
  const { navigate } = useRouter();
  const [token, setToken] = useState('');

  const check = (value: string) => {
    const t = value.trim().split('/').filter(Boolean).pop();
    if (t) navigate(`/verify/${encodeURIComponent(t)}`);
  };

  return (
    <div className="space-y-16">
      <section className="hero-bg -mx-4 sm:-mx-6 -mt-7 px-4 sm:px-6 pt-10 pb-12 rounded-b-[32px] border-b border-line-soft">
        <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-[1.15fr_1fr] items-center">
          <div className="stagger">
            <span className="inline-flex items-center gap-2 rounded-full bg-white border border-line-soft px-3 py-1 text-xs font-semibold text-navy shadow-sm">
              <span className="w-2 h-2 rounded-full bg-india-green animate-pulse" /> AICTE · Ministry of Education
            </span>
            <h1 className="text-3xl sm:text-[2.6rem] font-bold mt-4 mb-4 max-w-2xl leading-tight">
              One <span className="text-gradient">verified record</span> for every student in an AICTE-approved institution
            </h1>
            <p className="text-[1.05rem] text-muted max-w-xl">
              Institutions report student-level data keyed by the APAAR ID. The ledger checks it automatically, flags
              duplicates and over-intake, and lets employers and regulators confirm enrolment — with the student’s consent.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              {user ? (
                <Link to={portalHome(portal)} className="btn btn-primary no-underline !px-5 !py-2.5">Go to my portal <ArrowRight size={16} aria-hidden="true" /></Link>
              ) : (
                <Link to="/sign-in" className="btn btn-primary no-underline !px-5 !py-2.5">Sign in <ArrowRight size={16} aria-hidden="true" /></Link>
              )}
              <Link to="/activate" className="btn btn-secondary no-underline !px-5 !py-2.5">Activate an institution account</Link>
            </div>

            <form className="mt-8 max-w-xl panel p-2 flex gap-2 items-center" onSubmit={(e) => { e.preventDefault(); check(token); }}>
              <QrCode size={20} className="text-brand ml-2 shrink-0" aria-hidden="true" />
              <label htmlFor="home-token" className="sr-only">Verification link or code</label>
              <input id="home-token" className="input !border-0 !shadow-none mono" value={token} onChange={(e) => setToken(e.target.value)}
                     placeholder="Paste a verification link or code" autoComplete="off" />
              <button type="submit" className="btn btn-saffron shrink-0" disabled={!token.trim()}>Check</button>
            </form>
            <p className="hint mt-2">
              Scanned a QR code on a certificate? Check it here — no sign-in needed. Sample codes:{' '}
              <button type="button" className="mono underline text-brand bg-transparent border-0 p-0 cursor-pointer" onClick={() => check('demo-priya-tcs-2026')}>demo-priya-tcs-2026</button>,{' '}
              <button type="button" className="mono underline text-brand bg-transparent border-0 p-0 cursor-pointer" onClick={() => check('demo-priya-hdfc-2025')}>demo-priya-hdfc-2025</button>
            </p>
          </div>
          <HeroIllustration className="w-full max-w-xl mx-auto drop-shadow-sm" />
        </div>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger">
          {FEATURES.map((f) => (
            <div key={f.title} className="panel lift p-5">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-brand text-white flex items-center justify-center shadow-md">
                <f.icon size={20} aria-hidden="true" />
              </span>
              <h3 className="font-bold text-base mt-3">{f.title}</h3>
              <p className="text-sm text-muted mt-1">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-1 font-[family-name:var(--font-display)]">Who uses it</h2>
        <p className="text-muted mt-0 mb-5">Four portals, one ledger. Each person sees only what their role needs.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger">
          {AUDIENCES.map((a) => (
            <Link key={a.who} to={`/sign-in?as=${a.as}`} className="panel lift p-5 flex flex-col no-underline text-ink group">
              <span className={`w-11 h-11 rounded-full flex items-center justify-center ${a.tint}`}>
                <a.icon size={22} aria-hidden="true" />
              </span>
              <h3 className="font-bold text-base mt-3">{a.who}</h3>
              <p className="text-sm text-muted mt-1 mb-4 flex-1">{a.text}</p>
              <span className="text-sm font-semibold text-brand inline-flex items-center gap-1">
                {a.cta} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="text-2xl font-bold mb-5 font-[family-name:var(--font-display)]">How a record moves through the ledger</h2>
          <ol className="stagger">
            {STAGES.map(([title, text], i) => (
              <li key={title} className="flex gap-4 pb-5">
                <div className="flex flex-col items-center">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-navy to-brand text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-md">{i + 1}</span>
                  {i < STAGES.length - 1 && <span className="w-0.5 flex-1 bg-gradient-to-b from-brand/40 to-line mt-1" />}
                </div>
                <div className="pt-1">
                  <div className="font-semibold">{title}</div>
                  <p className="text-sm text-muted mt-0.5">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-4 stagger">
          <div className="panel p-5 border-l-4 !border-l-saffron">
            <h2 className="text-base font-bold">What we never collect</h2>
            <ul className="list-disc text-sm text-muted mt-2 pl-5 space-y-1">
              <li>Aadhaar numbers — files with an Aadhaar column are refused.</li>
              <li>Contact details of students.</li>
              <li>Anything a verifier does not need: they see institution, programme, year and status only.</li>
            </ul>
          </div>
          <div className="panel p-5 border-l-4 !border-l-india-green">
            <h2 className="text-base font-bold">Built for India’s education stack</h2>
            <p className="text-sm text-muted mt-2">
              Designed around APAAR and the Academic Bank of Credits, DigiLocker and Parichay sign-in, and the
              Digital Personal Data Protection Act 2023. Seat-category rules are modelled on the AICTE Approval Process Handbook.
            </p>
          </div>
          <div className="panel p-5 nav-gradient text-white !border-0">
            <h2 className="text-base font-bold">Verify a certificate</h2>
            <p className="text-sm text-[#c9d4e5] mt-2">Every credential carries a QR code that anyone can scan to see whether it is valid or revoked.</p>
            <Link to="/verify" className="btn btn-saffron btn-sm no-underline mt-3">Open the verification page</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
