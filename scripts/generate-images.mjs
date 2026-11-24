import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

await mkdir('generated', { recursive: true });

const center = await sharp('public/assets/ground.avif')
    .resize(128, 128, { fit: 'fill' })
    .png()
    .toBuffer();

await Promise.all([
    sharp('public/assets/ground-none.avif')
        .composite([{ input: center, gravity: 'centre' }])
        .webp({ quality: 82 })
        .toFile('generated/floor.webp'),
    ...[480, 800].map(width => sharp('public/assets/golden-image.png')
        .resize({ width })
        .avif({ quality: 38 })
        .toFile(`generated/preview-${width}.avif`)),
]);
