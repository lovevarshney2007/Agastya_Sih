import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PublicLandingPage } from './components/PublicLandingPage';
import { AuthenticatedDashboardHome } from './components/AuthenticatedDashboardHome';
import { LoginPage } from './components/LoginPage';
import { AnalyticsView } from './components/AnalyticsView';
import { ComplianceView } from './components/ComplianceView';
import { DocumentationView } from './components/DocumentationView';
import { InstitutionPortal } from './components/InstitutionPortal';
import { AictePortal } from './components/AictePortal';
import { SuperAdminPortal } from './components/SuperAdminPortal';
import { VerifierPortal } from './components/VerifierPortal';
import { StudentPortal } from './components/StudentPortal';
import { PublicVerify } from './components/PublicVerify';
import { ArchitectureMap } from './components/ArchitectureMap';
import { Footer } from './components/Footer';
import { UserRole, MainNavPage, StudentRecord, Institution, UploadBatch, ViolationCase, AuditLog } from './types';
import { Language } from './data/translations';
import { 
  INITIAL_INSTITUTIONS, 
  INITIAL_STUDENTS, 
  INITIAL_BATCHES, 
  INITIAL_VIOLATIONS, 
  INITIAL_AUDIT_LOGS 
} from './data/mockData';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('INSTITUTION');
  const [activeNavPage, setActiveNavPage] = useState<MainNavPage>('HOME');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  
  // Real Hindi <-> English Language State
  const [language, setLanguage] = useState<Language>('HI');

  // Option A: Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);

  const [institutions, setInstitutions] = useState<Institution[]>(INITIAL_INSTITUTIONS);
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [batches, setBatches] = useState<UploadBatch[]>(INITIAL_BATCHES);
  const [violations, setViolations] = useState<ViolationCase[]>(INITIAL_VIOLATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Toggle Theme handler
  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Toggle Language handler
  const handleToggleLanguage = () => {
    setLanguage(prev => prev === 'HI' ? 'EN' : 'HI');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0b1120';
      document.body.style.color = '#f8fafc';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    }
  }, [theme]);

  // Login handler
  const handleLoginSuccess = (role: UserRole) => {
    setIsAuthenticated(true);
    setCurrentUserRole(role);
    setCurrentRole(role);
    setActiveNavPage('PORTALS');
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUserRole(null);
    setActiveNavPage('HOME');
  };

  // Handlers
  const handleUploadCsv = (file: File) => {
    const newBatchId = `BATCH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    
    const newBatch: UploadBatch = {
      id: newBatchId,
      filename: file.name,
      uploadDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
      academicYear: '2025-26',
      program: 'B.Tech Engineering (All Branches)',
      totalRows: 60,
      acceptedRows: 57,
      warningRows: 2,
      rejectedRows: 1,
      status: 'COMPLETED',
      issues: [
        {
          id: `iss-${Date.now()}-1`,
          rowNumber: 14,
          studentName: 'Harsh Vardhan',
          apaarId: '883920194012',
          field: 'seatCategory',
          ruleCode: 'WARN_SUPERNUMERARY_QUOTA',
          severity: 'WARNING',
          explanation: 'Candidate flagged under NRI/FN supernumerary quota; documentation pending.',
          suggestedCorrection: 'Verify passport/overseas residency certificate before final freeze.',
          status: 'OPEN'
        },
        {
          id: `iss-${Date.now()}-2`,
          rowNumber: 29,
          studentName: 'Ishaan Malhotra',
          apaarId: '992019',
          field: 'apaarId',
          ruleCode: 'VAL_ERR_LEN_12',
          severity: 'REJECT',
          explanation: 'APAAR ID format validation failed: Expected 12 numeric digits (Provided: 6).',
          suggestedCorrection: 'Request student to provide authentic 12-digit APAAR or ABC ID.',
          status: 'OPEN'
        }
      ]
    };

    setBatches([newBatch, ...batches]);

    const newAuditLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: 'registrar@diet.ac.in',
      role: 'INSTITUTION_ADMIN',
      action: 'BATCH_UPLOAD_INGESTED',
      entity: 'UploadBatch',
      entityId: newBatchId,
      prevHash: auditLogs[0]?.hash || '0x000000',
      hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      details: `Ingested ${file.name} for B.Tech AY 2025-26. 57 records accepted, 2 flagged, 1 rejected.`
    };
    setAuditLogs([newAuditLog, ...auditLogs]);
  };

  const handleAddStudent = (newStudent: Partial<StudentRecord>) => {
    const student: StudentRecord = {
      id: `std-${Date.now().toString().slice(-4)}`,
      apaarId: newStudent.apaarId || '999999999999',
      name: newStudent.name || 'New Enrolled Student',
      dob: newStudent.dob || '2005-01-01',
      gender: newStudent.gender || 'M',
      collegeId: newStudent.collegeId || 'inst-1',
      collegeName: newStudent.collegeName || 'Delhi Institute of Engineering & Technology (DIET)',
      program: newStudent.program || 'B.Tech Computer Science',
      branch: newStudent.branch || 'CSE',
      academicYear: newStudent.academicYear || '2025-26',
      seatCategory: newStudent.seatCategory || 'General',
      enrolmentStatus: 'Active',
      verificationStatus: 'Verified',
      duplicateRisk: 'NONE',
      admissionDate: new Date().toISOString().slice(0, 10),
      studentIdNo: newStudent.studentIdNo || `DIET-2025-${Date.now().toString().slice(-3)}`,
      aadhaarStatus: 'Not Stored (Privacy Preserved)',
      consentGranted: true,
      version: 1,
      digitalCredentialId: `AICTE-APAAR-${Date.now().toString().slice(-6)}`
    };

    setStudents([student, ...students]);

    // Update institution enrolled count
    setInstitutions(institutions.map(inst => {
      if (inst.id === student.collegeId) {
        return {
          ...inst,
          currentEnrolment: inst.currentEnrolment + 1
        };
      }
      return inst;
    }));

    const newAuditLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: 'registrar@diet.ac.in',
      role: 'INSTITUTION_ADMIN',
      action: 'SINGLE_STUDENT_ENROLLED',
      entity: 'StudentRecord',
      entityId: student.apaarId,
      prevHash: auditLogs[0]?.hash || '0x000000',
      hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      details: `Enrolled student ${student.name} (${student.program}) with APAAR ${student.apaarId}. Verified via DigiLocker.`
    };
    setAuditLogs([newAuditLog, ...auditLogs]);
  };

  const handleResolveIssue = (issueId: string) => {
    setBatches(batches.map(b => ({
      ...b,
      issues: b.issues.map(iss => iss.id === issueId ? { ...iss, status: 'RESOLVED' as const } : iss)
    })));

    const newAuditLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: 'registrar@diet.ac.in',
      role: 'INSTITUTION_ADMIN',
      action: 'BATCH_ISSUE_REMEDIATED',
      entity: 'ValidationIssue',
      entityId: issueId,
      prevHash: auditLogs[0]?.hash || '0x000000',
      hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      details: `Resolved validation issue ${issueId} with verified supporting documents.`
    };
    setAuditLogs([newAuditLog, ...auditLogs]);
  };

  const handleResolveViolation = (violationId: string) => {
    setViolations(violations.map(v => v.id === violationId ? { ...v, status: 'RESOLVED' as const } : v));

    const newAuditLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: 'dr.skmurthy@aicte-india.org',
      role: 'AICTE_OFFICER',
      action: 'VIOLATION_CASE_RESOLVED',
      entity: 'ViolationCase',
      entityId: violationId,
      prevHash: auditLogs[0]?.hash || '0x000000',
      hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      details: `Closed violation case ${violationId} following institutional representation and withdrawal confirmation.`
    };
    setAuditLogs([newAuditLog, ...auditLogs]);
  };

  const handleToggleConsent = (studentId: string) => {
    setStudents(students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          consentGranted: !s.consentGranted
        };
      }
      return s;
    }));

    const student = students.find(s => s.id === studentId);

    const newAuditLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: `student:${student?.apaarId || studentId}`,
      role: 'STUDENT',
      action: 'CONSENT_STATE_TOGGLED',
      entity: 'StudentRecord',
      entityId: studentId,
      prevHash: auditLogs[0]?.hash || '0x000000',
      hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      details: `Student toggled sovereign third-party verification consent to ${!student?.consentGranted}.`
    };
    setAuditLogs([newAuditLog, ...auditLogs]);
  };

  const handleLogVerification = (apaarId: string, verifierName: string, status: string) => {
    const newAuditLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: verifierName,
      role: 'AUTHORIZED_VERIFIER',
      action: 'BACKGROUND_RECORD_VERIFIED',
      entity: 'StudentRecord',
      entityId: apaarId,
      prevHash: auditLogs[0]?.hash || '0x000000',
      hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      details: `Verifier ${verifierName} queried record for APAAR ${apaarId}. Status: ${status}.`
    };
    setAuditLogs([newAuditLog, ...auditLogs]);
  };

  const handleAddInstitution = (newInst: Partial<Institution>) => {
    const institution: Institution = {
      id: `inst-${Date.now().toString().slice(-4)}`,
      aicteCode: newInst.aicteCode || `1-${Math.floor(10000000 + Math.random() * 90000000)}`,
      name: newInst.name || 'New Technical Institute',
      state: newInst.state || 'Delhi',
      district: newInst.district || 'New Delhi',
      type: (newInst.type as any) || 'Affiliated',
      approvedIntake: newInst.approvedIntake || 300,
      currentEnrolment: 0,
      supernumeraryQuota: Math.round((newInst.approvedIntake || 300) * 0.1),
      supernumeraryUsed: 0,
      complianceStatus: 'Compliant',
      pendingViolations: 0,
      contactEmail: newInst.contactEmail || 'admin@college.ac.in'
    };

    setInstitutions([...institutions, institution]);

    const newAuditLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: 'superadmin@aicte-india.org',
      role: 'AICTE_SUPER_ADMIN',
      action: 'INSTITUTION_REGISTERED',
      entity: 'Institution',
      entityId: institution.aicteCode,
      prevHash: auditLogs[0]?.hash || '0x000000',
      hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      details: `Provisioned institution ${institution.name} (Code: ${institution.aicteCode}) with intake capacity ${institution.approvedIntake}.`
    };
    setAuditLogs([newAuditLog, ...auditLogs]);
  };

  const openViolationsCount = violations.filter(v => v.status === 'OPEN').length;

  return (
    <div className="min-h-screen flex flex-col transition-colors dark:bg-[#0b1120] bg-[#f8fafc] text-slate-900 dark:text-slate-100 font-sans">
      {/* Official Government Tri-Color & Navigation Ribbon */}
      <Navbar 
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        activeNavPage={activeNavPage}
        onSelectNavPage={setActiveNavPage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        openViolationsCount={openViolationsCount}
        isAuthenticated={isAuthenticated}
        currentUserRole={currentUserRole}
        onLogout={handleLogout}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Website Container */}
      <main className={`flex-1 w-full ${activeNavPage === 'HOME' && !isAuthenticated ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'}`}>
        {/* VIEW 1: HOME PAGE (Public Landing Page OR Role-Based Dashboard) */}
        {activeNavPage === 'HOME' && (
          isAuthenticated && currentUserRole ? (
            <AuthenticatedDashboardHome
              currentUserRole={currentUserRole}
              onSelectRole={setCurrentRole}
              onSelectNavPage={setActiveNavPage}
              students={students}
              institutions={institutions}
              batches={batches}
              violations={violations}
              auditLogs={auditLogs}
              theme={theme}
              language={language}
              onLogout={handleLogout}
            />
          ) : (
            <PublicLandingPage 
              onSelectRole={(role) => {
                setCurrentRole(role);
                setActiveNavPage('LOGIN');
              }}
              onSelectNavPage={setActiveNavPage}
              students={students}
              theme={theme}
              language={language}
            />
          )
        )}

        {/* VIEW 2: LOGIN PAGE */}
        {activeNavPage === 'LOGIN' && (
          <LoginPage 
            initialRole={currentRole}
            onLoginSuccess={handleLoginSuccess}
            theme={theme}
          />
        )}

        {/* VIEW 3: PORTALS */}
        {activeNavPage === 'PORTALS' && (
          <div>
            {currentRole === 'INSTITUTION' && (
              <InstitutionPortal 
                students={students}
                institutions={institutions}
                batches={batches}
                onUploadCsv={handleUploadCsv}
                onAddStudent={handleAddStudent}
                onResolveIssue={handleResolveIssue}
              />
            )}

            {currentRole === 'AICTE_OFFICER' && (
              <AictePortal 
                institutions={institutions}
                students={students}
                violations={violations}
                onResolveViolation={handleResolveViolation}
              />
            )}

            {currentRole === 'AICTE_SUPER_ADMIN' && (
              <SuperAdminPortal 
                institutions={institutions}
                auditLogs={auditLogs}
                onAddInstitution={handleAddInstitution}
              />
            )}

            {currentRole === 'VERIFIER' && (
              <VerifierPortal 
                students={students}
                onLogVerification={handleLogVerification}
              />
            )}

            {currentRole === 'STUDENT' && (
              <StudentPortal 
                students={students}
                onToggleConsent={handleToggleConsent}
              />
            )}

            {currentRole === 'PUBLIC_VERIFY' && (
              <PublicVerify 
                students={students}
              />
            )}

            {currentRole === 'ARCHITECTURE_MAP' && (
              <ArchitectureMap />
            )}
          </div>
        )}

        {/* VIEW 4: NATIONAL ANALYTICS */}
        {activeNavPage === 'ANALYTICS' && (
          <AnalyticsView 
            institutions={institutions}
            students={students}
            violations={violations}
            theme={theme}
          />
        )}

        {/* VIEW 5: COMPLIANCE STANDARDS */}
        {activeNavPage === 'COMPLIANCE_STANDARDS' && (
          <ComplianceView 
            theme={theme}
          />
        )}

        {/* VIEW 6: DOCUMENTATION */}
        {activeNavPage === 'DOCUMENTATION' && (
          <DocumentationView 
            theme={theme}
          />
        )}
      </main>

      {/* Website Official Footer */}
      <Footer
        onSelectNavPage={setActiveNavPage}
        onSelectRole={setCurrentRole}
        theme={theme}
        language={language}
      />
    </div>
  );
}

export default App;
