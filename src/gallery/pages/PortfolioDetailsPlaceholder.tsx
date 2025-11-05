import { useParams } from 'react-router';
import { MOCK_PROJECTS } from '../fixtures/mock-projects';

export const PortfolioDetailsPlaceholder = () => {
  const { id } = useParams() as { id?: string };
  const project = MOCK_PROJECTS.find((p) => p.id === id);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">{project?.title ?? 'Proyecto'}</h2>
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <p className="text-gray-700">Detalles del proyecto próximamente</p>
      </div>
    </div>
  );
};

export default PortfolioDetailsPlaceholder;
