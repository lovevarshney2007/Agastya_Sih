import type { ProgrammeRow } from '../../api/types';
import type { IntakeComplianceGrade, ProgramIntakeEvaluation } from './types';

/**
 * Pure business logic for evaluating AICTE Sanctioned Intake Compliance.
 * Conforms to AICTE Approval Process Handbook (APH) regulations:
 * - Supernumerary quota cannot exceed approved cap (EWS 10%, PMSSS, TFWS 5%).
 * - Lateral entry quota capped at 10% of sanctioned intake.
 * - Total regular admissions cannot exceed approved intake.
 */
export function evaluateProgramIntake(row: ProgrammeRow): ProgramIntakeEvaluation {
  const regularEnrolled = Math.max(0, row.enrolled - row.supernumerary);
  const regularExcess = Math.max(0, regularEnrolled - row.approved_intake);
  const supernumeraryExcess = Math.max(0, row.supernumerary - row.supernumerary_cap);
  const lateralExcess = Math.max(0, row.lateral - row.lateral_cap);

  const totalOverIntake = regularExcess + supernumeraryExcess + lateralExcess;

  let grade: IntakeComplianceGrade = 'GRADE_A_COMPLIANT';
  if (totalOverIntake > 0) {
    grade = 'GRADE_C_BREACH';
  } else if (row.utilization_pct >= 95 || row.held > 0) {
    grade = 'GRADE_B_WARNING';
  }

  const flags: ProgramIntakeEvaluation['flags'] = [];

  if (regularExcess > 0) {
    flags.push({
      rule_id: 'RULE_INTAKE_REGULAR_EXCEEDED',
      severity: 'Violation',
      message: `Regular enrolment (${regularEnrolled}) exceeds sanctioned seat intake (${row.approved_intake}) by ${regularExcess} seats.`,
    });
  }

  if (supernumeraryExcess > 0) {
    flags.push({
      rule_id: 'RULE_SUPERNUMERARY_CAP_BREACH',
      severity: 'Violation',
      message: `Supernumerary admissions (${row.supernumerary}) exceed statutory ceiling (${row.supernumerary_cap}).`,
    });
  }

  if (lateralExcess > 0) {
    flags.push({
      rule_id: 'RULE_LATERAL_ENTRY_EXCEEDED',
      severity: 'Warning',
      message: `Lateral entry admissions (${row.lateral}) exceed permissible 10% quota (${row.lateral_cap}).`,
    });
  }

  if (row.held > 0) {
    flags.push({
      rule_id: 'RULE_ENROLMENTS_ON_HOLD',
      severity: 'Review',
      message: `${row.held} candidate enrolment(s) currently held for regulatory verification.`,
    });
  }

  return {
    program_id: row.program_offering_id,
    course: row.course,
    approved_intake: row.approved_intake,
    enrolled: row.enrolled,
    supernumerary: row.supernumerary,
    lateral: row.lateral,
    held: row.held,
    total_admitted: row.enrolled + row.lateral,
    over_intake_count: totalOverIntake,
    utilization_pct: row.utilization_pct,
    grade,
    flags,
  };
}
