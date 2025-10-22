import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type AuthError,
} from 'firebase/auth';
import type { LoginFormInputs, RegisterFormInputs } from '../auth/types';
import { FirebaseAuth } from './config';

export const loginWithEmailAndPassword = async ({
  email,
  password,
}: LoginFormInputs) => {
  try {
    const resp = await signInWithEmailAndPassword(
      FirebaseAuth,
      email,
      password
    );
    const { uid, displayName, photoURL } = resp.user;

    return {
      ok: true,
      uid,
      displayName,
      email,
      photoURL,
    };
  } catch (error) {
    let errorMessage = 'Ha ocurrido un error, intentalo nuevamente';
    if (error as AuthError) {
      errorMessage = 'Usuario o contraseña incorrectos';
    }

    return { ok: false, errorMessage };
  }
};

export const registerUserWithEmailPassword = async ({
  email,
  password,
  fullName: displayName,
}: RegisterFormInputs) => {
  try {
    const resp = await createUserWithEmailAndPassword(
      FirebaseAuth,
      email,
      password
    );
    const { uid, photoURL } = resp.user;
    await updateProfile(FirebaseAuth.currentUser!, { displayName });

    return {
      ok: true,
      uid,
      photoURL,
      email,
      displayName,
    };
  } catch (error) {
    let errorMessage = 'Ha ocurrido un error, intentalo nuevamente';
    if (error as AuthError) {
      errorMessage = 'Algo ha sucedido, vuelve a intentarlo';
    }

    return { ok: false, errorMessage };
  }
};

export const logoutFirebase = async () => {
  return await FirebaseAuth.signOut();
};
