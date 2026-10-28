import { useRef, useState, type KeyboardEvent } from 'react';
import { ArrowRight, Building2, ChevronRight, GraduationCap, Landmark, SearchCheck } from 'lucide-react';
import { api } from '../api/client';
import { HeroIllustration } from '../components/Illustrations';
import { CountUp } from '../components/ui';
import { fmtDate, fmtTime } from '../lib/format';
import { Link, useRouter } from '../lib/router';
import { portalHome, useSession } from '../lib/session';
import { useApi } from '../lib/useApi';

const PORTALS = [
  { as: 'institution', icon: Building2, title: 'Institution', text: 'Upload admitted students, fix what the checks flag and commit to the ledger.' },
  { as: 'aicte', icon: Landmark, title: 'AICTE officer', text: 'National reporting, flagged cases with two-officer sign-off, and risk ranking.' },
  { as: 'verifier', icon: SearchCheck, title: 'Verifier organisation', text: 'Confirm a student’s enrolment after the student agrees to share it.' },
  { as: 'student', icon: GraduationCap, title: 'Student', text: 'See what your institution reported, approve requests and share your record.' },
];

const STEPS = [
  { title: 'Upload', who: 'Institution registrar', text: 'Once admissions close, the institution uploads one row per student in the published CSV or Excel template, or adds students one at a time. Approved intake is taken from AICTE’s approval records, not from the file.' },
  { title: 'APAAR check', who: 'Automatic', text: 'Each APAAR ID is checked for format and against the ABC registry. A student without an APAAR ID is held as “Pending APAAR” with a deadline — never rejected for it.' },
  { title: 'Rule checks', who: 'Automatic', text: 'Every row is checked for duplicates, for a full-time seat already held at another college, for approved-intake and supernumerary caps, and for category and date mistakes. Each problem comes with a plain-language fix.' },
  { title: 'Commit', who: 'Nodal officer', text: 'The nodal officer reads the report, signs a declaration and commits. Accepted rows join the national ledger; held rows wait for correction; rejected rows are not recorded.' },
  { title: 'Review', who: 'AICTE officers', text: 'Conflicts become cases. One officer proposes an outcome with a reason; it only takes effect when a second, senior officer approves it. The institution is told the case number, not the other college’s name.' },
  { title: 'Verify', who: 'Student and verifier', text: 'An employer or university asks to verify a student. The student approves in their portal, and the verifier receives a signed result with a QR code anyone can re-check — or see as revoked if consent is withdrawn.' },
];

const FAQ = [
  ['What is an APAAR ID?', 'APAAR (Automated Permanent Academic Account Registry) is a 12-digit lifelong academic ID issued through the Academic Bank of Credits. This ledger uses it as the single key for every student record, so the same student can’t be counted twice.'],
  ['I don’t have an APAAR ID yet. Will my admission be rejected?', 'No. Your institution records you as “Pending APAAR”. Create an APAAR ID through DigiLocker and give it to your institution before 31 December 2026 so your record can be verified.'],
  ['My details are wrong. How do I fix them?', 'Ask your institution’s registrar to correct the record. If your name or date of birth doesn’t match your APAAR record, it is held as “Mismatch” until it is fixed — it is not deleted.'],
  ['Who can see my record?', 'Your institution; AICTE officers for regulatory work, where every access is logged with a reason; and organisations you approve. Verifiers only see your institution, programme, year and enrolment status.'],
  ['How do I check a certificate’s QR code?', 'Scan it with your phone camera, or paste the code into the box at the top of this page. You’ll see Valid, Revoked or Not valid. No sign-in is needed.'],
  ['Is my Aadhaar number collected?', 'No. Files that contain an Aadhaar column are refused, and APAAR IDs themselves are stored encrypted and shown with only the last four digits.'],
];

function LiveFigures() {
  const { data } = useApi(() => api.publicStats(), []);
  if (!data) {
    return <div className="grid grid-cols-2 lg:grid-cols-4 gap-6" aria-hidden="true">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-14" />)}</div>;
  }
  const figures: [string, number, string][] = [
    ['Institutions reporting', data.institutions_reporting, `of ${data.institutions_approved} approved`],
    ['Students on the ledger', data.students_on_ledger, 'active enrolments, 2026–27'],
    ['Duplicate enrolments caught', data.duplicates_caught, 'sent for AICTE review'],
    ['Credentials issued', data.credentials_issued, 'with the student’s consent'],
  ];
  return (
    <>
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
        {figures.map(([label, n, sub]) => (
          <div key={label} className="border-l-2 border-line pl-4">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="text-[1.7rem] font-bold tabular-nums text-navy leading-tight"><CountUp value={n.toLocaleString('en-IN')} /></dd>
            <dd className="text-xs text-muted">{sub}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted mt-4">
        Updated {fmtTime(data.as_of)}. Student-level data for 2026–27 is due by <strong className="text-ink">{fmtDate(data.submission_deadline)}</strong>.
      </p>
    </>
  );
}

function HowItWorks() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const step = STEPS[active];

  function onKey(e: KeyboardEvent) {
    const next = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? active + 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? active - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const i = (next + STEPS.length) % STEPS.length;
    setActive(i);
    tabs.current[i]?.focus();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div role="tablist" aria-orientation="vertical" aria-label="Stages" onKeyDown={onKey} className="flex lg:flex-col gap-1 overflow-x-auto pb-1 scroll-fade">
        {STEPS.map((s, i) => (
          <button
            key={s.title}
            ref={(el) => { tabs.current[i] = el; }}
            role="tab"
            id={`step-tab-${i}`}
            aria-selected={active === i}
            aria-controls="step-panel"
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={`flex items-center gap-3 text-left rounded-md px-3 py-2.5 border cursor-pointer whitespace-nowrap transition-colors ${active === i ? 'bg-white border-line text-ink shadow-sm' : 'bg-transparent border-transparent text-muted hover:bg-white/70 hover:text-ink'}`}
          >
            <span className={`w-7 h-7 shrink-0 rounded-full text-sm font-bold flex items-center justify-center ${active === i ? 'bg-navy text-white' : i < active ? 'bg-ok-wash text-ok' : 'bg-neutral-wash text-muted'}`}>{i + 1}</span>
            <span className="font-semibold text-sm">{s.title}</span>
          </button>
        ))}
      </div>
      <div id="step-panel" role="tabpanel" aria-labelledby={`step-tab-${active}`} className="panel p-6 grid gap-6 md:grid-cols-[1fr_260px] items-center">
        <div key={active} className="animate-fade-up">
          <div className="text-xs font-semibold uppercase tracking-wide text-saffron">Step {active + 1} of {STEPS.length} · {step.who}</div>
          <h3 className="text-xl font-bold mt-1">{step.title}</h3>
          <p className="text-muted mt-2">{step.text}</p>
          <div className="flex gap-2 mt-5">
            <button type="button" className="btn btn-secondary btn-sm" disabled={active === 0} onClick={() => setActive(active - 1)}>Previous</button>
            <button type="button" className="btn btn-secondary btn-sm" disabled={active === STEPS.length - 1} onClick={() => setActive(active + 1)}>Next</button>
          </div>
        </div>
        <HeroIllustration className="w-full max-w-[260px] mx-auto hidden md:block" />
      </div>
    </div>
  );
}

export function Home() {
  const { user, portal } = useSession();
  const { navigate } = useRouter();
  const [token, setToken] = useState('');

  const check = (value: string) => {
    const t = value.trim().split('/').filter(Boolean).pop();
    if (t) navigate(`/verify/${encodeURIComponent(t)}`);
  };

  return (
    <>
      <section className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid gap-10 lg:grid-cols-[1.25fr_1fr] items-center">
          <div>
            <p className="text-sm font-semibold text-[#f6c48f]">All India Council for Technical Education</p>
            <h1 className="text-3xl sm:text-[2.5rem] font-bold mt-3 leading-[1.15] max-w-2xl">
              Report, check and verify student enrolment — one record per student, keyed by APAAR ID
            </h1>
            <p className="text-[#c9d4e5] text-[1.05rem] mt-4 max-w-xl">
              Institutions submit student-level admission data. The ledger checks every row, catches students enrolled twice
              and seats beyond approved intake, and lets employers confirm a student’s enrolment once the student agrees.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link to={user ? portalHome(portal) : '/sign-in'} className="btn btn-saffron no-underline !px-5 !py-2.5">
                {user ? 'Go to my portal' : 'Sign in'} <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/activate" className="btn no-underline !px-5 !py-2.5 border-white/40 text-white hover:bg-white/10">Activate an institution account</Link>
            </div>
          </div>

          <form className="bg-white text-ink rounded-lg p-6 shadow-[0_10px_30px_-12px_rgb(0_0_0/.45)]" onSubmit={(e) => { e.preventDefault(); check(token); }}>
            <h2 className="text-lg font-bold">Verify a certificate</h2>
            <p className="text-sm text-muted mt-1">Scanned the QR code on an enrolment certificate? Paste the link or the code printed under it. No sign-in needed.</p>
            <label htmlFor="home-token" className="label mt-4">Verification link or code</label>
            <div className="flex gap-2">
              <input id="home-token" className="input mono" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" spellCheck={false} />
              <button type="submit" className="btn btn-primary shrink-0" disabled={!token.trim()}>Check</button>
            </div>
            <p className="hint mt-3">
              Example codes:{' '}
              <button type="button" className="mono underline text-brand bg-transparent border-0 p-0 cursor-pointer" onClick={() => check('demo-priya-tcs-2026')}>demo-priya-tcs-2026</button>{' '}
              (valid),{' '}
              <button type="button" className="mono underline text-brand bg-transparent border-0 p-0 cursor-pointer" onClick={() => check('demo-priya-hdfc-2025')}>demo-priya-hdfc-2025</button>{' '}
              (revoked)
            </p>
          </form>
        </div>
        <div className="tricolour h-1" aria-hidden="true" />
      </section>

      <section className="bg-white border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <LiveFigures />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-14">
        <section aria-labelledby="portals-h">
          <h2 id="portals-h" className="text-2xl font-bold">Sign in to your portal</h2>
          <p className="text-muted mt-1">Each portal shows only what that role needs.</p>
          <ul className="grid gap-3 md:grid-cols-2 mt-5">
            {PORTALS.map((p) => (
              <li key={p.as}>
                <Link to={user && portal === p.as ? `/${p.as}` : `/sign-in?as=${p.as}`} className="panel lift flex items-center gap-4 p-4 no-underline text-ink group h-full">
                  <span className="w-11 h-11 shrink-0 rounded-md bg-brand-wash text-brand flex items-center justify-center"><p.icon size={22} aria-hidden="true" /></span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold">{p.title}</span>
                    <span className="block text-sm text-muted">{p.text}</span>
                  </span>
                  <ChevronRight size={20} className="text-faint shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how-h">
          <h2 id="how-h" className="text-2xl font-bold">How a record moves through the ledger</h2>
          <p className="text-muted mt-1 mb-5">Select a stage to see who is involved and what happens.</p>
          <HowItWorks />
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.6fr_1fr]" aria-labelledby="faq-h">
          <div>
            <h2 id="faq-h" className="text-2xl font-bold">Common questions</h2>
            <div className="panel mt-5 divide-y divide-line-soft">
              {FAQ.map(([q, a]) => (
                <details key={q} className="faq group">
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 font-semibold hover:bg-wash">
                    {q}
                    <ChevronRight size={18} className="chev text-faint shrink-0" aria-hidden="true" />
                  </summary>
                  <p className="faq-body px-5 pb-5 -mt-1 text-muted">{a}</p>
                </details>
              ))}
            </div>
          </div>
          <aside className="space-y-4 lg:pt-14">
            <div className="panel p-5 border-t-4 !border-t-saffron">
              <h3 className="font-bold">What we never collect</h3>
              <ul className="list-disc pl-5 mt-2 text-sm text-muted space-y-1">
                <li>Aadhaar numbers</li>
                <li>Student phone numbers or addresses</li>
                <li>More than a verifier needs to know</li>
              </ul>
            </div>
            <div className="panel p-5 border-t-4 !border-t-india-green">
              <h3 className="font-bold">Need help?</h3>
              <p className="text-sm text-muted mt-2">
                Institutions: contact your AICTE regional office quoting your Permanent ID.<br />
                Everyone else: helpdesk@apaar-ledger.example
              </p>
            </div>
          </aside>
        </section>
      </div>
    </>
  );
}
