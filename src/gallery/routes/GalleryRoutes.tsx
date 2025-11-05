import { Navigate, Route, Routes } from 'react-router';
import { GalleryPage, PortfolioHealthBoard } from '../pages';

export const GalleryRoutes = () => {
  return (
    <Routes>
  <Route path="/" element={<GalleryPage />} />
  <Route path="/portfolio/health" element={<PortfolioHealthBoard />} />

      <Route path="/*" element={<Navigate to="/" />} />
    </Routes>
  );
};
