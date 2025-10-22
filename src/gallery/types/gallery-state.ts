import type { ProjectState } from './project-state';

export interface GalleryState {
  isSaving: boolean;
  savedMessage: string;
  projects: Array<ProjectState>;
  active: ProjectState | null;
}
