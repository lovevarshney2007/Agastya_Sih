import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, GitBranch, Key, Lock, ShieldAlert, ShieldCheck } from 'lucide-react';
import { shortHash } from '../lib/format';

interface MerkleNode {
  id: string;
  label: string;
  type: 'ROOT' | 'BRANCH' | 'LEAF';
  hash: string;
  tamperedHash?: string;
  details: string;
  children?: MerkleNode[];
}

interface MerkleTreeVisualizerProps {
  isTampered: boolean;
  onTamper?: () => void;
  onRestore?: () => void;
}

export function MerkleTreeVisualizer({
  isTampered,
  onTamper,
  onRestore,
}: MerkleTreeVisualizerProps) {
  const [selectedNode, setSelectedNode] = useState<MerkleNode | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Dynamic Tree Data reflecting current ledger state
  const treeData: MerkleNode = {
    id: 'root-0',
    label: 'National Consensus Root (Block #14,298)',
    type: 'ROOT',
    hash: isTampered
      ? '0xDEADBEEF7b3f91a0c8d24e65b10a98f7e2d3c4b5a69708192a3b4c5d6e7f8091'
      : '0x7b3f91a0c8d24e65b10a98f7e2d3c4b5a69708192a3b4c5d6e7f8091a2b3c4d5',
    details: 'AICTE National Depository Root Anchor synchronized across 4 zonal validation nodes (Delhi, Mumbai, Chennai, Kolkata).',
    children: [
      {
        id: 'branch-1',
        label: 'Branch 1: Batch Admissions (North/West Zone)',
        type: 'BRANCH',
        hash: isTampered
          ? '0xBAD000004e65b10a98f7e2d3c4b5a69708192a3b4c5d6e7f8091a2b3c4d5e6f7'
          : '0x4e65b10a98f7e2d3c4b5a69708192a3b4c5d6e7f8091a2b3c4d5e6f7a8b9c0d1',
        details: 'Intermediate Merkle digest representing 142 accepted student admissions from Malaviya Institute & COEP Pune.',
        children: [
          {
            id: 'leaf-1',
            label: 'Leaf #149: Priya Sharma (B.Tech CSE)',
            type: 'LEAF',
            hash: isTampered
              ? '0xCORRUPT_SQL_DIRECT_INJECTION_492817290123'
              : '0x9f83b2a14e56c78d01ef34a5b6c7d8e9f0123456789abcdef0123456789abcde',
            details: isTampered
              ? '⚠️ DATABASE MUTATION DETECTED: Row #149 approved course altered from Mechanical to Computer Science without digital signature.'
              : 'Admitted under General Quota at Malaviya Institute of Technology. Verhoeff Dihedral Checksum validated.',
          },
          {
            id: 'leaf-2',
            label: 'Leaf #148: Rohan Verma (B.Tech ME)',
            type: 'LEAF',
            hash: '0x8a71c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
            details: 'Admitted under Sanctioned Intake at College of Engineering, Pune. Zero cross-institutional conflict.',
          },
        ],
      },
      {
        id: 'branch-2',
        label: 'Branch 2: Regulatory Quorum & Sanctions',
        type: 'BRANCH',
        hash: '0x2a3b4c5d6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
        details: 'Intermediate Merkle digest representing AICTE 4-Eyes Maker-Checker dual key sanctions and case resolutions.',
        children: [
          {
            id: 'leaf-3',
            label: 'Leaf #147: Dual Enrolment Case #984 Decision',
            type: 'LEAF',
            hash: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
            details: 'Joint cryptographic sign-off by Joint Director (Maker) and Member Secretary (Checker) under UGC §3.1.',
          },
          {
            id: 'leaf-4',
            label: 'Leaf #146: Nodal Officer Annual Form-A Declaration',
            type: 'LEAF',
            hash: '0x1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a',
            details: 'Institutional Registrar declaration anchoring 420 approved intake seats to immutable WORM depository.',
          },
        ],
      },
    ],
  };

  const handleCopy = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 1800);
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Visualizer Control Header */}
      <div className="p-4 bg-wash border border-line-soft rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              isTampered ? 'bg-bad/15 text-bad' : 'bg-ok/15 text-ok'
            }`}
          >
            {isTampered ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-ink">
                SHA-256 Merkle Hash Directed Acyclic Graph (DAG)
              </span>
              <span
                className={`tag text-[10px] py-0 px-1.5 font-bold ${
                  isTampered ? 'tag-bad animate-pulse' : 'tag-ok'
                }`}
              >
                {isTampered ? 'CONTINUITY BREACH DETECTED' : 'CRYPTOGRAPHICALLY CONTINUOUS'}
              </span>
            </div>
            <div className="text-xs text-muted">
              Live tree structure validating leaf-to-root proof inclusion path conforming to Indian Evidence Act §65B.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isTampered ? (
            <button
              type="button"
              onClick={onRestore}
              className="btn btn-primary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <CheckCircle2 size={14} />
              Revert DB Mutation &amp; Recompute
            </button>
          ) : (
            <button
              type="button"
              onClick={onTamper}
              className="btn btn-secondary btn-sm flex items-center gap-1.5 text-bad font-semibold cursor-pointer border-bad/30 hover:bg-bad-wash"
            >
              <AlertTriangle size={14} />
              Inject Stealth SQL Mutation
            </button>
          )}
        </div>
      </div>

      {/* Main Tree Container */}
      <div className="p-5 border border-line rounded-xl bg-surface shadow-xs space-y-6">
        {/* Level 0: Root */}
        <div className="flex flex-col items-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1 flex items-center gap-1">
            <Lock size={12} className={isTampered ? 'text-bad' : 'text-ok'} />
            Level 0: AICTE National Merkle Anchor Root
          </div>

          <button
            type="button"
            onClick={() => setSelectedNode(treeData)}
            className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer max-w-md w-full shadow-xs ${
              isTampered
                ? 'border-bad bg-bad-wash/80 ring-2 ring-bad/40 text-bad font-bold'
                : 'border-brand/40 bg-brand-wash/30 hover:bg-brand-wash/50 text-ink'
            } ${selectedNode?.id === treeData.id ? 'ring-2 ring-brand' : ''}`}
          >
            <div className="font-bold text-xs">{treeData.label}</div>
            <div className="mono text-[11px] mt-1 text-muted flex items-center justify-center gap-1">
              <span>{shortHash(treeData.hash, 24)}</span>
              <Copy size={11} className="hover:text-brand" />
            </div>
            {isTampered && (
              <div className="text-[10px] text-bad font-bold mt-1 bg-white/80 py-0.5 rounded border border-bad/30">
                MERKLE ROOT MISMATCH (Calculated ≠ Stored)
              </div>
            )}
          </button>

          {/* Connector Line */}
          <div className={`w-0.5 h-6 ${isTampered ? 'bg-bad' : 'bg-line-soft'}`} />
        </div>

        {/* Level 1: Branches */}
        <div>
          <div className="text-center text-[10px] font-bold uppercase tracking-wider text-muted mb-2 flex items-center justify-center gap-1">
            <GitBranch size={12} />
            Level 1: Intermediate Zonal Digest Branches
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {treeData.children?.map((branch, bIdx) => {
              const isBranchTampered = isTampered && bIdx === 0;

              return (
                <div key={branch.id} className="flex flex-col items-center space-y-4">
                  <button
                    type="button"
                    onClick={() => setSelectedNode(branch)}
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer w-full shadow-2xs ${
                      isBranchTampered
                        ? 'border-bad bg-bad-wash ring-1 ring-bad/30 text-bad'
                        : 'border-line bg-wash hover:border-line-strong text-ink'
                    } ${selectedNode?.id === branch.id ? 'ring-2 ring-brand' : ''}`}
                  >
                    <div className="font-bold text-xs">{branch.label}</div>
                    <div className="mono text-[10px] mt-0.5 text-muted">
                      {shortHash(branch.hash, 18)}
                    </div>
                  </button>

                  {/* Connector Line to Leaves */}
                  <div className={`w-0.5 h-4 ${isBranchTampered ? 'bg-bad' : 'bg-line-soft'}`} />

                  {/* Level 2: Leaves */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                    {branch.children?.map((leaf, lIdx) => {
                      const isLeafTampered = isTampered && bIdx === 0 && lIdx === 0;

                      return (
                        <button
                          key={leaf.id}
                          type="button"
                          onClick={() => setSelectedNode(leaf)}
                          className={`p-2.5 rounded-md border text-left transition-all cursor-pointer flex flex-col justify-between text-xs ${
                            isLeafTampered
                              ? 'border-bad bg-bad-wash ring-2 ring-bad/50 animate-pulse'
                              : 'border-line bg-surface hover:border-line-strong'
                          } ${selectedNode?.id === leaf.id ? 'ring-2 ring-brand' : ''}`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="tag text-[9px] py-0 px-1 font-bold tag-neutral">
                                LEAF
                              </span>
                              {isLeafTampered && (
                                <span className="text-[9px] font-bold text-bad uppercase">
                                  TAMPERED
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-ink line-clamp-1">{leaf.label}</div>
                          </div>
                          <div className="mono text-[10px] text-muted mt-2 truncate">
                            {shortHash(leaf.hash, 14)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Node Cryptographic Inspector Panel */}
      {selectedNode && (
        <div className="p-4 bg-wash rounded-xl border border-line-soft text-xs space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm text-ink flex items-center gap-1.5">
              <Key size={14} className="text-brand" />
              <span>Node Inspector: {selectedNode.label}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="text-muted hover:text-ink text-xs cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-muted">Cryptographic SHA-256 Digest:</div>
            <div className="flex items-center gap-2">
              <code className="mono text-[11px] bg-white px-2 py-1 rounded border border-line flex-1 break-all text-ink">
                {selectedNode.hash}
              </code>
              <button
                type="button"
                onClick={() => handleCopy(selectedNode.hash)}
                className="btn btn-secondary btn-xs flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Copy size={12} />
                <span>{copiedHash === selectedNode.hash ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="pt-1">
            <span className="text-muted block">Forensic Details &amp; Custody Note:</span>
            <p className="text-ink mt-0.5 leading-relaxed">{selectedNode.details}</p>
          </div>
        </div>
      )}
    </div>
  );
}
