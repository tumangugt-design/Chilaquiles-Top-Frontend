import { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, googleProvider, signInWithPopup, signOut } from '../config/firebase.js';
import { authStaffLogin, getSession } from '../config/api.js';

export const useAuthSession = (panelRole) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshSession = async () => {
    try {
      const response = await getSession();
      setSession(response.data.user);
      setError('');
    } catch (err) {
      setSession(null);
      if (auth.currentUser) {
        setError(err.response?.data?.message || 'No se pudo validar la sesión.');
      }
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
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      if (panelRole && panelRole !== 'ADMIN') {
        await authStaffLogin({ role: panelRole });
      }
      await refreshSession();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
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
