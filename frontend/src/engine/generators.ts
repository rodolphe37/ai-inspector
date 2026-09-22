/**
 * Generator signatures in image metadata.
 *
 * Each rule looks for the trace a specific tool is known to leave, in the
 * field where that tool writes it. Nothing is matched against free text such
 * as a copyright line or a photo description, so a photographer called
 * "Flux Studio" is not mistaken for the Flux model.
 */

/** Ids of the generators found; they map to catalogue entries (see `data/catalog.ts`). */
export type GeneratorId =
  | 'sd-webui'
  | 'comfyui'
  | 'invokeai'
  | 'novelai'
  | 'midjourney'
  | 'google-ai'
  | 'named-generator';

export interface GeneratorHit {
  id: GeneratorId;
  /** Tool name shown to the user. */
  name: string;
}

/** Tool names that are only meaningful in software / creator fields. */
const SOFTWARE_NAMES: [RegExp, string][] = [
  [/\bstable[\s-]?diffusion\b/i, 'Stable Diffusion'],
  [/\bmidjourney\b/i, 'Midjourney'],
  [/\bdall[\s-·.]?e\b/i, 'DALL·E'],
  [/\bfirefly\b/i, 'Adobe Firefly'],
  [/\bnovelai\b/i, 'NovelAI'],
  [/\bleonardo(\.ai)?\b/i, 'Leonardo.Ai'],
  [/\bideogram\b/i, 'Ideogram'],
  [/\bplayground\s?(ai|v\d)/i, 'Playground'],
  [/\bflux(\.1)?\b/i, 'FLUX'],
  [/\bimagen\b/i, 'Google Imagen'],
  [/\bgemini\b/i, 'Google Gemini'],
  [/\bgrok\b/i, 'Grok'],
  [/\brecraft\b/i, 'Recraft'],
  [/\bgpt[\s-]?image\b/i, 'OpenAI GPT Image'],
  [/\bcomfyui\b/i, 'ComfyUI'],
  [/\binvokeai\b/i, 'InvokeAI'],
  [/\bautomatic1111\b/i, 'AUTOMATIC1111'],
  // Audio
  [/\bsuno\b/i, 'Suno'],
  [/\budio\b/i, 'Udio'],
  [/\belevenlabs\b/i, 'ElevenLabs'],
  // Video
  [/\bsora\b/i, 'OpenAI Sora'],
  [/\brunway(ml)?\b/i, 'Runway'],
  [/\bveo\s?\d?\b/i, 'Google Veo'],
  [/\bpika(\s?labs)?\b/i, 'Pika'],
  [/\bkling\b/i, 'Kling'],
  [/\bdream machine\b|\bluma ai\b/i, 'Luma Dream Machine'],
  [/\bsynthesia\b/i, 'Synthesia'],
  [/\bheygen\b/i, 'HeyGen'],
  // Documents
  [/\bchatgpt\b/i, 'ChatGPT'],
];

/**
 * @param software  values of Software / CreatorTool / ProcessingSoftware / HistorySoftwareAgent
 * @param credit    IPTC Credit / Source values
 * @param chunks    PNG text chunks and EXIF UserComment, keyed by their name (lower case)
 */
export function detectGenerators(
  software: string[],
  credit: string[],
  chunks: Record<string, string>,
): GeneratorHit[] {
  const hits: GeneratorHit[] = [];
  const add = (id: GeneratorId, name: string) => {
    if (!hits.some((h) => h.id === id && h.name === name)) hits.push({ id, name });
  };

  // Stable Diffusion web UIs (AUTOMATIC1111, Forge, SD.Next, Fooocus): a
  // `parameters` block (PNG chunk, or EXIF UserComment in JPEG / WebP).
  const params = chunks['parameters'] ?? chunks['usercomment'] ?? '';
  if (/\bSteps:\s*\d+/.test(params) && /\bSampler:/.test(params)) add('sd-webui', 'Stable Diffusion web UI');
  if (/fooocus/i.test(params) || 'fooocus_scheme' in chunks) add('sd-webui', 'Fooocus');

  // ComfyUI embeds the node graph as JSON.
  if (('prompt' in chunks || 'workflow' in chunks) && /class_type|"nodes"\s*:/.test((chunks['prompt'] ?? '') + (chunks['workflow'] ?? ''))) {
    add('comfyui', 'ComfyUI');
  }

  // InvokeAI (current and legacy keys).
  if ('invokeai_metadata' in chunks || 'invokeai_graph' in chunks || 'sd-metadata' in chunks || 'dream' in chunks) {
    add('invokeai', 'InvokeAI');
  }

  // NovelAI: Software / Source chunk plus a JSON Comment with its sampler settings.
  if (/novelai/i.test(chunks['software'] ?? '') || /novelai/i.test(chunks['source'] ?? '')) add('novelai', 'NovelAI');

  // Midjourney names itself in the creator / description fields it writes.
  const mjFields = [chunks['author'] ?? '', chunks['description'] ?? '', ...software];
  if (mjFields.some((v) => /\bmidjourney\b/i.test(v))) add('midjourney', 'Midjourney');

  // Google marks generated images with an IPTC credit line.
  if (credit.some((v) => /made with google ai/i.test(v))) add('google-ai', 'Google AI');

  // Any other known generator named in a software / creator field.
  for (const value of [...software, chunks['software'] ?? '']) {
    for (const [re, name] of SOFTWARE_NAMES) {
      if (re.test(value) && !hits.some((h) => h.name === name)) add('named-generator', name);
    }
  }

  return hits;
}
