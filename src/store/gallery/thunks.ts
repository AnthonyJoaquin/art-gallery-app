import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore';

import { FirebaseDB } from '../../firebase/config';

import type { AppDispach, RootState } from '../store';
import { fileUpload, loadProjects } from '../../helpers';

import {
  savingNewProject,
  addNewEntryProject,
  setActiveProject,
  setProjets,
  setSaving,
  updatedProject,
  setPhotosToActiveProject,
  deleteProyectById,
} from './gallery-slice';

export const startNewProject = () => {
  return async (dispatch: AppDispach, getState: () => RootState) => {
    dispatch(savingNewProject());

    const { uid } = getState().auth;

    const newDoc = doc(collection(FirebaseDB, `${uid}/gallery/projects`));

    const newProject = {
      id: newDoc.id,
      title: '',
      body: '',
      date: new Date().getTime(),
      startDate: new Date().getTime(),
      endDate: new Date().getTime(),
      imagesUrls: [],
      acceptanceCriteria: [],
      withAcceptanceCriteria: false,
      milestones: [],
    };

    await setDoc(newDoc, newProject);

    dispatch(addNewEntryProject(newProject));
    dispatch(setActiveProject(newProject));
  };
};

export const startLoadingProjects = () => {
  return async (dispatch: AppDispach, getState: () => RootState) => {
    const { uid } = getState().auth;
    if (!uid) throw new Error("UID doesn't exist");

    const projects = await loadProjects(uid);
    dispatch(setProjets(projects));
  };
};

export const startSavingProject = () => {
  return async (dispatch: AppDispach, getState: () => RootState) => {
    dispatch(setSaving());

    const { uid } = getState().auth;
    const { active: project } = getState().gallery;

    const projectToFirestore = { ...project };
    delete projectToFirestore.id;

    const docRef = doc(FirebaseDB, `${uid}/gallery/projects/${project!.id}`);
    await setDoc(docRef, projectToFirestore, { merge: true });

    dispatch(updatedProject(project!));
  };
};

export const startUploadingFiles = (files: FileList) => {
  return async (dispatch: AppDispach) => {
    dispatch(setSaving());

    const fileUploadPromises: Promise<string>[] = [];

    for (const file of files) {
      const filePath = fileUpload(file);

      if (!filePath) continue;

      fileUploadPromises.push(filePath);
    }

    const photosUrl = await Promise.all(fileUploadPromises);

    dispatch(setPhotosToActiveProject(photosUrl));
  };
};

export const startDeletingProject = () => {
  return async (dispatch: AppDispach, getState: () => RootState) => {
    const { uid } = getState().auth;
    const { active: project } = getState().gallery;

    const docRef = doc(FirebaseDB, `${uid}/gallery/projects/${project!.id}`);
    await deleteDoc(docRef);

    dispatch(deleteProyectById(project!.id));
  };
};
