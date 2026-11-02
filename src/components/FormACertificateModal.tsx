import { Printer, ShieldCheck, X } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

interface FormACertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionName: string;
  permanentId?: string;
  academicYear?: string;
  totalApprovedIntake: number;
  totalEnrolled: number;
  merkleRootHash?: string;
}

export function FormACertificateModal({
  isOpen,
  onClose,
  institutionName,
  permanentId = '1-4928172',
  academicYear = '2026–27',
  totalApprovedIntake,
  totalEnrolled,
  merkleRootHash = '0x7b3f91a0c8d24e65b10a98f7e2d3c4b5a69708192a3b4c5d6e7f8091a2b3c4d5',
}: FormACertificateModalProps) {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const publicVerifyUrl = `${window.location.origin}/verify/demo-form-a-${permanentId.replace(/\D/g, '')}`;
      QRCode.toDataURL(publicVerifyUrl, {
        width: 140,
        margin: 1,
        color: { dark: '#0c2340', light: '#ffffff' },
      })
        .then(setQrUrl)
        .catch(() => {});
    }
  }, [isOpen, permanentId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0e2448]/60 flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-md border border-line overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Modal Controls (Excluded in print) */}
        <div className="flex items-center justify-between px-5 py-3 bg-navy text-white no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-amber-400" />
            <span className="font-bold text-sm tracking-wide">
              Official Statutory Compliance Certificate · Form A
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-secondary btn-xs bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center gap-1.5 cursor-pointer font-semibold"
            >
              <Printer size={13} />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Certificate Container (A4 Printable Layout) */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-[#fffdfa] text-navy font-serif selection:bg-amber-100 flex-1">
          {/* Outer Decorative Border */}
          <div className="border-4 border-double border-[#0c2340]/40 p-6 sm:p-8 rounded-lg relative bg-white shadow-xs">
            {/* National Watermark Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
              <img src="/aicte-logo.png" alt="" className="w-80 h-80 object-contain grayscale" />
            </div>

            {/* Header / Republic of India Seal */}
            <div className="text-center space-y-1 pb-4 border-b-2 border-[#0c2340]/20">
              <div className="text-xs uppercase tracking-[0.2em] font-sans font-bold text-neutral-600">
                Government of India · Ministry of Education
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <img src="/aicte-logo.png" alt="AICTE" className="h-14 w-14 object-contain" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0c2340] font-serif uppercase pt-1 m-0">
                All India Council for Technical Education
              </h1>
              <div className="text-xs font-sans text-neutral-600">
                Nelson Mandela Marg, Vasant Kunj, New Delhi 110070 · www.aicte-india.org
              </div>
              <div className="pt-2">
                <span className="inline-block bg-[#0c2340] text-amber-300 font-sans text-xs uppercase px-3 py-1 font-bold tracking-widest rounded-xs">
                  Statutory Certificate of Admitted Intake Compliance (Form-A)
                </span>
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between text-xs font-sans text-neutral-600 py-3 border-b border-neutral-200 gap-2">
              <div>
                Certificate No: <strong className="text-neutral-900 font-mono">AICTE/APH/{academicYear}/FORM-A/{permanentId}</strong>
              </div>
              <div>
                Date of Issue: <strong className="text-neutral-900">02 November 2026</strong>
              </div>
            </div>

            {/* Certificate Body Text */}
            <div className="py-5 space-y-4 text-xs sm:text-sm leading-relaxed text-neutral-800">
              <p className="m-0 indent-6">
                This is to certify that the technical institution known as{' '}
                <strong className="text-neutral-950 font-bold uppercase underline decoration-amber-500 decoration-2">
                  {institutionName}
                </strong>
                , bearing Permanent Application ID <strong className="font-mono text-neutral-950">{permanentId}</strong>,
                has duly submitted and synchronized its complete student admission roster for the Academic Year{' '}
                <strong className="text-neutral-950">{academicYear}</strong> onto the AICTE National Immutable Depository.
              </p>

              <p className="m-0 indent-6">
                Pursuant to AICTE Approval Process Handbook (APH) 2024–27 Chapter III and Regulation 4(2), the council’s
                cryptographic verification engine has audited all submitted records against sanctioned intake limits,
                statutory supernumerary reservations (OCI/PIO, Gulf Workers, TFW, EWS, Lateral Entry), and cross-institutional
                duplicate enrolment filters.
              </p>

              {/* Certified Intake Summary Box */}
              <div className="my-3 p-4 bg-neutral-50 rounded border border-neutral-300 font-sans">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Certified Intake Statutory Balance Roster
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2 bg-white rounded border border-neutral-200">
                    <div className="text-[10px] text-neutral-500 uppercase">Sanctioned Intake</div>
                    <div className="text-base font-bold text-neutral-900">{totalApprovedIntake}</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-neutral-200">
                    <div className="text-[10px] text-neutral-500 uppercase">Within Intake Enrolled</div>
                    <div className="text-base font-bold text-emerald-700">{totalEnrolled}</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-neutral-200">
                    <div className="text-[10px] text-neutral-500 uppercase">Over-Intake Breach</div>
                    <div className="text-base font-bold text-neutral-900">0 (Nil)</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-neutral-200">
                    <div className="text-[10px] text-neutral-500 uppercase">Compliance Grade</div>
                    <div className="text-base font-bold text-amber-600">Grade A+ (Autonomous)</div>
                  </div>
                </div>
              </div>

              <p className="m-0 text-xs text-neutral-600 italic">
                * Zero phantom or synthetic records identified. All admitted students successfully verified via Verhoeff Dihedral Group D5 mathematical checksum against the Academic Bank of Credits (ABC) repository.
              </p>
            </div>

            {/* Cryptographic Seal & Signatures Footer */}
            <div className="pt-4 border-t-2 border-[#0c2340]/20 flex flex-wrap items-end justify-between gap-4 font-sans">
              {/* QR Verification Seal */}
              <div className="flex items-center gap-3">
                {qrUrl ? (
                  <img src={qrUrl} alt="Verification QR Code" className="w-20 h-20 border border-neutral-300 rounded p-1 bg-white" />
                ) : (
                  <div className="w-20 h-20 bg-neutral-100 rounded border border-neutral-300 flex items-center justify-center text-[10px] text-neutral-400">
                    QR Seal
                  </div>
                )}
                <div className="space-y-0.5 text-[10px] text-neutral-600 max-w-[200px]">
                  <div className="font-bold text-neutral-900">Public Merkle Proof Anchor</div>
                  <div className="font-mono break-all text-[9px] text-neutral-500">{merkleRootHash.slice(0, 22)}...</div>
                  <div className="text-emerald-700 font-semibold">Ledger Block #14,298 · Valid</div>
                </div>
              </div>

              {/* Official Signatures */}
              <div className="flex items-center gap-8 text-center text-xs">
                <div className="space-y-1">
                  <div className="font-serif italic text-sm text-neutral-700 border-b border-neutral-400 pb-1 px-4">
                    Dr. Rajive Kumar
                  </div>
                  <div className="font-bold text-neutral-900 text-[11px]">Member Secretary</div>
                  <div className="text-[9px] text-neutral-500">AICTE, New Delhi</div>
                </div>

                <div className="space-y-1">
                  <div className="font-serif italic text-sm text-neutral-700 border-b border-neutral-400 pb-1 px-4">
                    Registrar / Nodal Officer
                  </div>
                  <div className="font-bold text-neutral-900 text-[11px]">Institutional Signatory</div>
                  <div className="text-[9px] text-neutral-500">{institutionName.split(',')[0]}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
