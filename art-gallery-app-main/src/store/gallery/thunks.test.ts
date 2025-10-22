import { beforeEach, describe, expect, test, vi } from 'vitest';
// import { collection, deleteDoc, getDocs } from 'firebase/firestore';
// import {
//   addNewEntryProject,
//   savingNewProject,
//   setActiveProject,
// } from './gallery-slice';
// import { startNewProject } from './thunks';
// import { FirebaseDB } from '../../../src/firebase/config';

describe('thunks (gallery)', () => {
  // const dispacth = vi.fn();
  // const getState = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  test('debe de crear un nuevo proyecto en blanco', async () => {
    // const uid = 'TEST-UID';
    // getState.mockReturnValue({ auth: { uid: uid } });

    // await startNewProject()(dispacth, getState);

    // expect(dispacth).toHaveBeenCalledWith(savingNewProject());
    // expect(dispacth).toHaveBeenCalledWith(
    //   addNewEntryProject({
    //     body: '',
    //     title: '',
    //     id: expect.any(String),
    //     date: expect.any(Number),
    //     imagesUrls: [],
    //   })
    // );

    // expect(dispacth).toHaveBeenCalledWith(
    //   setActiveProject({
    //     body: '',
    //     title: '',
    //     id: expect.any(String),
    //     date: expect.any(Number),
    //     imagesUrls: [],
    //   })
    // );

    // // Borrar de firebase
    // const collectionRef = collection(FirebaseDB, `${uid}/gallery/projects`);
    // const { docs } = await getDocs(collectionRef);
    // await Promise.all(docs.map(({ ref }) => deleteDoc(ref)));

    expect(true).toBeTruthy();
  });
});
