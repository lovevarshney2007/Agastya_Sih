import type { Severity } from '../../api/types';

export interface SanctionedIntakeRules {
  course: string;
  approved_intake: number;
  supernumerary_cap_pct: number; // e.g., 15% (EWS 10% + PMSSS 5%)
  lateral_entry_cap_pct: number;  // 10% of approved intake
  max_allowed_intake: number;
}

export type IntakeComplianceGrade = 'GRADE_A_COMPLIANT' | 'GRADE_B_WARNING' | 'GRADE_C_BREACH';

export interface ProgramIntakeEvaluation {
  program_id: string;
  course: string;
  approved_intake: number;
  enrolled: number;
  supernumerary: number;
  lateral: number;
  held: number;
  total_admitted: number;
  over_intake_count: number;
  utilization_pct: number;
  grade: IntakeComplianceGrade;
  flags: {
    rule_id: string;
    severity: Severity;
    message: string;
  }[];
}
