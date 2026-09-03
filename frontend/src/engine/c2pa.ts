/**
 * Full C2PA / Content Credentials verification.
 *
 * Uses the official `c2pa` library (WASM, from the Content Authenticity
 * Initiative) to parse the manifest store, validate the signature chain and
 * extract generative-AI assertions. Lazy-loaded — the WASM only downloads when
 * an image is analysed.
 */
import type { C2PAResult } from '@/types/analysis';

// c2pa ships its wasm + worker as separate assets; Vite serves them via ?url.
type C2paApi = {
  read: (input: File | Blob) => Promise<{ manifestStore: unknown | null }>;
};

let c2paPromise: Promise<C2paApi> | null = null;

async function getC2pa(): Promise<C2paApi> {
  if (!c2paPromise) {
    c2paPromise = (async () => {
      const [{ createC2pa }, wasm, worker] = await Promise.all([
        import('c2pa'),
        import('c2pa/dist/assets/wasm/toolkit_bg.wasm?url'),
        import('c2pa/dist/c2pa.worker.min.js?url'),
      ]);
      return createC2pa({
        wasmSrc: wasm.default,
        workerSrc: worker.default,
      }) as unknown as C2paApi;
    })();
  }
  return c2paPromise;
}

export const noC2PA: C2PAResult = { status: 'not_found', manifest: false };

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function analyzeC2PA(file: File): Promise<C2PAResult> {
  let store: any;
  try {
    const c2pa = await getC2pa();
    const res = await c2pa.read(file);
    store = res.manifestStore;
  } catch {
    return { ...noC2PA, errors: ['C2PA reader failed to run'] };
  }

  if (!store || !store.activeManifest) return noC2PA;

  const active = store.activeManifest;
  const validationStatus: any[] = store.validationStatus ?? [];
  const vResults = store.validationResults ?? {};

  // Collect failures. Newer toolkit puts them under validationResults.activeManifest.failure;
  // older builds only list failures in validationStatus.
  const failureCodes: string[] = [
    ...(vResults?.activeManifest?.failure ?? []).map((f: any) => f.code ?? String(f)),
    ...validationStatus
      .filter((s) => {
        const c = String(s.code ?? '');
        return c && !/valid|verified|match|trusted/i.test(c);
      })
      .map((s) => String(s.code)),
  ];
  const errors = [...new Set(failureCodes)];
  const verified = errors.length === 0;

  // Generative-AI assertions.
  let isAi = false;
  let generativeType: C2PAResult['generativeType'];
  let softwareAgents: string[] = [];
  try {
    const c2paMod: any = await import('c2pa');
    const genInfo = c2paMod.selectGenerativeInfo?.(active);
    if (genInfo && genInfo.length) {
      isAi = true;
      generativeType = c2paMod.selectGenerativeType?.(genInfo);
      softwareAgents = c2paMod.selectGenerativeSoftwareAgents?.(genInfo) ?? [];
    }
  } catch {
    /* selector unavailable — fall through */
  }

  // Fallback: scan assertions for a generative digitalSourceType / action.
  if (!isAi) {
    try {
      const assertions: any[] = active.assertions?.data ?? active.assertions ?? [];
      const dump = JSON.stringify(assertions).toLowerCase();
      if (
        dump.includes('trainedalgorithmicmedia') ||
        dump.includes('compositewithtrainedalgorithmicmedia') ||
        dump.includes('generative') ||
        dump.includes('com.adobe.generative-ai')
      ) {
        isAi = true;
        generativeType = dump.includes('composite')
          ? 'compositeWithTrainedAlgorithmicMedia'
          : 'trainedAlgorithmicMedia';
      }
    } catch {
      /* ignore */
    }
  }

  const sig = active.signatureInfo ?? {};
  const claims: string[] = [];
  if (isAi) {
    claims.push(
      generativeType === 'compositeWithTrainedAlgorithmicMedia'
        ? 'Declares AI-assisted composition (some elements AI-generated)'
        : 'Declares an AI-generated / trained-algorithm source',
    );
  } else {
    claims.push('Provenance manifest present (no AI-generation assertion)');
  }
  if (softwareAgents.length) claims.push(`Software: ${softwareAgents.join(', ')}`);

  return {
    status: 'found',
    manifest: true,
    verified,
    validationState: verified ? 'valid' : 'invalid',
    signer: sig.issuer ?? undefined,
    timestamp: sig.time ?? undefined,
    claimGenerator: active.claimGenerator ?? active.claimGeneratorInfo?.[0]?.name ?? undefined,
    isAiGenerated: isAi,
    generativeType,
    softwareAgents: softwareAgents.length ? softwareAgents : undefined,
    claims,
    errors: errors.length ? errors : undefined,
    valid: verified,
  };
}
