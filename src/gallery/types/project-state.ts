export interface ProjectState {
  id: string;
  title?: string;
  body?: string;
  date: number;
  startDate?: number;
  endDate?: number;
  imagesUrls: string[];
  acceptanceCriteria?: Array<{ id: string; text: string }>;
  withAcceptanceCriteria?: boolean;
  milestones?: Array<{ id: string; name: string; date: number; description?: string }>;
}
