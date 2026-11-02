import type { Severity } from '../../api/types';

/**
 * Strict Discriminated Union for AICTE Regulatory Ledger States.
 * Enables exhaustive pattern matching and eliminates ambiguous string flags.
 */
export type RegulatoryLedgerState =
  | 'ACCEPTED'
  | 'HELD_FOR_REVIEW'
  | 'FLAGGED_DUPLICATE'
  | 'REJECTED';

export interface AcceptedRecordState {
  state: 'ACCEPTED';
  enrolmentId: string;
  apaarId: string;
  institutionId: string;
  courseCode: string;
  academicYear: number;
  committedAt: string;
  merkleLeafHash: string;
  attestationOfficer: string;
}

export interface HeldForReviewRecordState {
  state: 'HELD_FOR_REVIEW';
  enrolmentId: string;
  apaarId: string;
  institutionId: string;
  courseCode: string;
  academicYear: number;
  breachRuleId: string;
  heldReason: string;
  isSupernumeraryQuotaBreach: boolean;
  reviewDeadline: string;
}

export interface FlaggedDuplicateRecordState {
  state: 'FLAGGED_DUPLICATE';
  enrolmentId: string;
  apaarId: string;
  conflictingInstitutions: string[];
  conflictType: 'CONCURRENT_FULLTIME_ENROLMENT' | 'DUPLICATE_REGISTRATION_ACROSS_STATES';
  caseId: string;
  interceptedAt: string;
  severity: Severity;
}

export interface RejectedRecordState {
  state: 'REJECTED';
  enrolmentId: string;
  apaarId: string;
  institutionId: string;
  rejectionCode:
    | 'SANCTIONED_SEAT_CAP_EXCEEDED'
    | 'INELIGIBLE_LATERAL_ENTRY'
    | 'UNAPPROVED_PROGRAM_OFFERING'
    | 'FRAUDULENT_CREDENTIAL';
  rejectionDetail: string;
  sanctionIssuedAt: string;
}

export type StrictLedgerRecord =
  | AcceptedRecordState
  | HeldForReviewRecordState
  | FlaggedDuplicateRecordState
  | RejectedRecordState;

export interface DualKeySanctionWorkflow {
  sanctionId: string;
  institutionId: string;
  institutionName: string;
  clause: string;
  proposedPenalty: string;
  makerAttestation: {
    officerName: string;
    officerId: string;
    cryptoHash: string;
    signedAt: string;
  };
  checkerAttestation?: {
    officerName: string;
    officerId: string;
    cryptoHash: string;
    counterSignedAt: string;
    jointSeal: string;
    note?: string;
  };
  status: 'PENDING_CHECKER_SIGNATURE' | 'EXECUTED_DUAL_SIGNED' | 'REJECTED';
}
