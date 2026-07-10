/**
 * Centralized boat image manifest for BlueOne yacht
 * Organized by category with metadata for filtering and optimization
 */

export type ImageCategory = 'exterior' | 'interior' | 'cockpit' | 'drone' | 'activities' | 'food';

export interface BoatImage {
  id: string;
  src: string;
  alt: string;
  category: ImageCategory;
  featured?: boolean;
  title?: string;
  description?: string;
}

// Exterior images - water, sky, sailing shots
export const exteriorImages: BoatImage[] = [
  // === Featured exterior (shown in curated section) ===
  { id: 'ext-001', src: '/images/boat/IMG_0025_NEW.JPG', alt: 'BlueOne sailing with pristine water', category: 'exterior', featured: true, title: 'Pristine Waters', description: 'BlueOne cutting through crystal clear Aegean waters' },
  { id: 'ext-002', src: '/images/boat/IMG_0026_NEW.JPG', alt: 'BlueOne exterior sailing view', category: 'exterior', featured: true, title: 'Sailing Profile', description: 'Elegant profile of the BlueOne catamaran under sail' },
  { id: 'ext-003', src: '/images/boat/IMG_9965_NEW.JPG', alt: 'BlueOne exterior detail', category: 'exterior', featured: true, title: 'Exterior Detail', description: 'Detailed exterior view showcasing yacht design' },
  { id: 'ext-004', src: '/images/boat/IMG_9970_NEW.JPG', alt: 'BlueOne exterior profile', category: 'exterior', featured: true, title: 'Yacht Profile', description: 'Premium exterior profile of the luxury catamaran' },
  // === Additional exterior photos ===
  { id: 'ext-005', src: '/images/boat/IMG_0027_NEW.JPG', alt: 'BlueOne exterior angle 1', category: 'exterior' },
  { id: 'ext-006', src: '/images/boat/IMG_9968_NEW.JPG', alt: 'BlueOne exterior angle 2', category: 'exterior' },
  // Original exterior collection
  { id: 'ext-008', src: '/images/boat/IMG_7545.JPG', alt: 'BlueOne original exterior 1', category: 'exterior' },
  { id: 'ext-009', src: '/images/boat/IMG_7546.JPG', alt: 'BlueOne original exterior 2', category: 'exterior' },
  { id: 'ext-010', src: '/images/boat/IMG_7547.JPG', alt: 'BlueOne original exterior 3', category: 'exterior' },
  { id: 'ext-011', src: '/images/boat/IMG_7549.JPG', alt: 'BlueOne original exterior 4', category: 'exterior' },
  { id: 'ext-012', src: '/images/boat/IMG_7553.JPG', alt: 'BlueOne original exterior 5', category: 'exterior' },
  { id: 'ext-013', src: '/images/boat/IMG_7554.jpg', alt: 'BlueOne original exterior 6', category: 'exterior' },
  { id: 'ext-014', src: '/images/boat/IMG_7555.JPG', alt: 'BlueOne original exterior 7', category: 'exterior' },
  { id: 'ext-015', src: '/images/boat/IMG_7556.JPG', alt: 'BlueOne original exterior 8', category: 'exterior' },
  { id: 'ext-016', src: '/images/boat/IMG_7557.JPG', alt: 'BlueOne original exterior 9', category: 'exterior' },
  { id: 'ext-017', src: '/images/boat/IMG_7559.JPG', alt: 'BlueOne original exterior 10', category: 'exterior' },
  { id: 'ext-018', src: '/images/boat/IMG_7561.JPG', alt: 'BlueOne original exterior 11', category: 'exterior' },
  { id: 'ext-019', src: '/images/boat/IMG_7562.JPG', alt: 'BlueOne original exterior 12', category: 'exterior' },
  { id: 'ext-020', src: '/images/boat/IMG_7563.JPG', alt: 'BlueOne original exterior 13', category: 'exterior' },
  { id: 'ext-021', src: '/images/boat/IMG_7564.JPG', alt: 'BlueOne original exterior 14', category: 'exterior' },
  { id: 'ext-022', src: '/images/boat/IMG_7565.JPG', alt: 'BlueOne original exterior 15', category: 'exterior' },
  { id: 'ext-023', src: '/images/boat/IMG_7566.JPG', alt: 'BlueOne original exterior 16', category: 'exterior' },
  { id: 'ext-024', src: '/images/boat/IMG_7567.JPG', alt: 'BlueOne original exterior 17', category: 'exterior' },
  { id: 'ext-025', src: '/images/boat/IMG_7568.JPG', alt: 'BlueOne original exterior 18', category: 'exterior' },
];

// Interior images - cabins, bedrooms, saloon
export const interiorImages: BoatImage[] = [
  // === Featured interior (shown in curated section) ===
  { id: 'int-001', src: '/images/boat/IMG_7569.JPG', alt: 'BlueOne cabin luxury interior', category: 'interior', featured: true, title: 'Master Cabin', description: 'Spacious master cabin with hotel-grade comfort' },
  { id: 'int-002', src: '/images/boat/IMG_7570.JPG', alt: 'BlueOne interior design detail', category: 'interior', featured: true, title: 'Interior Design', description: 'Elegant interior design elements and finishes' },
  { id: 'int-003', src: '/images/boat/IMG_7571.JPG', alt: 'BlueOne saloon living space', category: 'interior', featured: true, title: 'Saloon Living', description: 'Light-filled saloon with panoramic views' },
  { id: 'int-004', src: '/images/boat/IMG_7572.JPG', alt: 'BlueOne guest cabin comfort', category: 'interior', featured: true, title: 'Guest Cabin', description: 'Comfortable guest cabin with private en-suite' },
  // === Additional interior photos ===
  { id: 'int-005', src: '/images/boat/IMG_7573.JPG', alt: 'BlueOne interior 5', category: 'interior' },
  { id: 'int-006', src: '/images/boat/IMG_7579.JPG', alt: 'BlueOne interior 6', category: 'interior' },
  { id: 'int-007', src: '/images/boat/IMG_7580.JPG', alt: 'BlueOne interior 7', category: 'interior' },
  { id: 'int-008', src: '/images/boat/IMG_7581.JPG', alt: 'BlueOne interior 8', category: 'interior' },
  { id: 'int-009', src: '/images/boat/IMG_7582.JPG', alt: 'BlueOne interior 9', category: 'interior' },
  { id: 'int-010', src: '/images/boat/IMG_7584.JPG', alt: 'BlueOne interior 10', category: 'interior' },
  { id: 'int-011', src: '/images/boat/IMG_7585.JPG', alt: 'BlueOne interior 11', category: 'interior' },
  { id: 'int-012', src: '/images/boat/IMG_7586.JPG', alt: 'BlueOne interior 12', category: 'interior' },
  { id: 'int-013', src: '/images/boat/IMG_7587.JPG', alt: 'BlueOne interior 13', category: 'interior' },
  { id: 'int-014', src: '/images/boat/IMG_7588.JPG', alt: 'BlueOne interior 14', category: 'interior' },
  { id: 'int-015', src: '/images/boat/IMG_7589.JPG', alt: 'BlueOne interior 15', category: 'interior' },
  { id: 'int-016', src: '/images/boat/IMG_7590.JPG', alt: 'BlueOne interior 16', category: 'interior' },
  { id: 'int-017', src: '/images/boat/IMG_7591.JPG', alt: 'BlueOne interior 17', category: 'interior' },
  { id: 'int-018', src: '/images/boat/IMG_7592.JPG', alt: 'BlueOne interior 18', category: 'interior' },
];

// Cockpit & dining images - deck, entertaining, dining spaces
export const cockpitImages: BoatImage[] = [
  // === Featured cockpit/dining (shown in curated section) ===
  { id: 'ckp-001', src: '/images/boat/IMG_0012_NEW.JPG', alt: 'BlueOne premium deck dining', category: 'cockpit', featured: true, title: 'Deck Dining', description: 'Premium outdoor dining on the spacious cockpit' },
  { id: 'ckp-002', src: '/images/boat/IMG_0013_NEW.JPG', alt: 'BlueOne dining ambiance', category: 'cockpit', featured: true, title: 'Dining Ambiance', description: 'Beautiful evening dining setup with sea views' },
  { id: 'ckp-003', src: '/images/boat/IMG_0014_NEW.JPG', alt: 'BlueOne outdoor seating', category: 'cockpit', featured: true, title: 'Seating Area', description: 'Comfortable outdoor seating and lounge space' },
  { id: 'ckp-004', src: '/images/boat/IMG_0010_NEW.JPG', alt: 'BlueOne outdoor dining setup', category: 'cockpit', featured: true, title: 'Outdoor Entertainment', description: 'Full outdoor entertainment and dining facility' },
  // === Additional cockpit/dining photos ===
  { id: 'ckp-005', src: '/images/boat/IMG_0001_NEW.JPG', alt: 'BlueOne cockpit view 1', category: 'cockpit' },
  { id: 'ckp-006', src: '/images/boat/IMG_0004_NEW.JPG', alt: 'BlueOne cockpit view 2', category: 'cockpit' },
  { id: 'ckp-007', src: '/images/boat/IMG_0005_NEW.JPG', alt: 'BlueOne cockpit view 3', category: 'cockpit' },
  { id: 'ckp-008', src: '/images/boat/IMG_0006_NEW.JPG', alt: 'BlueOne cockpit view 4', category: 'cockpit' },
  { id: 'ckp-009', src: '/images/boat/IMG_0007_NEW.JPG', alt: 'BlueOne cockpit view 5', category: 'cockpit' },
  { id: 'ckp-010', src: '/images/boat/IMG_0008_NEW.JPG', alt: 'BlueOne cockpit view 6', category: 'cockpit' },
  { id: 'ckp-011', src: '/images/boat/IMG_0016_NEW.JPG', alt: 'BlueOne cockpit view 7', category: 'cockpit' },
  { id: 'ckp-012', src: '/images/boat/IMG_0019_NEW.JPG', alt: 'BlueOne cockpit view 8', category: 'cockpit' },
  { id: 'ckp-013', src: '/images/boat/IMG_0021_NEW.JPG', alt: 'BlueOne cockpit view 9', category: 'cockpit' },
  { id: 'ckp-014', src: '/images/boat/IMG_9960_NEW.JPG', alt: 'BlueOne cockpit view 10', category: 'cockpit' },
  { id: 'ckp-015', src: '/images/boat/IMG_9961_NEW.JPG', alt: 'BlueOne cockpit view 11', category: 'cockpit' },
  // Original cockpit collection
  { id: 'ckp-016', src: '/images/boat/IMG_7593.JPG', alt: 'BlueOne original cockpit 1', category: 'cockpit' },
  { id: 'ckp-017', src: '/images/boat/IMG_7594.JPG', alt: 'BlueOne original cockpit 2', category: 'cockpit' },
  { id: 'ckp-018', src: '/images/boat/IMG_7595.JPG', alt: 'BlueOne original cockpit 3', category: 'cockpit' },
  { id: 'ckp-019', src: '/images/boat/IMG_7596.JPG', alt: 'BlueOne original cockpit 4', category: 'cockpit' },
  { id: 'ckp-020', src: '/images/boat/IMG_7600.JPG', alt: 'BlueOne original cockpit 5', category: 'cockpit' },
  { id: 'ckp-021', src: '/images/boat/IMG_7601.JPG', alt: 'BlueOne original cockpit 6', category: 'cockpit' },
  { id: 'ckp-022', src: '/images/boat/IMG_7602.JPG', alt: 'BlueOne original cockpit 7', category: 'cockpit' },
  { id: 'ckp-023', src: '/images/boat/IMG_7603.JPG', alt: 'BlueOne original cockpit 8', category: 'cockpit' },
  { id: 'ckp-024', src: '/images/boat/IMG_7604.JPG', alt: 'BlueOne original cockpit 9', category: 'cockpit' },
  { id: 'ckp-025', src: '/images/boat/IMG_7605.JPG', alt: 'BlueOne original cockpit 10', category: 'cockpit' },
  { id: 'ckp-026', src: '/images/boat/IMG_7606.JPG', alt: 'BlueOne original cockpit 11', category: 'cockpit' },
  { id: 'ckp-027', src: '/images/boat/IMG_7607.JPG', alt: 'BlueOne original cockpit 12', category: 'cockpit' },
  { id: 'ckp-028', src: '/images/boat/IMG_7608.JPG', alt: 'BlueOne original cockpit 13', category: 'cockpit' },
  { id: 'ckp-029', src: '/images/boat/IMG_7609.JPG', alt: 'BlueOne original cockpit 14', category: 'cockpit' },
  { id: 'ckp-030', src: '/images/boat/IMG_7610.JPG', alt: 'BlueOne original cockpit 15', category: 'cockpit' },
  { id: 'ckp-031', src: '/images/boat/IMG_7611.JPG', alt: 'BlueOne original cockpit 16', category: 'cockpit' },
  { id: 'ckp-032', src: '/images/boat/IMG_7612.JPG', alt: 'BlueOne original cockpit 17', category: 'cockpit' },
  { id: 'ckp-033', src: '/images/boat/IMG_7613.JPG', alt: 'BlueOne original cockpit 18', category: 'cockpit' },
];

// Drone aerial images
export const droneImages: BoatImage[] = [
  { id: 'drn-001', src: '/images/boat/DJI_20260511084346_0008_D.JPG', alt: 'BlueOne aerial view 1', category: 'drone', featured: true },
  { id: 'drn-002', src: '/images/boat/DJI_20260511084428_0009_D.JPG', alt: 'BlueOne aerial view 2', category: 'drone', featured: true },
  { id: 'drn-003', src: '/images/boat/DJI_20260511084433_0010_D.JPG', alt: 'BlueOne aerial view 3', category: 'drone', featured: true },
  { id: 'drn-004', src: '/images/boat/DJI_20260511084454_0011_D.JPG', alt: 'BlueOne aerial view 4', category: 'drone' },
  { id: 'drn-005', src: '/images/boat/DJI_20260511084457_0012_D.JPG', alt: 'BlueOne aerial view 5', category: 'drone' },
  { id: 'drn-006', src: '/images/boat/DJI_20260512133237_0013_D.JPG', alt: 'BlueOne aerial view 6', category: 'drone' },
  { id: 'drn-007', src: '/images/boat/DJI_20260512133247_0014_D.JPG', alt: 'BlueOne aerial view 7', category: 'drone' },
  { id: 'drn-008', src: '/images/boat/DJI_20260512133415_0015_D.JPG', alt: 'BlueOne aerial view 8', category: 'drone' },
  { id: 'drn-009', src: '/images/boat/DJI_20260512133432_0016_D.JPG', alt: 'BlueOne aerial view 9', category: 'drone' },
  { id: 'drn-010', src: '/images/boat/DJI_20260512133439_0017_D.JPG', alt: 'BlueOne aerial view 10', category: 'drone' },
  { id: 'drn-011', src: '/images/boat/DJI_20260512133510_0018_D.JPG', alt: 'BlueOne aerial view 11', category: 'drone' },
  { id: 'drn-012', src: '/images/boat/DJI_20260512133513_0019_D.JPG', alt: 'BlueOne aerial view 12', category: 'drone' },
  { id: 'drn-013', src: '/images/boat/DJI_20260512133534_0020_D.JPG', alt: 'BlueOne aerial view 13', category: 'drone' },
  { id: 'drn-014', src: '/images/boat/DJI_20260512133536_0021_D.JPG', alt: 'BlueOne aerial view 14', category: 'drone' },
  { id: 'drn-015', src: '/images/boat/DJI_20260512133553_0022_D.JPG', alt: 'BlueOne aerial view 15', category: 'drone' },
  { id: 'drn-016', src: '/images/boat/DJI_20260512133601_0023_D.JPG', alt: 'BlueOne aerial view 16', category: 'drone' },
  { id: 'drn-017', src: '/images/boat/DJI_20260512133607_0024_D.JPG', alt: 'BlueOne aerial view 17', category: 'drone' },
];

// Activities & amenities
export const activityImages: BoatImage[] = [
  { id: 'act-001', src: '/images/boats/blueone/Seabob_1.jpeg', alt: 'BlueOne Seabob water toy', category: 'activities', title: 'Seabob Experience' },
  { id: 'act-002', src: '/images/boats/blueone/seabob-f5s-pic-1-1.jpg', alt: 'Seabob water activity', category: 'activities', title: 'Water Adventures' },
  { id: 'act-003', src: '/images/boats/blueone/snorkeling.png', alt: 'BlueOne snorkeling', category: 'activities', title: 'Snorkeling' },
  { id: 'act-004', src: '/images/boats/blueone/SUP_Relax.png', alt: 'Stand-up paddleboard relaxation', category: 'activities', title: 'SUP Relaxation' },
  { id: 'act-005', src: '/images/boats/blueone/SUP_Yoga.png', alt: 'SUP yoga activity', category: 'activities', title: 'Wellness Activities' },
];

// Culinary experiences
export const foodImages: BoatImage[] = [
  { id: 'food-001', src: '/images/boat/culinary_gourmet.jpg', alt: 'Chef gourmet plated dish', category: 'food', featured: true, title: 'Award-Winning Cuisine' },
  { id: 'food-002', src: '/images/boats/blueone/food_1.jpeg', alt: 'Mediterranean cuisine', category: 'food', featured: true, title: 'Mediterranean Flavors' },
  { id: 'food-003', src: '/images/boats/blueone/food_2.jpeg', alt: 'Gourmet preparation', category: 'food', featured: true, title: 'Culinary Excellence' },
  { id: 'food-004', src: '/images/boat/breakfast.jpg', alt: 'Gourmet breakfast experience', category: 'food', featured: true, title: 'Morning Delights' },
  { id: 'food-005', src: '/images/boats/blueone/Actu-2-Aura51-Cockpit-Table.avif', alt: 'Cockpit dining table setup', category: 'food', title: 'Outdoor Dining' },
];

// Photoshoot 2026 — professional session (51 photos), classified by category.
// Registered here so they appear in the admin Photo Manager and the public
// gallery, and can be flagged as key photos like any other image.
export const photoshootImages: BoatImage[] = [
  { id: 'ps-ext-001', src: '/images/boats/blueone/photos_shoot/DSC_0357.jpg', alt: 'BlueOne photoshoot — exterior 1', category: 'exterior' },
  { id: 'ps-ext-002', src: '/images/boats/blueone/photos_shoot/DSC_0367.jpg', alt: 'BlueOne photoshoot — exterior 2', category: 'exterior' },
  { id: 'ps-ext-003', src: '/images/boats/blueone/photos_shoot/DSC_0341.jpg', alt: 'BlueOne photoshoot — exterior 3', category: 'exterior' },
  { id: 'ps-ext-004', src: '/images/boats/blueone/photos_shoot/DSC_0353.jpg', alt: 'BlueOne photoshoot — exterior 4', category: 'exterior' },
  { id: 'ps-ext-005', src: '/images/boats/blueone/photos_shoot/DSC_0398.jpg', alt: 'BlueOne photoshoot — exterior 5', category: 'exterior' },
  { id: 'ps-ext-006', src: '/images/boats/blueone/photos_shoot/DSC_0381.jpg', alt: 'BlueOne photoshoot — exterior 6', category: 'exterior' },
  { id: 'ps-ext-007', src: '/images/boats/blueone/photos_shoot/DSC_0216.jpg', alt: 'BlueOne photoshoot — exterior 7', category: 'exterior' },
  { id: 'ps-ext-008', src: '/images/boats/blueone/photos_shoot/DSC_0034.jpg', alt: 'BlueOne photoshoot — exterior 8', category: 'exterior' },
  { id: 'ps-ext-009', src: '/images/boats/blueone/photos_shoot/DSC_0180.jpg', alt: 'BlueOne photoshoot — exterior 9', category: 'exterior' },
  { id: 'ps-ckp-001', src: '/images/boats/blueone/photos_shoot/DSC_0165.jpg', alt: 'BlueOne photoshoot — cockpit & dining 1', category: 'cockpit' },
  { id: 'ps-ckp-002', src: '/images/boats/blueone/photos_shoot/DSC_0151.jpg', alt: 'BlueOne photoshoot — cockpit & dining 2', category: 'cockpit' },
  { id: 'ps-ckp-003', src: '/images/boats/blueone/photos_shoot/DSC_0170.jpg', alt: 'BlueOne photoshoot — cockpit & dining 3', category: 'cockpit' },
  { id: 'ps-ckp-004', src: '/images/boats/blueone/photos_shoot/DSC_0176.jpg', alt: 'BlueOne photoshoot — cockpit & dining 4', category: 'cockpit' },
  { id: 'ps-ckp-005', src: '/images/boats/blueone/photos_shoot/DSC_0202.jpg', alt: 'BlueOne photoshoot — cockpit & dining 5', category: 'cockpit' },
  { id: 'ps-ckp-006', src: '/images/boats/blueone/photos_shoot/DSC_0043.jpg', alt: 'BlueOne photoshoot — cockpit & dining 6', category: 'cockpit' },
  { id: 'ps-ckp-007', src: '/images/boats/blueone/photos_shoot/DSC_0242.jpg', alt: 'BlueOne photoshoot — cockpit & dining 7', category: 'cockpit' },
  { id: 'ps-ckp-008', src: '/images/boats/blueone/photos_shoot/DSC_0274.jpg', alt: 'BlueOne photoshoot — cockpit & dining 8', category: 'cockpit' },
  { id: 'ps-ckp-009', src: '/images/boats/blueone/photos_shoot/DSC_9796.jpg', alt: 'BlueOne photoshoot — cockpit & dining 9', category: 'cockpit' },
  { id: 'ps-ckp-010', src: '/images/boats/blueone/photos_shoot/DSC_9801.jpg', alt: 'BlueOne photoshoot — cockpit & dining 10', category: 'cockpit' },
  { id: 'ps-ckp-011', src: '/images/boats/blueone/photos_shoot/DSC_9813.jpg', alt: 'BlueOne photoshoot — cockpit & dining 11', category: 'cockpit' },
  { id: 'ps-ckp-012', src: '/images/boats/blueone/photos_shoot/DSC_9846.jpg', alt: 'BlueOne photoshoot — cockpit & dining 12', category: 'cockpit' },
  { id: 'ps-ckp-013', src: '/images/boats/blueone/photos_shoot/DSC_9841.jpg', alt: 'BlueOne photoshoot — cockpit & dining 13', category: 'cockpit' },
  { id: 'ps-ckp-014', src: '/images/boats/blueone/photos_shoot/DSC_9823.jpg', alt: 'BlueOne photoshoot — cockpit & dining 14', category: 'cockpit' },
  { id: 'ps-ckp-015', src: '/images/boats/blueone/photos_shoot/DSC_9832.jpg', alt: 'BlueOne photoshoot — cockpit & dining 15', category: 'cockpit' },
  { id: 'ps-ckp-016', src: '/images/boats/blueone/photos_shoot/DSC_9838.jpg', alt: 'BlueOne photoshoot — cockpit & dining 16', category: 'cockpit' },
  { id: 'ps-int-001', src: '/images/boats/blueone/photos_shoot/DSC_0008.jpg', alt: 'BlueOne photoshoot — interior 1', category: 'interior' },
  { id: 'ps-int-002', src: '/images/boats/blueone/photos_shoot/DSC_0026.jpg', alt: 'BlueOne photoshoot — interior 2', category: 'interior' },
  { id: 'ps-int-003', src: '/images/boats/blueone/photos_shoot/DSC_9980.jpg', alt: 'BlueOne photoshoot — interior 3', category: 'interior' },
  { id: 'ps-int-004', src: '/images/boats/blueone/photos_shoot/DSC_9990.jpg', alt: 'BlueOne photoshoot — interior 4', category: 'interior' },
  { id: 'ps-int-005', src: '/images/boats/blueone/photos_shoot/DSC_0270.jpg', alt: 'BlueOne photoshoot — interior 5', category: 'interior' },
  { id: 'ps-int-006', src: '/images/boats/blueone/photos_shoot/DSC_9997.jpg', alt: 'BlueOne photoshoot — interior 6', category: 'interior' },
  { id: 'ps-int-007', src: '/images/boats/blueone/photos_shoot/DSC_0302.jpg', alt: 'BlueOne photoshoot — interior 7', category: 'interior' },
  { id: 'ps-int-008', src: '/images/boats/blueone/photos_shoot/DSC_9893.jpg', alt: 'BlueOne photoshoot — interior 8', category: 'interior' },
  { id: 'ps-int-009', src: '/images/boats/blueone/photos_shoot/DSC_9927.jpg', alt: 'BlueOne photoshoot — interior 9', category: 'interior' },
  { id: 'ps-int-010', src: '/images/boats/blueone/photos_shoot/DSC_9659.jpg', alt: 'BlueOne photoshoot — interior 10', category: 'interior' },
  { id: 'ps-int-011', src: '/images/boats/blueone/photos_shoot/DSC_9740.jpg', alt: 'BlueOne photoshoot — interior 11', category: 'interior' },
  { id: 'ps-int-012', src: '/images/boats/blueone/photos_shoot/DSC_9858.jpg', alt: 'BlueOne photoshoot — interior 12', category: 'interior' },
  { id: 'ps-int-013', src: '/images/boats/blueone/photos_shoot/DSC_9864.jpg', alt: 'BlueOne photoshoot — interior 13', category: 'interior' },
  { id: 'ps-int-014', src: '/images/boats/blueone/photos_shoot/DSC_9874.jpg', alt: 'BlueOne photoshoot — interior 14', category: 'interior' },
  { id: 'ps-int-015', src: '/images/boats/blueone/photos_shoot/DSC_9881.jpg', alt: 'BlueOne photoshoot — interior 15', category: 'interior' },
  { id: 'ps-int-016', src: '/images/boats/blueone/photos_shoot/DSC_9709.jpg', alt: 'BlueOne photoshoot — interior 16', category: 'interior' },
  { id: 'ps-int-017', src: '/images/boats/blueone/photos_shoot/DSC_0320.jpg', alt: 'BlueOne photoshoot — interior 17', category: 'interior' },
  { id: 'ps-int-018', src: '/images/boats/blueone/photos_shoot/DSC_9662.jpg', alt: 'BlueOne photoshoot — interior 18', category: 'interior' },
  { id: 'ps-int-019', src: '/images/boats/blueone/photos_shoot/DSC_9746.jpg', alt: 'BlueOne photoshoot — interior 19', category: 'interior' },
  { id: 'ps-int-020', src: '/images/boats/blueone/photos_shoot/DSC_9681.jpg', alt: 'BlueOne photoshoot — interior 20', category: 'interior' },
  { id: 'ps-int-021', src: '/images/boats/blueone/photos_shoot/DSC_9694.jpg', alt: 'BlueOne photoshoot — interior 21', category: 'interior' },
  { id: 'ps-int-022', src: '/images/boats/blueone/photos_shoot/DSC_9724.jpg', alt: 'BlueOne photoshoot — interior 22', category: 'interior' },
  { id: 'ps-int-023', src: '/images/boats/blueone/photos_shoot/DSC_9726.jpg', alt: 'BlueOne photoshoot — interior 23', category: 'interior' },
  { id: 'ps-int-024', src: '/images/boats/blueone/photos_shoot/DSC_9902.jpg', alt: 'BlueOne photoshoot — interior 24', category: 'interior' },
  { id: 'ps-act-001', src: '/images/boats/blueone/photos_shoot/DSC_0077.jpg', alt: 'BlueOne photoshoot — water toys 1', category: 'activities' },
  { id: 'ps-act-002', src: '/images/boats/blueone/photos_shoot/DSC_9848.jpg', alt: 'BlueOne photoshoot — water toys 2', category: 'activities' },
];

/**
 * Get all images by category
 */
export function getImagesByCategory(category: ImageCategory): BoatImage[] {
  const base = (() => {
    switch (category) {
      case 'exterior':
        return exteriorImages;
      case 'interior':
        return interiorImages;
      case 'cockpit':
        return cockpitImages;
      case 'drone':
        return droneImages;
      case 'activities':
        return activityImages;
      case 'food':
        return foodImages;
      default:
        return [];
    }
  })();
  return [...base, ...photoshootImages.filter(img => img.category === category)];
}

/**
 * Get featured images by category
 */
export function getFeaturedImages(category?: ImageCategory): BoatImage[] {
  if (!category) {
    // Get featured from all categories
    return [
      ...exteriorImages.filter(img => img.featured),
      ...interiorImages.filter(img => img.featured),
      ...cockpitImages.filter(img => img.featured),
      ...droneImages.filter(img => img.featured),
      ...activityImages.filter(img => img.featured),
      ...foodImages.filter(img => img.featured),
    ];
  }
  return getImagesByCategory(category).filter(img => img.featured);
}

/**
 * Get all images
 */
export function getAllImages(): BoatImage[] {
  return [
    ...exteriorImages,
    ...interiorImages,
    ...cockpitImages,
    ...droneImages,
    ...activityImages,
    ...foodImages,
    ...photoshootImages,
  ];
}
