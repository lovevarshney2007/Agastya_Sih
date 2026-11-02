/**
 * Pre-configured CSV data payloads for instant Hackathon Jury evaluation.
 * Allows evaluators to test batch validation without manual CSV authoring.
 */

export interface DemoBatch {
  id: 'clean' | 'over_intake' | 'dual_enrolment' | 'aadhaar_leak';
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  filename: string;
  csv: string;
}

export const DEMO_BATCHES: Record<string, DemoBatch> = {
  clean: {
    id: 'clean',
    title: 'Clean Batch (Compliant)',
    badge: '100% Valid',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Adheres to all 14 AICTE Approval Process Handbook (APH) rules with valid APAAR IDs.',
    filename: 'coep_cse_clean_batch_2026.csv',
    csv: `apaar_id,student_id_no,name,dob,course,year_of_study,mode,seat_category,is_supernumerary,nationality
110022334455,COEP-CSE-2026-001,Aarav Sharma,2006-03-15,Computer Science and Engineering,1,FULL_TIME,General,false,Indian
220033445566,COEP-CSE-2026-002,Sneha Deshmukh,2005-11-20,Computer Science and Engineering,1,FULL_TIME,OBC-NCL,false,Indian
330044556677,COEP-CSE-2026-003,Rohan Kulkarni,2006-01-08,Computer Science and Engineering,1,FULL_TIME,EWS,false,Indian
440055667788,COEP-CSE-2026-004,Ananya Iyer,2006-07-22,Computer Science and Engineering,1,FULL_TIME,General,false,Indian
550066778899,COEP-CSE-2026-005,Devansh Patil,2005-09-30,Computer Science and Engineering,1,FULL_TIME,TFW,true,Indian
660077889900,COEP-CSE-2026-006,Meera Joshi,2006-04-12,Computer Science and Engineering,1,FULL_TIME,SC,false,Indian`
  },
  over_intake: {
    id: 'over_intake',
    title: 'Over-Intake Breach Batch',
    badge: 'APH §3.2 Violation',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Attempts to ingest students exceeding the approved institutional ceiling capacity.',
    filename: 'coep_intake_cap_breach.csv',
    csv: `apaar_id,student_id_no,name,dob,course,year_of_study,mode,seat_category,is_supernumerary,nationality
771122334455,COEP-CSE-EXC-121,Kavita Rao,2006-02-14,Computer Science and Engineering,1,FULL_TIME,General,false,Indian
771122334456,COEP-CSE-EXC-122,Varun Mehta,2005-12-05,Computer Science and Engineering,1,FULL_TIME,General,false,Indian
771122334457,COEP-CSE-EXC-123,Ritika Sen,2006-06-18,Computer Science and Engineering,1,FULL_TIME,General,false,Indian
771122334458,COEP-CSE-EXC-124,Aditya Nair,2005-08-25,Computer Science and Engineering,1,FULL_TIME,General,false,Indian`
  },
  dual_enrolment: {
    id: 'dual_enrolment',
    title: 'Cross-Institution Conflict',
    badge: 'Dual Degree Intercept',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Triggers blind-indexed dual full-time enrolment conflict (UGC Simultaneous Degree §3.1).',
    filename: 'coep_vjti_simultaneous_conflict.csv',
    csv: `apaar_id,student_id_no,name,dob,course,year_of_study,mode,seat_category,is_supernumerary,nationality
987654321098,COEP-CSE-DUAL-099,Priya Nair,2005-05-10,Computer Science and Engineering,1,FULL_TIME,General,false,Indian
882233445566,COEP-CSE-DUAL-100,Siddharth Verma,2006-08-19,Computer Science and Engineering,1,FULL_TIME,OBC-NCL,false,Indian`
  },
  aadhaar_leak: {
    id: 'aadhaar_leak',
    title: 'Ghost / Aadhaar Leak Payload',
    badge: 'DPDP Act §6 Prohibited',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Carries prohibited plaintext Aadhaar numbers to demonstrate the client-side DPDP sanitiser.',
    filename: 'illicit_aadhaar_leak_payload.csv',
    csv: `aadhaar_number,apaar_id,student_id_no,name,dob,course,year_of_study,mode,seat_category,is_supernumerary,nationality
453218920192,110022334455,COEP-LEAK-01,Vikram Rathore,2006-03-15,Computer Science and Engineering,1,FULL_TIME,General,false,Indian
789234120984,220033445566,COEP-LEAK-02,Pooja Hegde,2005-11-20,Computer Science and Engineering,1,FULL_TIME,OBC-NCL,false,Indian`
  }
};
