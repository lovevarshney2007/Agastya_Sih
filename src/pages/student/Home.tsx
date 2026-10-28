import { api } from '../../api/client';
import { Alert, ErrorState, KeyValue, Loading, PageHeader, Panel, StatusTag } from '../../components/ui';
import { humanize } from '../../lib/format';
import { Link } from '../../lib/router';
import { useApi } from '../../lib/useApi';

const IDENTITY_TEXT: Record<string, string> = {
  VERIFIED: 'Your APAAR ID matched the national registry. Nothing to do.',
  PENDING_APAAR: 'Your institution has not yet submitted a verified APAAR ID for you. Give them your APAAR ID, or create one through DigiLocker, before 31 Dec 2026.',
  NO_APAAR: 'The APAAR ID your institution submitted was not found. Check the number with your institution.',
  MISMATCH: 'Your name or date of birth here differs from your APAAR record. Ask your institution to correct it.',
  CHECK_PENDING: 'The national registry could not be reached. This will be retried automatically.',
};

export function StudentHome() {
  const { data, error, reload } = useApi(() => api.student.me(), []);

  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Loading rows={8} />;

  return (
    <>
      <PageHeader title={data.student.name} description={<>APAAR <span className="mono">{data.student.masked_apaar}</span> · what institutions have reported about you</>} />

      {data.pending.length > 0 && (
        <div className="mb-5">
          <Alert tone="warn" title={`${data.pending.length} organisation${data.pending.length === 1 ? ' is' : 's are'} asking to verify your record`}>
            Nothing is shared until you approve. <Link to="/student/consent">Review requests</Link>
          </Alert>
        </div>
      )}

      <h2 className="text-lg font-bold mb-3">Enrolments</h2>
      {data.enrolments.length === 0 ? (
        <Panel><p className="text-sm">No institution has reported an enrolment for you yet. Institutions submit data after admissions close.</p></Panel>
      ) : (
        <div className="space-y-4">
          {data.enrolments.map((e) => (
            <Panel key={e.enrolment_id} title={<h3 className="text-base font-bold">{e.institution}</h3>} actions={<StatusTag value={e.status} />}>
              <KeyValue items={[
                ['Programme', e.course],
                ['Academic year', `${e.academic_year}–${String(e.academic_year + 1).slice(2)}, year ${e.year_of_study}`],
                ['Student ID', <span key="kv4" className="mono">{e.student_id_no}</span>],
                ['Identity check', <StatusTag key="kv5" value={e.identity_status} />],
              ]} />
              <p className="text-sm text-muted mt-3">{IDENTITY_TEXT[e.identity_status] ?? humanize(e.identity_status)}</p>
              {e.verification_status === 'FLAGGED' && (
                <div className="mt-3"><Alert tone="warn">This record is under review by AICTE. You may be contacted through your institution.</Alert></div>
              )}
              {(e.identity_status === 'PENDING_APAAR' || e.identity_status === 'MISMATCH') && (
                <p className="text-sm mt-3">
                  To link your APAAR ID yourself, sign in to DigiLocker and confirm this institution under <em>ABC / APAAR → Link institution</em>.
                  <span className="text-muted"> (Not connected in this prototype.)</span>
                </p>
              )}
            </Panel>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 mt-8">
        <Link to="/student/consent" className="panel p-4 no-underline text-ink hover:border-brand">
          <div className="font-bold">Consent and access log</div>
          <p className="text-sm text-muted mt-1">{data.active.length} active consent{data.active.length === 1 ? '' : 's'} · {data.access_log.length} verification{data.access_log.length === 1 ? '' : 's'} so far</p>
        </Link>
        <Link to="/student/share" className="panel p-4 no-underline text-ink hover:border-brand">
          <div className="font-bold">Share my record</div>
          <p className="text-sm text-muted mt-1">Create a signed link and QR code for an employer or university.</p>
        </Link>
      </div>
    </>
  );
}
