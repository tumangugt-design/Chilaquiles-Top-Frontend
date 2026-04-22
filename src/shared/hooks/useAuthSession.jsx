import { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, googleProvider, signInWithPopup, signOut } from '../config/firebase.js';
import { authStaffLogin, getSession } from '../config/api.js';

export const useAuthSession = (panelRole) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshSession = async ({ showUnauthorizedAlert = false } = {}) => {
    try {
      const response = await getSession();
      const user = response?.data?.user || null;

      setSession(user);

      if (!user && panelRole === 'ADMIN') {
        const message =
          'Esta cuenta no es administrador y no tiene permitido acceder a este panel.';

        setSession(null);
        setFirebaseUser(null);
        setError(message);

        if (showUnauthorizedAlert) {
          window.alert(message);
        }

        await signOut(auth);
        return null;
      }

      setError('');
      return user;
    } catch (error) {
      setSession(null);
      setError('No se pudo validar la sesión.');
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);

      if (!currentUser) {
        setSession(null);
        setLoading(false);
        return;
      }

      await refreshSession();
      setLoading(false);
    });

    return unsubscribe;
  }, [panelRole]);

  const loginWithGoogle = async () => {
    try {
      setError('');

      await signInWithPopup(auth, googleProvider);

      if (panelRole && panelRole !== 'ADMIN') {
        await authStaffLogin({ role: panelRole });
      }

      await refreshSession({ showUnauthorizedAlert: true });
    } catch (error) {
      console.error('Error en loginWithGoogle:', error);
      setError('No se pudo iniciar sesión con Google.');
    }
  };

  const logout = async () => {
    await signOut(auth);
    setSession(null);
    setFirebaseUser(null);
  };

  return {
    firebaseUser,
    session,
    loading,
    error,
    loginWithGoogle,
    logout,
    refreshSession
  };
};
