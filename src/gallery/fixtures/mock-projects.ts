import type { ProjectState } from '../types/project-state';

export const MOCK_PROJECTS: ProjectState[] = [
  {
    id: '1',
    title: 'Restauración de óleo colonial',
    body: 'Proyecto para la restauración de un óleo del siglo XVIII. Incluye limpieza, consolidación y reporte final con imágenes.',
    date: Date.now() - 1000 * 60 * 60 * 24 * 30,
    imagesUrls: ['a.jpg', 'b.jpg', 'c.jpg'],
  },
  {
    id: '2',
    title: 'Catálogo digital de esculturas modernas',
    body: 'Catálogo inicial con fotografiado de piezas y descripciones breves.',
    date: Date.now() - 1000 * 60 * 60 * 24 * 10,
    imagesUrls: ['x.jpg'],
  },
  {
    id: '3',
    title: 'Investigación de técnicas',
    body: '',
    date: Date.now() - 1000 * 60 * 60 * 24 * 5,
    imagesUrls: [],
  },
];

export default MOCK_PROJECTS;
