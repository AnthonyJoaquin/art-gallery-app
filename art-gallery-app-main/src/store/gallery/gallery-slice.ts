import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GalleryState } from '../../gallery/types/gallery-state';
import type { ProjectState } from '../../gallery/types/project-state';

const initialState: GalleryState = {
  isSaving: false,
  savedMessage: '',
  projects: [],
  active: null,
};

export const gallerySlice = createSlice({
  name: 'gallery',
  initialState: initialState,
  reducers: {
    savingNewProject: (state) => {
      state.isSaving = true;
    },

    addNewEntryProject: (state, action: PayloadAction<ProjectState>) => {
      state.projects.push(action.payload);
      state.isSaving = false;
    },

    setActiveProject: (state, action: PayloadAction<ProjectState>) => {
      state.active = action.payload;
      state.savedMessage = '';
    },

    setProjets: (state, action: PayloadAction<ProjectState[]>) => {
      state.projects = action.payload;
    },

    setSaving: (state) => {
      state.isSaving = true;
      state.savedMessage = '';
    },

    updatedProject: (state, action: PayloadAction<ProjectState>) => {
      state.isSaving = false;
      state.projects = state.projects.map((project) => {
        if (project.id === action.payload.id) return action.payload;
        return project;
      });

      state.savedMessage = `${action.payload.title}, actualizada correctamente`;
    },

    setPhotosToActiveProject: (state, action: PayloadAction<string[]>) => {
      state.active!.imagesUrls = [
        ...state.active!.imagesUrls,
        ...action.payload,
      ];
      state.isSaving = false;
    },

    clearProjectsLogout: (state) => {
      state.isSaving = false;
      state.savedMessage = '';
      state.projects = [];
      state.active = null;
    },

    deleteProyectById: (state, action) => {
      state.active = null;
      state.projects = state.projects.filter(
        (project) => project.id != action.payload
      );
    },
  },
});

export const {
  savingNewProject,
  addNewEntryProject,
  setActiveProject,
  setProjets,
  setSaving,
  updatedProject,
  setPhotosToActiveProject,
  clearProjectsLogout,
  deleteProyectById,
} = gallerySlice.actions;
