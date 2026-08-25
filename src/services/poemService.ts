import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  getDocs, 
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Poem } from '../types';
import { POEMS as INITIAL_POEMS } from '../data/poems';

const POEMS_COLLECTION = 'poems';

export function subscribeToPoems(
  onUpdate: (poems: Poem[]) => void, 
  onError: (error: Error) => void
) {
  const colRef = collection(db, POEMS_COLLECTION);
  
  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Automatically seed initial poems into Firestore if collection is empty
        try {
          await seedInitialPoems();
        } catch (err) {
          console.error('Error auto-seeding poems:', err);
          // Fallback to local
          onUpdate(INITIAL_POEMS);
        }
        return;
      }

      const poems: Poem[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          content: Array.isArray(data.content) ? data.content : (data.content ? String(data.content).split('\n') : []),
          poet: data.poet || '',
          category: data.category || 'Diğer',
          createdAt: data.createdAt || Date.now(),
          orderIndex: data.orderIndex !== undefined ? data.orderIndex : 9999,
        };
      });

      // Sort by orderIndex if available, else by title or createdAt
      poems.sort((a, b) => {
        if (a.orderIndex !== undefined && b.orderIndex !== undefined && a.orderIndex !== b.orderIndex) {
          return a.orderIndex - b.orderIndex;
        }
        return (b.createdAt || 0) - (a.createdAt || 0);
      });

      onUpdate(poems);
    },
    (err) => {
      console.error('Firestore subscription error:', err);
      onError(err);
    }
  );
}

export async function seedInitialPoems() {
  const batch = writeBatch(db);
  const colRef = collection(db, POEMS_COLLECTION);
  
  INITIAL_POEMS.forEach((poem, index) => {
    const docRef = doc(colRef, poem.id);
    batch.set(docRef, {
      title: poem.title,
      content: poem.content,
      poet: poem.poet,
      category: poem.category,
      createdAt: Date.now() - (INITIAL_POEMS.length - index) * 1000,
      orderIndex: index,
    });
  });

  await batch.commit();
}

export async function createPoem(poemData: Omit<Poem, 'id'>): Promise<string> {
  const colRef = collection(db, POEMS_COLLECTION);
  const docRef = doc(colRef);
  const newId = docRef.id;

  await setDoc(docRef, {
    title: poemData.title.trim(),
    content: poemData.content,
    poet: poemData.poet.trim(),
    category: poemData.category.trim(),
    createdAt: Date.now(),
    orderIndex: poemData.orderIndex ?? Date.now(),
  });

  return newId;
}

export async function updatePoem(id: string, updates: Partial<Omit<Poem, 'id'>>) {
  const docRef = doc(db, POEMS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deletePoem(id: string) {
  const docRef = doc(db, POEMS_COLLECTION, id);
  await deleteDoc(docRef);
}
