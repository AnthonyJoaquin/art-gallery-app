import { collection, getDocs } from 'firebase/firestore';

import { FirebaseDB } from '../firebase/config';
import type { ProjectState } from '../gallery/types/project-state';

export const loadProjects = async (uid: string): Promise<ProjectState[]> => {
  const collectionRef = collection(FirebaseDB, `${uid}/gallery/projects`);
  const docs = await getDocs(collectionRef);

  const projects: ProjectState[] = [];

  docs.forEach((doc) => {
    const projectDoc = doc.data() as ProjectState;
    projects.push({ ...projectDoc, id: projectDoc.id });
  });

  return projects;
};
