export interface ProjectState {
  id: string;
  title?: string;
  body?: string;
  date: number;
  // ECUS 02: Project timeline dates for milestones
  startDate?: number;
  endDate?: number;
  imagesUrls: string[];
  // ECUS 01: Acceptance criteria for deliverables
  acceptanceCriteria?: Array<{ id: string; text: string }>;
  withAcceptanceCriteria?: boolean;
  // ECUS 02: Project milestones with timeline tracking
  milestones?: Array<{ id: string; name: string; date: number; description?: string }>;
}
