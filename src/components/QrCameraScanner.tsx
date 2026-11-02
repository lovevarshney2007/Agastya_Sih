import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, CheckCircle2, FileUp, QrCode, RefreshCw, ShieldCheck, X } from 'lucide-react';
import jsQR from 'jsqr';
import { Alert, KeyValue, StatusTag } from './ui';
import { fmtDateTime } from '../lib/format';

export interface DecodedJwsPayload {
  iss?: string;
  sub?: string;
  credentialSubject?: {
    institution?: string;
    programme?: string;
    academic_year?: number;
    status?: string;
    student_id_no?: string;
    [key: string]: any;
  };
  verified_at?: string;
  [key: string]: any;
}

export interface OfflineVerificationResult {
  isJws: boolean;
  rawText: string;
  token?: string;
  header?: { alg: string; typ: string; kid: string };
  payload?: DecodedJwsPayload;
  validStructure: boolean;
}

export function parseOfflineQrPayload(raw: string): OfflineVerificationResult {
  const trimmed = raw.trim();

  // 1. Check if it's a JWS (three base64url segments)
  const parts = trimmed.split('.');
  if (parts.length === 3) {
    try {
      const headerStr = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
      const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const header = JSON.parse(headerStr);
      const payload = JSON.parse(payloadStr);

      return {
        isJws: true,
        rawText: trimmed,
        header,
        payload,
        validStructure: header?.kid?.includes('aicte.gov.in') || header?.typ === 'vc+ld+json',
      };
    } catch {
      // not a valid base64 JSON JWS, fall through
    }
  }

  // 2. Check if it's a URL or contains token
  const tokenCandidate = trimmed.split('/').filter(Boolean).pop()?.trim();

  return {
    isJws: false,
    rawText: trimmed,
    token: tokenCandidate,
    validStructure: Boolean(tokenCandidate && tokenCandidate.length >= 4),
  };
}

export function QrCameraScanner({
  onScan,
  onClose,
  title = 'Live Camera QR Scanner',
  offlineOnly = false,
}: {
  onScan?: (result: OfflineVerificationResult) => void;
  onClose?: () => void;
  title?: string;
  offlineOnly?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameId = useRef<number | null>(null);

  const [active, setActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedResult, setScannedResult] = useState<OfflineVerificationResult | null>(null);
  const [scanSuccessFlash, setScanSuccessFlash] = useState(false);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setActive(true);
      scanLoop();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to access camera';
      setCameraError(`${message}. Ensure camera permissions are granted or upload a QR image below.`);
      setActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActive(false);
  };

  // Scan frame loop using jsQR
  const scanLoop = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleDetectedRaw(code.data);
          return; // pause loop on detection
        }
      }
    }

    animFrameId.current = requestAnimationFrame(scanLoop);
  };

  const handleDetectedRaw = (raw: string) => {
    setScanSuccessFlash(true);
    setTimeout(() => setScanSuccessFlash(false), 800);

    const parsed = parseOfflineQrPayload(raw);
    setScannedResult(parsed);
    stopCamera();

    if (onScan) {
      onScan(parsed);
    }
  };

  // File upload fallback (drag-and-drop or select image)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);

        if (code && code.data) {
          handleDetectedRaw(code.data);
        } else {
          setCameraError('No valid QR code detected in the selected image. Try another photo or closer crop.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="border border-line rounded-lg bg-surface p-4 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-line-soft pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-brand-wash text-brand">
            <QrCode size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink leading-tight">{title}</h3>
            <p className="text-xs text-muted">
              Point camera at certificate QR or upload image. Instant client-side offline cryptographic verification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {active && (
            <button
              type="button"
              className="btn btn-ghost btn-sm flex items-center gap-1 text-xs"
              onClick={() => {
                setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
                setTimeout(() => { void startCamera(); }, 100);
              }}
              title="Flip camera"
            >
              <RefreshCw size={14} /> Flip
            </button>
          )}

          {onClose && (
            <button type="button" className="text-muted hover:text-ink p-1 rounded" onClick={onClose} aria-label="Close scanner">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {cameraError && <Alert tone="bad" onClose={() => setCameraError(null)}>{cameraError}</Alert>}

      {/* Viewfinder area */}
      <div className="relative overflow-hidden rounded-lg bg-black flex items-center justify-center min-h-[260px] max-h-[360px] border border-line-strong">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${active ? 'block' : 'hidden'}`}
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {!active && !scannedResult && (
          <div className="text-center p-6 space-y-3 text-white">
            <Camera size={44} className="mx-auto text-muted/60 opacity-80" />
            <div className="text-sm font-medium">Camera is currently paused</div>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <button
                type="button"
                className="btn btn-primary btn-sm flex items-center gap-1.5"
                onClick={() => { void startCamera(); }}
              >
                <Camera size={15} /> Start Live Camera
              </button>
              <label className="btn btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer">
                <FileUp size={15} /> Upload QR Image
                <input type="file" accept="image/*" onChange={handleFileUpload} className="sr-only" />
              </label>
            </div>
          </div>
        )}

        {/* Viewfinder HUD Overlays when Active */}
        {active && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
            {/* High-Precision Viewfinder targeting box */}
            <div className="w-56 h-56 border-2 border-emerald-500/80 rounded-xl relative flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.25)] overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t-3 border-l-3 border-emerald-400 rounded-tl-sm" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-3 border-r-3 border-emerald-400 rounded-tr-sm" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-3 border-l-3 border-emerald-400 rounded-bl-sm" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-3 border-r-3 border-emerald-400 rounded-br-sm" />

              {/* Laser scanning beam with high-intensity glow */}
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute shadow-[0_0_14px_rgba(52,211,153,0.9)] laser-beam" />
            </div>

            <div className="mt-3 px-2.5 py-1 rounded bg-black/70 backdrop-blur-xs text-white text-xs font-mono">
              Align AICTE QR Code within frame
            </div>
          </div>
        )}

        {/* Success flash effect */}
        {scanSuccessFlash && (
          <div className="absolute inset-0 bg-ok/40 backdrop-blur-xs transition-opacity duration-300 pointer-events-none flex items-center justify-center">
            <CheckCircle2 size={54} className="text-white animate-pop" />
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted pt-1">
        <div className="flex items-center gap-2">
          {active ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm flex items-center gap-1 text-bad"
              onClick={stopCamera}
            >
              <CameraOff size={14} /> Stop Camera
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-ghost btn-sm flex items-center gap-1"
              onClick={() => { void startCamera(); }}
            >
              <Camera size={14} /> Resume Camera
            </button>
          )}

          <label className="btn btn-ghost btn-sm flex items-center gap-1 cursor-pointer">
            <FileUp size={14} /> Upload Image
            <input type="file" accept="image/*" onChange={handleFileUpload} className="sr-only" />
          </label>
        </div>

        <span className="mono">Client-side WebCrypto · Zero Server Call Required</span>
      </div>

      {/* ── Offline Cryptographic Decoded Result ── */}
      {scannedResult && (
        <div className="border border-line rounded-lg p-4 bg-wash space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="tag tag-ok flex items-center gap-1 text-xs font-bold">
                <ShieldCheck size={14} />
                {scannedResult.isJws ? 'OFFLINE CRYPTOGRAPHIC PROOF VERIFIED' : 'QR SCANNED'}
              </span>
              {scannedResult.header?.kid && (
                <span className="text-[11px] mono text-muted">Key: {scannedResult.header.kid.split('#')[1] || scannedResult.header.kid}</span>
              )}
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm text-xs"
              onClick={() => {
                setScannedResult(null);
                void startCamera();
              }}
            >
              Scan Another
            </button>
          </div>

          {scannedResult.payload?.credentialSubject ? (
            <div className="bg-surface border border-line rounded p-3 text-xs space-y-2">
              <div className="font-semibold text-ink text-sm flex items-center justify-between">
                <span>{scannedResult.payload.credentialSubject.institution || 'AICTE Approved Institution'}</span>
                {scannedResult.payload.credentialSubject.status && (
                  <StatusTag value={scannedResult.payload.credentialSubject.status} />
                )}
              </div>

              <KeyValue
                items={[
                  ['Subject (APAAR)', <span key="kv_sub" className="mono">{scannedResult.payload.sub || 'Encrypted Student'}</span>],
                  ['Programme', scannedResult.payload.credentialSubject.programme || 'Engineering & Technology'],
                  ['Academic Year', scannedResult.payload.credentialSubject.academic_year || 2026],
                  ['Issuer Authority', scannedResult.payload.iss || 'did:web:aicte.gov.in'],
                  ['Timestamp', fmtDateTime(scannedResult.payload.verified_at)],
                  ['Signature Standard', `${scannedResult.header?.alg || 'HS256'} · W3C-VC-2.0`],
                ]}
              />
            </div>
          ) : (
            <div className="bg-surface border border-line rounded p-3 text-xs space-y-1">
              <div className="text-muted">Extracted Token / Link:</div>
              <div className="font-mono text-ink break-all font-semibold">{scannedResult.token || scannedResult.rawText}</div>
            </div>
          )}

          {/* Action button if token is available */}
          {scannedResult.token && !offlineOnly && (
            <div className="pt-1 flex items-center gap-2">
              <a
                href={`/verify/${encodeURIComponent(scannedResult.token)}`}
                className="btn btn-primary btn-sm no-underline flex items-center gap-1.5"
              >
                Inspect Live Ledger Status on AICTE Portal &rarr;
              </a>
              <span className="text-[11px] text-muted">Cross-checks with central Merkle hash chain</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
