import { beforeEach, describe, expect, test, vi } from 'vitest';
import { startSavingProject } from './thunks';

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    doc: vi.fn((..._args: any[]) => ({ _mockDoc: true })),
    setDoc: vi.fn(async () => true),
  };
});

describe('thunks (gallery) - dates', () => {
  beforeEach(() => vi.clearAllMocks());

  test('startSavingProject debe persistir startDate y endDate en firestore', async () => {
    const dispatch = vi.fn();
    const project = {
      id: 'PID',
      title: 'P',
      body: 'B',
      date: 1,
      startDate: 1000,
      endDate: 2000,
      imagesUrls: [],
      acceptanceCriteria: [],
      withAcceptanceCriteria: false,
      milestones: [],
    } as any;

    const getState = () => ({ auth: { uid: 'UID' }, gallery: { active: project } });

    await startSavingProject()(dispatch, getState as any);

    const { setDoc } = await import('firebase/firestore');
    expect(setDoc).toHaveBeenCalled();
    const saved = (setDoc as any).mock.calls[0][1];
    expect(saved.startDate).toBe(1000);
    expect(saved.endDate).toBe(2000);
  });
});
