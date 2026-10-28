import { useState } from 'react';
import { Link, useRouter } from '../lib/router';
import { portalHome, useSession } from '../lib/session';

const AUDIENCES = [
  {
    who: 'Institutions',
    as: 'institution',
    text: 'Registrars upload student-level admission data once admissions close, fix what the checks flag, and commit it to the national ledger.',
  },
  {
    who: 'AICTE officers',
    as: 'aicte',
    text: 'See reporting and compliance across states, review flagged cases with a second-officer sign-off, and rank institutions for inspection.',
  },
  {
    who: 'Verifiers',
    as: 'verifier',
    text: 'Approved employers, banks and universities confirm a student’s enrolment — only after the student agrees, and only the fields needed.',
  },
  {
    who: 'Students',
    as: 'student',
    text: 'See what each institution has reported about you, approve or refuse verification requests, and share a signed record.',
  },
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

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
        <div>
          <p className="text-sm font-semibold text-brand">SIH26263 · AICTE · Ministry of Education</p>
          <h1 className="text-3xl sm:text-[2.1rem] font-bold mt-2 mb-4 text-ink max-w-2xl">
            One verified record for every student in an AICTE-approved institution
          </h1>
          <p className="text-[1.05rem] text-muted max-w-2xl">
            Today AICTE mostly receives enrolment totals. This ledger collects student-level data keyed by the
            12-digit APAAR ID, checks it automatically, and lets employers and regulators confirm a student’s
            enrolment with the student’s consent.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {user ? (
              <Link to={portalHome(portal)} className="btn btn-primary no-underline">Go to my portal</Link>
            ) : (
              <Link to="/sign-in" className="btn btn-primary no-underline">Sign in</Link>
            )}
            <Link to="/activate" className="btn btn-secondary no-underline">Activate an institution account</Link>
          </div>
        </div>

        <form
          className="panel p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const value = token.trim().split('/').filter(Boolean).pop();
            if (value) navigate(`/verify/${encodeURIComponent(value)}`);
          }}
        >
          <h2 className="text-lg font-bold">Check a credential</h2>
          <p className="text-sm text-muted mt-1">
            Scanned a QR code on a certificate? Paste the link or code to see whether it is still valid. No sign-in needed.
          </p>
          <label htmlFor="home-token" className="label mt-3">Verification link or code</label>
          <input id="home-token" className="input mono" value={token} onChange={(e) => setToken(e.target.value)}
                 placeholder="e.g. demo-priya-tcs-2026" autoComplete="off" />
          <button type="submit" className="btn btn-primary mt-3 w-full" disabled={!token.trim()}>Check</button>
          <p className="hint mt-3">Try <button type="button" className="mono underline text-brand bg-transparent border-0 p-0 cursor-pointer" onClick={() => navigate('/verify/demo-priya-tcs-2026')}>demo-priya-tcs-2026</button> or <button type="button" className="mono underline text-brand bg-transparent border-0 p-0 cursor-pointer" onClick={() => navigate('/verify/demo-priya-hdfc-2025')}>demo-priya-hdfc-2025</button>.</p>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Who uses it</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((a) => (
            <div key={a.who} className="panel p-4 flex flex-col">
              <h3 className="font-bold text-base">{a.who}</h3>
              <p className="text-sm text-muted mt-2 mb-3 flex-1">{a.text}</p>
              <Link to={`/sign-in?as=${a.as}`} className="text-sm font-semibold">Sign in as {a.who.toLowerCase().replace(/s$/, '')} →</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="text-xl font-bold mb-4">How a record moves through the ledger</h2>
          <ol className="list-none p-0 space-y-0">
            {STAGES.map(([title, text], i) => (
              <li key={title} className="flex gap-4 pb-5 relative">
                <div className="flex flex-col items-center">
                  <span className="w-7 h-7 rounded-full bg-navy text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  {i < STAGES.length - 1 && <span className="w-px flex-1 bg-line mt-1" />}
                </div>
                <div className="pt-0.5">
                  <div className="font-semibold">{title}</div>
                  <p className="text-sm text-muted mt-0.5">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-4">
          <div className="panel p-5">
            <h2 className="text-base font-bold">What we do not collect</h2>
            <ul className="list-disc text-sm text-muted mt-2 pl-5 space-y-1">
              <li>Aadhaar numbers — files with an Aadhaar column are refused.</li>
              <li>Contact details of students.</li>
              <li>Anything a verifier does not need: they see institution, programme, year and status.</li>
            </ul>
          </div>
          <div className="panel p-5">
            <h2 className="text-base font-bold">About this prototype</h2>
            <p className="text-sm text-muted mt-2">
              All institutions and students here are synthetic. The ABC/APAAR registry, DigiLocker and Parichay
              connections are simulated behind the same interfaces a live integration would use. Seat-category caps
              are illustrative until checked against the AICTE Approval Process Handbook.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
