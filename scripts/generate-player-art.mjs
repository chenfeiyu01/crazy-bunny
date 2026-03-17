import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('Missing OPENAI_API_KEY. Export it first, then rerun this script.');
  process.exit(1);
}

const outputDir = path.resolve('public/generated');
const outputFile = path.join(outputDir, 'rabbit-striker.png');
const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const prompt = process.env.OPENAI_IMAGE_PROMPT || [
  'Original side-view rabbit-man game character for a physics platformer,',
  'not based on any existing copyrighted character,',
  'cream and pale-yellow fur, rounded belly, expressive face, big kicking leg,',
  'compact silhouette readable at gameplay distance,',
  'clean 2D cartoon render, soft shading, transparent background,',
  'single full-body character facing right, no text, no props, no ground.'
].join(' ');

const response = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model,
    prompt,
    size: '1024x1024',
    quality: 'high',
    background: 'transparent',
    output_format: 'png',
  }),
});

if (!response.ok) {
  const errorText = await response.text();
  console.error(`OpenAI image generation failed: ${response.status} ${response.statusText}`);
  console.error(errorText);
  process.exit(1);
}

const payload = await response.json();
const imageBase64 = payload?.data?.[0]?.b64_json;

if (!imageBase64) {
  console.error('OpenAI image generation returned no image data.');
  process.exit(1);
}

await mkdir(outputDir, { recursive: true });
await writeFile(outputFile, Buffer.from(imageBase64, 'base64'));
console.log(`Saved generated character art to ${outputFile}`);
