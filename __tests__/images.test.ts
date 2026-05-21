/**
 * Verifies that every image path referenced in data files and shared
 * components resolves to an actual file on disk under /public.
 * Covers: destinations, adventures, chefs, boats data, boat gallery, and
 * hard-coded component images (logo, hero).
 */

import fs from 'fs';
import nodePath from 'path';
import { destinations } from '../app/destinations-data';
import adventures, { chefs } from '../app/adventures-data';
import { boats } from '../app/boats-data';
import {
  exteriorImages,
  interiorImages,
  cockpitImages,
  droneImages,
  activityImages,
  foodImages,
} from '../app/constants/boat-images';

const publicDir = nodePath.join(process.cwd(), 'public');

function fileExists(imagePath: string): boolean {
  return fs.existsSync(nodePath.join(publicDir, imagePath));
}

// ── Collect paths from each source ──────────────────────────────────────────

const destinationPaths = destinations.map(d => d.image);

const adventurePaths = adventures.map(a => a.image);

const chefPaths: string[] = chefs.flatMap(chef => {
  const paths: string[] = [chef.image, ...chef.foodImages];
  for (const award of chef.awards ?? []) {
    if (award.awardImage) paths.push(award.awardImage);
    for (const img of award.awardImages ?? []) {
      if (img) paths.push(img);
    }
  }
  return paths;
});

const boatDataPaths = boats.map(b => b.image);

const boatGalleryPaths = [
  ...exteriorImages,
  ...interiorImages,
  ...cockpitImages,
  ...droneImages,
  ...activityImages,
  ...foodImages,
].map(img => img.src);

// Paths hard-coded in shared components (Navigation, Footer, About, etc.)
const componentPaths = [
  '/images/boats/blueone/logo_blueone.png',
  '/images/boats/blueone/External_sailing.jpg',
];

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Site images exist in /public', () => {
  describe('destinations', () => {
    it.each(destinationPaths)('%s', (imagePath) => {
      expect(fileExists(imagePath)).toBe(true);
    });
  });

  describe('adventures', () => {
    it.each(adventurePaths)('%s', (imagePath) => {
      expect(fileExists(imagePath)).toBe(true);
    });
  });

  describe('chefs', () => {
    it.each(chefPaths)('%s', (imagePath) => {
      expect(fileExists(imagePath)).toBe(true);
    });
  });

  describe('boats data', () => {
    it.each(boatDataPaths)('%s', (imagePath) => {
      expect(fileExists(imagePath)).toBe(true);
    });
  });

  describe('boat gallery (exterior)', () => {
    it.each(exteriorImages.map(i => i.src))('%s', (imagePath) => {
      expect(fileExists(imagePath)).toBe(true);
    });
  });

  describe('boat gallery (interior)', () => {
    it.each(interiorImages.map(i => i.src))('%s', (imagePath) => {
      expect(fileExists(imagePath)).toBe(true);
    });
  });

  describe('boat gallery (cockpit)', () => {
    it.each(cockpitImages.map(i => i.src))('%s', (imagePath) => {
      expect(fileExists(imagePath)).toBe(true);
    });
  });

  describe('boat gallery (drone)', () => {
    it.each(droneImages.map(i => i.src))('%s', (imagePath) => {
      expect(fileExists(imagePath)).toBe(true);
    });
  });

  describe('boat gallery (activities)', () => {
    it.each(activityImages.map(i => i.src))('%s', (imagePath) => {
      expect(fileExists(imagePath)).toBe(true);
    });
  });

  describe('boat gallery (food)', () => {
    it.each(foodImages.map(i => i.src))('%s', (imagePath) => {
      expect(fileExists(imagePath)).toBe(true);
    });
  });

  describe('shared components', () => {
    it.each(componentPaths)('%s', (imagePath) => {
      expect(fileExists(imagePath)).toBe(true);
    });
  });
});
