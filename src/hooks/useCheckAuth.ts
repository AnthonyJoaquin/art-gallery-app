import { useEffect } from 'react';

import { onAuthStateChanged } from 'firebase/auth';
import { FirebaseAuth } from '../firebase/config';
import { login, logout } from '../store/auth';
import { startLoadingProjects } from '../store/gallery';
import { useAppDispatch, useAppSelector } from '../store/reduxHooks';

export const useCheckAuth = () => {
  const { status } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    onAuthStateChanged(FirebaseAuth, async (user) => {
      if (!user) return dispatch(logout());

      const { uid, email, displayName, photoURL } = user;
      dispatch(login({ uid, email, fullName: displayName, photoURL }));
      dispatch(startLoadingProjects());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return status;
};
