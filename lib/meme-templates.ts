import {
  collection,
  getDocs,
  doc,
  getDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface MemeTemplate {
  id: string;
  name: string;
  image: string;
  width: number;
  height: number;
}

/**
 * Fetches all meme templates from the Firestore `templates` collection.
 * Each document should have: name (string), image (string URL), width (number), height (number).
 */
export async function getTemplates(): Promise<MemeTemplate[]> {
  const q = query(collection(db, "templates"), orderBy("name", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name ?? "",
      image: data.image ?? "",
      width: data.width ?? 800,
      height: data.height ?? 600,
    };
  });
}

/**
 * Fetches a single meme template by its Firestore document ID.
 */
export async function getTemplateById(
  id: string,
): Promise<MemeTemplate | null> {
  const docSnap = await getDoc(doc(db, "templates", id));

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name ?? "",
    image: data.image ?? "",
    width: data.width ?? 800,
    height: data.height ?? 600,
  };
}
