import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { getAllImages, type ImageCategory } from '@/app/constants/boat-images';

export interface PhotoMeta {
  id: string;
  src: string;
  category: ImageCategory;
  keyPhoto: boolean;
  title?: string;
  alt?: string;
  updatedAt?: unknown;
}

const COL = 'photo_meta';

export async function getAllPhotoMeta(): Promise<PhotoMeta[]> {
  const snap = await getDocs(collection(db, COL));
  const map = new Map<string, PhotoMeta>();
  snap.forEach(d => map.set(d.id, d.data() as PhotoMeta));
  return map.size ? Array.from(map.values()) : [];
}

export async function savePhotoMeta(meta: Omit<PhotoMeta, 'updatedAt'>): Promise<void> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta as Record<string, unknown>)) {
    if (v !== undefined) clean[k] = v;
  }
  await setDoc(doc(db, COL, meta.id), { ...clean, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deletePhotoMeta(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

/**
 * Merge static image manifest with Firestore overrides.
 * Firestore data wins for category / keyPhoto / title.
 */
export function mergeWithDefaults(overrides: PhotoMeta[]): PhotoMeta[] {
  const overrideMap = new Map(overrides.map(o => [o.id, o]));
  return getAllImages().map(img => {
    const o = overrideMap.get(img.id);
    return {
      id: img.id,
      src: img.src,
      alt: img.alt,
      title: o?.title ?? img.title ?? '',
      category: o?.category ?? img.category,
      keyPhoto: o?.keyPhoto ?? img.featured ?? false,
    };
  });
}
