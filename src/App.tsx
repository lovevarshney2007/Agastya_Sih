import { useEffect, type ReactNode } from 'react';
import { Layout } from './components/Layout';
import { Alert } from './components/ui';
import { Link, matchPath, RouterProvider, useRouter } from './lib/router';
import { portalHome, SessionProvider, useSession, type Portal } from './lib/session';
import { Home } from './pages/Home';
import { SignIn } from './pages/SignIn';
import { Activate } from './pages/Activate';
import { PublicVerify } from './pages/PublicVerify';
import { InstitutionDashboard } from './pages/institution/Dashboard';
import { UploadWizard } from './pages/institution/Upload';
import { BatchList } from './pages/institution/Batches';
import { BatchDetail } from './pages/institution/BatchDetail';
import { Registry } from './pages/institution/Registry';
import { Compliance } from './pages/institution/Compliance';
import { NationalOverview } from './pages/aicte/Overview';
import { Cases } from './pages/aicte/Cases';
import { CaseDetailPage } from './pages/aicte/CaseDetail';
import { RiskRankingPage } from './pages/aicte/Risk';
import { MLIntelligencePage } from './pages/aicte/MLIntelligence';
import { Institutions } from './pages/aicte/Institutions';
import { InstitutionProfile } from './pages/aicte/InstitutionProfile';
import { AuditLedgerPage } from './pages/aicte/Audit';
import { VerifierHome } from './pages/verifier/Home';
import { VerificationResult } from './pages/verifier/Result';
import { StudentHome } from './pages/student/Home';
import { ConsentCentre } from './pages/student/Consent';
import { ShareRecord } from './pages/student/Share';
import { GuardianConsent } from './pages/student/GuardianConsent';
import { DataRights } from './pages/student/DataRights';
import { RulesConfig } from './pages/aicte/RulesConfig';
import { VerifierApprovals } from './pages/aicte/VerifierApprovals';
import { SecuritySandboxPage } from './pages/aicte/SecuritySandbox';
import { DualKeyApprovalsPage } from './pages/aicte/DualKeyApprovals';
import { PublicDashboard } from './pages/PublicDashboard';
import { I18nProvider } from './lib/i18n';

interface Route {
  pattern: string;
  portal?: Portal;
  wide?: boolean;
  full?: boolean;
  render: (params: Record<string, string>) => ReactNode;
}

const ROUTES: Route[] = [
  { pattern: '/', render: () => <Home />, full: true },
  { pattern: '/public-dashboard', render: () => <PublicDashboard />, full: true },
  { pattern: '/sign-in', render: () => <SignIn /> },
  { pattern: '/activate', render: () => <Activate /> },
  { pattern: '/verify', render: () => <PublicVerify /> },
  { pattern: '/verify/:token', render: (p) => <PublicVerify token={p.token} /> },

  { pattern: '/institution', portal: 'institution', wide: true, render: () => <InstitutionDashboard /> },
  { pattern: '/institution/upload', portal: 'institution', wide: true, render: () => <UploadWizard /> },
  { pattern: '/institution/batches', portal: 'institution', wide: true, render: () => <BatchList /> },
  { pattern: '/institution/batches/:id', portal: 'institution', wide: true, render: (p) => <BatchDetail batchId={p.id} /> },
  { pattern: '/institution/registry', portal: 'institution', wide: true, render: () => <Registry /> },
  { pattern: '/institution/compliance', portal: 'institution', wide: true, render: () => <Compliance /> },

  { pattern: '/aicte', portal: 'aicte', wide: true, render: () => <NationalOverview /> },
  { pattern: '/aicte/cases', portal: 'aicte', wide: true, render: () => <Cases /> },
  { pattern: '/aicte/cases/:id', portal: 'aicte', wide: true, render: (p) => <CaseDetailPage caseId={p.id} /> },
  { pattern: '/aicte/risk', portal: 'aicte', wide: true, render: () => <RiskRankingPage /> },
  { pattern: '/aicte/ml-intelligence', portal: 'aicte', wide: true, render: () => <MLIntelligencePage /> },
  { pattern: '/aicte/institutions', portal: 'aicte', wide: true, render: () => <Institutions /> },
  { pattern: '/aicte/institutions/:id', portal: 'aicte', wide: true, render: (p) => <InstitutionProfile institutionId={p.id} /> },
  { pattern: '/aicte/rules', portal: 'aicte', wide: true, render: () => <RulesConfig /> },
  { pattern: '/aicte/verifier-approvals', portal: 'aicte', wide: true, render: () => <VerifierApprovals /> },
  { pattern: '/aicte/audit', portal: 'aicte', wide: true, render: () => <AuditLedgerPage /> },
  { pattern: '/aicte/security-sandbox', portal: 'aicte', wide: true, render: () => <SecuritySandboxPage /> },
  { pattern: '/aicte/dual-approvals', portal: 'aicte', wide: true, render: () => <DualKeyApprovalsPage /> },

  { pattern: '/verifier', portal: 'verifier', wide: true, render: () => <VerifierHome /> },
  { pattern: '/verifier/requests/:token', portal: 'verifier', render: (p) => <VerificationResult token={p.token} /> },

  { pattern: '/student', portal: 'student', render: () => <StudentHome /> },
  { pattern: '/student/consent', portal: 'student', render: () => <ConsentCentre /> },
  { pattern: '/student/share', portal: 'student', render: () => <ShareRecord /> },
  { pattern: '/student/guardian', portal: 'student', render: () => <GuardianConsent /> },
  { pattern: '/student/rights', portal: 'student', render: () => <DataRights /> },
];

function RedirectTo({ to }: { to: string }) {
  const { navigate } = useRouter();
  useEffect(() => { navigate(to, { replace: true }); }, [navigate, to]);
  return null;
}

function Routes() {
  const { path, search } = useRouter();
  const { user, portal } = useSession();

  // Keep links from older builds working.
  if (path === '/verify/public' || path.startsWith('/verify/public/')) {
    return <RedirectTo to={path.replace('/verify/public', '/verify')} />;
  }

  for (const route of ROUTES) {
    const params = matchPath(route.pattern, path);
    if (!params) continue;

    if (route.portal) {
      if (!user) {
        const next = encodeURIComponent(path + (search.toString() ? `?${search}` : ''));
        return <RedirectTo to={`/sign-in?next=${next}`} />;
      }
      if (portal !== route.portal) {
        return (
          <Layout>
            <Alert tone="warn" title="You do not have access to this page">
              Your account is signed in to a different portal.{' '}
              <Link to={portalHome(portal)}>Go to your portal</Link>.
            </Alert>
          </Layout>
        );
      }
    }
    return <Layout wide={route.wide} full={route.full}>{route.render(params)}</Layout>;
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-muted">The address may be mistyped, or the page may have moved.</p>
      <Link to={user ? portalHome(portal) : '/'} className="inline-block py-1.5">Go to the start page</Link>
    </Layout>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <RouterProvider>
        <SessionProvider>
          <Routes />
        </SessionProvider>
      </RouterProvider>
    </I18nProvider>
  );
}
