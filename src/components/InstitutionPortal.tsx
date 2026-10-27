import React, { useState } from 'react';
import { 
  Building2, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  PlusCircle, 
  Download, 
  Building,
  UserCheck,
  AlertOctagon
} from 'lucide-react';
import { StudentRecord, Institution, UploadBatch } from '../types';

interface InstitutionPortalProps {
  students: StudentRecord[];
  institutions: Institution[];
  batches: UploadBatch[];
  onUploadCsv: (file: File) => void;
  onAddStudent: (newStudent: Partial<StudentRecord>) => void;
  onResolveIssue: (issueId: string) => void;
}

export const InstitutionPortal: React.FC<InstitutionPortalProps> = ({
  students,
  institutions,
  batches,
  onUploadCsv,
  onAddStudent,
  onResolveIssue
}) => {
  const [selectedInstId, setSelectedInstId] = useState<string>('inst-1');
  const [activeTab, setActiveTab] = useState<'REGISTRY' | 'UPLOAD_WIZARD' | 'VALIDATION_REPORTS' | 'COMPLIANCE'>('REGISTRY');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Student Form State
  const [formData, setFormData] = useState({
    name: '',
    apaarId: '',
    dob: '',
    gender: 'M',
    program: 'B.Tech Computer Science & Engineering',
    branch: 'CSE',
    studentIdNo: '',
    seatCategory: 'General',
  });

  const currentInstitution = institutions.find(i => i.id === selectedInstId) || institutions[0];
  const institutionStudents = students.filter(s => s.collegeId === currentInstitution.id);

  const filteredStudents = institutionStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.apaarId.includes(searchQuery) || 
                          s.studentIdNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = filterBranch === 'ALL' || s.branch === filterBranch;
    return matchesSearch && matchesBranch;
  });

  const totalEnrolled = institutionStudents.length;
  const verifiedCount = institutionStudents.filter(s => s.verificationStatus === 'Verified').length;
  const flaggedCount = institutionStudents.filter(s => s.verificationStatus === 'Flagged').length;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadCsv(e.dataTransfer.files[0]);
      setActiveTab('VALIDATION_REPORTS');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCsv(e.target.files[0]);
      setActiveTab('VALIDATION_REPORTS');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStudent({
      name: formData.name,
      apaarId: formData.apaarId,
      dob: formData.dob,
      gender: formData.gender as 'M' | 'F' | 'O',
      collegeId: currentInstitution.id,
      collegeName: currentInstitution.name,
      program: formData.program,
      branch: formData.branch,
      academicYear: '2025-26',
      seatCategory: formData.seatCategory as any,
      enrolmentStatus: 'Active',
      verificationStatus: formData.apaarId.length === 12 ? 'Verified' : 'Flagged',
      duplicateRisk: 'NONE',
      admissionDate: new Date().toISOString().split('T')[0],
      studentIdNo: formData.studentIdNo,
      aadhaarStatus: 'Not Stored (Privacy Preserved)',
      consentGranted: true,
      version: 1
    });
    setShowAddModal(false);
    setFormData({
      name: '',
      apaarId: '',
      dob: '',
      gender: 'M',
      program: 'B.Tech Computer Science & Engineering',
      branch: 'CSE',
      studentIdNo: '',
      seatCategory: 'General',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="p-6 rounded-2xl border transition-all dark:bg-slate-900/90 dark:border-slate-800 bg-white border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 text-xs font-mono font-bold mb-1">
            <Building className="w-4 h-4" />
            <span>AICTE CODE: {currentInstitution.aicteCode}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 dark:text-slate-400">{currentInstitution.type} College</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{currentInstitution.name}</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            State: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentInstitution.state}</span> | District: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentInstitution.district}</span> | Official Email: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentInstitution.contactEmail}</span>
          </p>
        </div>

        {/* Institution Switcher */}
        <div className="flex items-center space-x-3 dark:bg-slate-800 bg-slate-50 p-2 rounded-xl border dark:border-slate-700 border-slate-200">
          <label className="text-xs text-slate-600 dark:text-slate-400 font-bold">Switch College:</label>
          <select 
            value={selectedInstId} 
            onChange={(e) => setSelectedInstId(e.target.value)}
            className="dark:bg-slate-900 bg-white dark:text-white text-slate-900 text-xs font-medium rounded-lg px-3 py-1.5 border dark:border-slate-600 border-slate-300 focus:outline-none"
          >
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>
                {inst.name} ({inst.complianceStatus})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dark:bg-slate-900/90 bg-white p-5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Intake</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{currentInstitution.approvedIntake} <span className="text-xs text-slate-500 font-normal">seats</span></p>
            <div className="mt-2 text-xs text-blue-700 dark:text-blue-400 font-mono font-bold">
              Enrolled: {totalEnrolled} / {currentInstitution.approvedIntake}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-400">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="dark:bg-slate-900/90 bg-white p-5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">APAAR Verified</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{verifiedCount}</p>
            <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>12-digit checks PASS</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="dark:bg-slate-900/90 bg-white p-5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duplicate / Flagged</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{flaggedCount}</p>
            <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 flex items-center space-x-1 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Multi-college dual check</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="dark:bg-slate-900/90 bg-white p-5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compliance Status</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md font-mono ${
                currentInstitution.complianceStatus === 'Compliant'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : currentInstitution.complianceStatus === 'Warning'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}>
                {currentInstitution.complianceStatus.toUpperCase()}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
              NRI/Supernumerary: {currentInstitution.supernumeraryUsed}/{currentInstitution.supernumeraryQuota}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b dark:border-slate-800 border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('REGISTRY')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'REGISTRY'
              ? 'bg-blue-700 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          Student Registry ({filteredStudents.length})
        </button>
        <button
          onClick={() => setActiveTab('UPLOAD_WIZARD')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
            activeTab === 'UPLOAD_WIZARD'
              ? 'bg-blue-700 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Wizard (CSV/XLSX)</span>
        </button>
        <button
          onClick={() => setActiveTab('VALIDATION_REPORTS')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
            activeTab === 'VALIDATION_REPORTS'
              ? 'bg-blue-700 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Batch Validation Reports ({batches[0]?.issues.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('COMPLIANCE')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'COMPLIANCE'
              ? 'bg-blue-700 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          Intake & Quota Compliance
        </button>
      </div>

      {/* TAB 1: STUDENT REGISTRY */}
      {activeTab === 'REGISTRY' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 dark:bg-slate-900 bg-white p-4 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by APAAR ID, Student Name, Roll No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="dark:bg-slate-800 bg-white border dark:border-slate-700 border-slate-300 text-xs font-semibold dark:text-slate-300 text-slate-700 rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="ALL">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="AI-DS">AI-DS</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
              </select>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Single Student Entry</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="dark:bg-slate-950 bg-slate-50 border-b dark:border-slate-800 border-slate-200 text-slate-600 dark:text-slate-400 font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-bold">Student & ID</th>
                  <th className="py-3 px-4 font-bold">12-Digit APAAR ID</th>
                  <th className="py-3 px-4 font-bold">Program / Branch</th>
                  <th className="py-3 px-4 font-bold">Quota / Category</th>
                  <th className="py-3 px-4 font-bold">Verification State</th>
                  <th className="py-3 px-4 font-bold">Duplicate Integrity</th>
                  <th className="py-3 px-4 font-bold text-right">Version</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800 divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                      No student records match the active criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{student.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{student.studentIdNo} • DOB: {student.dob}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md dark:bg-slate-800 bg-blue-50 border dark:border-slate-700 border-blue-200 text-blue-700 dark:text-blue-300 font-mono font-bold">
                          <span>{student.apaarId.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 dark:text-slate-200 font-semibold">{student.branch}</div>
                        <div className="text-[10px] text-slate-500">{student.academicYear}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium dark:bg-slate-800 bg-slate-100 text-slate-700 dark:text-slate-300 border dark:border-slate-700 border-slate-200">
                          {student.seatCategory}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          student.verificationStatus === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : student.verificationStatus === 'Pending'
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}>
                          {student.verificationStatus === 'Verified' && <CheckCircle2 className="w-3 h-3" />}
                          {student.verificationStatus === 'Flagged' && <AlertTriangle className="w-3 h-3" />}
                          <span>{student.verificationStatus}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {student.duplicateRisk === 'CROSS_INSTITUTION' ? (
                          <div className="text-rose-600 dark:text-rose-400 flex items-start space-x-1">
                            <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-bold">Dual-College Enrolment</span>
                              <p className="text-[10px] text-rose-500/80">{student.crossCollegeDetails}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Unique Active</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[11px] text-blue-700 dark:text-blue-400 font-mono font-bold">v{student.version}.0</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD WIZARD */}
      {activeTab === 'UPLOAD_WIZARD' && (
        <div className="space-y-6">
          <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Step-by-Step Batch Ingestion Pipeline</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
              Download the official AICTE APAAR template, verify columns, and submit. The backend pipeline runs 12-digit format check, APAAR Adapter mock validation, intake quota limit checks, and cross-institution duplicate matching.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">Download Template</h4>
                  <p className="text-xs text-slate-500 mt-1">Get pre-formatted CSV/XLSX with exact required schema headers.</p>
                  <button 
                    onClick={() => {
                      const csvContent = "data:text/csv;charset=utf-8,apaarId,name,dob,gender,program,branch,seatCategory,studentIdNo\n892019482019,Aarav Sharma,2004-05-14,M,B.Tech CSE,CSE,General,2025-CSE-042\n472910482910,Ananya Deshmukh,2004-11-20,F,B.Tech AI-DS,AI-DS,OBC,MIT-25-AI-014";
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", "AICTE_APAAR_Upload_Template.csv");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold border dark:border-slate-700 border-slate-300 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV Template</span>
                  </button>
                </div>
              </div>

              <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">Verify Intake Details</h4>
                  <p className="text-xs text-slate-500 mt-1">Academic Year 2025-26. Approved capacity check active.</p>
                  <div className="mt-3 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded border dark:border-slate-800 border-slate-200">
                    Max Intake: {currentInstitution.approvedIntake} seats
                  </div>
                </div>
              </div>

              <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">Zero-Aadhaar Pipeline</h4>
                  <p className="text-xs text-slate-500 mt-1">Row-by-row parsing, duplicate check, and tamper-proof hashing.</p>
                  <div className="mt-3 text-xs text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                    Zero-Aadhaar • Tamper-proof
                  </div>
                </div>
              </div>
            </div>

            {/* Drag & Drop File Zone */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed dark:border-slate-700 border-blue-300 dark:hover:border-blue-500 hover:border-blue-600 dark:bg-slate-950/60 bg-blue-50/40 rounded-2xl p-8 text-center transition-all cursor-pointer group"
            >
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".csv, .xlsx"
                onChange={handleFileInput}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Click to upload or drag & drop CSV / Excel file</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Supported formats: CSV, XLSX (Up to 10MB per batch). Automated background queue processes batches up to 50,000 rows.
                </p>
                <div className="mt-4 px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-mono font-bold">
                  Upload triggers automatic row validation report
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VALIDATION REPORTS */}
      {activeTab === 'VALIDATION_REPORTS' && (
        <div className="space-y-6">
          {batches.map((batch) => (
            <div key={batch.id} className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b dark:border-slate-800 border-slate-200 gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-mono text-blue-700 dark:text-blue-400 font-bold">
                    <span>BATCH ID: {batch.id}</span>
                    <span>•</span>
                    <span>{batch.uploadDate}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{batch.filename}</h3>
                  <p className="text-xs text-slate-500">{batch.program} ({batch.academicYear})</p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-center px-3 py-1.5 dark:bg-slate-950 bg-slate-100 rounded-lg border dark:border-slate-800 border-slate-200">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Total</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{batch.totalRows}</span>
                  </div>
                  <div className="text-center px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block uppercase font-bold">Accepted</span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">{batch.acceptedRows}</span>
                  </div>
                  <div className="text-center px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800/40">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 block uppercase font-bold">Warnings</span>
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400 font-mono">{batch.warningRows}</span>
                  </div>
                  <div className="text-center px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800/40">
                    <span className="text-[10px] text-rose-700 dark:text-rose-400 block uppercase font-bold">Rejected</span>
                    <span className="text-sm font-bold text-rose-700 dark:text-rose-400 font-mono">{batch.rejectedRows}</span>
                  </div>
                </div>
              </div>

              {/* Row-Level Errors */}
              <div className="mt-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 font-bold">
                  Detailed Row-Level Rule Engine Inspection
                </h4>
                <div className="space-y-3">
                  {batch.issues.map((issue) => (
                    <div 
                      key={issue.id}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        issue.severity === 'REJECT'
                          ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
                          : issue.severity === 'CRITICAL'
                          ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
                          : 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            issue.severity === 'REJECT'
                              ? 'bg-rose-700 text-white'
                              : issue.severity === 'CRITICAL'
                              ? 'bg-amber-600 text-white'
                              : 'bg-blue-700 text-white'
                          }`}>
                            {issue.severity}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Row #{issue.rowNumber}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{issue.studentName}</span>
                          {issue.apaarId && (
                            <span className="text-xs font-mono text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded font-bold">
                              {issue.apaarId}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{issue.explanation}</p>
                        <p className="text-xs text-slate-500 italic">
                          Suggested Action: <span className="text-blue-700 dark:text-blue-400 not-italic font-semibold">{issue.suggestedCorrection}</span>
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center space-x-2">
                        {issue.status === 'RESOLVED' ? (
                          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs font-mono font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Resolved</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => onResolveIssue(issue.id)}
                            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 text-blue-700 dark:text-blue-300 border dark:border-slate-700 border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            Mark Corrected
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: COMPLIANCE PANEL */}
      {activeTab === 'COMPLIANCE' && (
        <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AICTE Approval Process Handbook (APH) Compliance Monitor</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Real-time monitoring of seat caps, NRI/FN quotas, supernumerary allowances, and duplicate-free enrolments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="dark:bg-slate-950 bg-slate-50 p-5 rounded-xl border dark:border-slate-800 border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center justify-between">
                <span>Sanctioned Capacity Utilization</span>
                <span className="text-xs font-mono text-blue-700 dark:text-blue-400 font-bold">
                  {Math.round((currentInstitution.currentEnrolment / currentInstitution.approvedIntake) * 100)}%
                </span>
              </h4>

              <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    currentInstitution.currentEnrolment > currentInstitution.approvedIntake 
                      ? 'bg-rose-500' 
                      : 'bg-blue-700'
                  }`}
                  style={{ width: `${Math.min(100, (currentInstitution.currentEnrolment / currentInstitution.approvedIntake) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-mono font-semibold">
                <span>Current: {currentInstitution.currentEnrolment} Students</span>
                <span>Max Sanctioned: {currentInstitution.approvedIntake}</span>
              </div>
            </div>

            <div className="dark:bg-slate-950 bg-slate-50 p-5 rounded-xl border dark:border-slate-800 border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center justify-between">
                <span>Supernumerary (NRI/OCI/FN) Quota</span>
                <span className="text-xs font-mono text-indigo-700 dark:text-indigo-400 font-bold">
                  {currentInstitution.supernumeraryUsed} / {currentInstitution.supernumeraryQuota}
                </span>
              </h4>

              <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600"
                  style={{ width: `${(currentInstitution.supernumeraryUsed / currentInstitution.supernumeraryQuota) * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-mono font-semibold">
                <span>Utilized: {currentInstitution.supernumeraryUsed} seats</span>
                <span>Max Allowed (10% cap): {currentInstitution.supernumeraryQuota}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE STUDENT ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Individual Student Enrolment</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">Full Legal Name</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Priyanshu Sharma"
                  className="w-full dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg px-3 py-2 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-blue-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">12-Digit APAAR ID</label>
                  <input 
                    type="text"
                    required
                    maxLength={12}
                    value={formData.apaarId}
                    onChange={(e) => setFormData({...formData, apaarId: e.target.value})}
                    placeholder="12 digits"
                    className="w-full dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg px-3 py-2 text-xs dark:text-white text-slate-900 font-mono focus:outline-none focus:border-blue-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">Date of Birth</label>
                  <input 
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    className="w-full dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg px-3 py-2 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-blue-700 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">College Roll / Reg No.</label>
                  <input 
                    type="text"
                    required
                    value={formData.studentIdNo}
                    onChange={(e) => setFormData({...formData, studentIdNo: e.target.value})}
                    placeholder="e.g. 2025-CSE-091"
                    className="w-full dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg px-3 py-2 text-xs dark:text-white text-slate-900 font-mono focus:outline-none focus:border-blue-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">Seat Category</label>
                  <select
                    value={formData.seatCategory}
                    onChange={(e) => setFormData({...formData, seatCategory: e.target.value})}
                    className="w-full dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg px-3 py-2 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-blue-700 font-medium"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                    <option value="TFW">TFW</option>
                    <option value="Supernumerary (NRI/FN)">Supernumerary (NRI/FN)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t dark:border-slate-800 border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm"
                >
                  Verify & Store Enrolment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
