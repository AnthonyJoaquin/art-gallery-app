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

describe('thunks (gallery)', () => {
  beforeEach(() => vi.clearAllMocks());

  test('startSavingProject debe enviar projectToFirestore sin id e incluir withAcceptanceCriteria', async () => {
    const dispatch = vi.fn();
    const project = {
      id: 'ABC123',
      title: 'P',
      body: 'B',
      date: 123,
      imagesUrls: [],
      acceptanceCriteria: [{ id: 'c1', text: 'OK' }],
      withAcceptanceCriteria: true,
    } as any;

    const getState = () => ({ auth: { uid: 'UID-TEST' }, gallery: { active: project } });

    await startSavingProject()(dispatch, getState as any);

    // import mocked functions
    const { setDoc, doc } = await import('firebase/firestore');

    expect(doc).toHaveBeenCalled();
    expect(setDoc).toHaveBeenCalled();

    const calledWithProject = (setDoc as any).mock.calls[0][1];
    expect(calledWithProject.id).toBeUndefined();
    expect(calledWithProject.withAcceptanceCriteria).toBe(true);

    // dispatch updatedProject was called (last dispatch)
    expect(dispatch).toHaveBeenCalled();
  });
});
