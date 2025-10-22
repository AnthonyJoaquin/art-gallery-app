import { Routes, Route, Navigate } from 'react-router';

import { useCheckAuth } from '../hooks';
import { CheckingAuth } from '../ui';
import { AuthRoutes } from '../auth';
import { GalleryRoutes } from '../gallery';

export const AppRouter = () => {
  const status = useCheckAuth();

  if (status === 'checking') {
    return <CheckingAuth />;
  }

  return (
    <Routes>
      {status === 'authenticated' ? (
        // GalleryApp
        <Route path="/*" element={<GalleryRoutes />} />
      ) : (
        // Login y registro
        <Route path="/auth/*" element={<AuthRoutes />} />
      )}
      <Route path="/*" element={<Navigate to="/auth/login" />} />
    </Routes>
  );
};
