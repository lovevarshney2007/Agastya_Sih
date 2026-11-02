export interface W3CCredentialSubject {
  id: string; // "did:apaar:<12_digit_id>"
  apaarId: string;
  studentName: string;
  institutionName: string;
  aictePermanentId: string;
  programme: string;
  academicYear: string;
  enrolmentStatus: 'ACTIVE' | 'GRADUATED' | 'TRANSFERRED';
  seatCategory: string;
  complianceAttestation: 'SANCTIONED_SEAT_INTAKE_VERIFIED';
}

export interface W3CVerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: {
    id: string;
    name: string;
    official_portal: string;
  };
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: W3CCredentialSubject;
  proof: {
    type: 'JsonWebSignature2020';
    created: string;
    proofPurpose: 'assertionMethod';
    verificationMethod: string;
    jws: string;
  };
}

export interface QrVerificationClaim {
  valid: boolean;
  apaarId: string;
  studentName: string;
  institution: string;
  programme: string;
  merkleLeaf: string;
  verifiedAt: string;
}
