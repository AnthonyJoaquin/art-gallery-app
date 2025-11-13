import { useEffect, useMemo, useState } from 'react';
import './portfolio-health.css';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
} from '@mui/material';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useAppDispatch, useAppSelector } from '../../store/reduxHooks';
import { FirebaseDB } from '../../firebase/config';
import type { ProjectState } from '../types/project-state';
import { setActiveProject } from '../../store/gallery';
import { useNavigate } from 'react-router';

type HealthState = 'green' | 'amber' | 'red';

const computeHealth = (p: ProjectState): HealthState => {
  const textLen = p.body?.length ?? 0;
  const images = p.imagesUrls?.length ?? 0;

  if (images >= 3 && textLen >= 100) return 'green';
  if (images >= 1 || textLen >= 30) return 'amber';
  return 'red';
};

const healthLabel = {
  green: 'Saludable',
  amber: 'En atención',
  red: 'Crítico',
} as const;

export const PortfolioHealthBoard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { uid } = useAppSelector((s) => s.auth);

  const [projects, setProjects] = useState<ProjectState[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | HealthState>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('');

  useEffect(() => {
    if (!uid) return;
    const col = collection(FirebaseDB, `${uid}/gallery/projects`);
    const q = query(col);
    const unsub = onSnapshot(q, (snap) => {
      const items: ProjectState[] = [];
      snap.forEach((d) => items.push({ ...(d.data() as ProjectState), id: (d.data() as any).id ?? d.id }));
      setProjects(items);
    });
    return () => unsub();
  }, [uid]);

  const projectsWithHealth = useMemo(() => projects.map((p) => ({ project: p, health: computeHealth(p) })), [projects]);

  const filtered = useMemo(() => {
    let list = projectsWithHealth.slice();

    if (statusFilter !== 'all') list = list.filter((x) => x.health === statusFilter);

    if (fromDate) {
      const from = new Date(fromDate).getTime();
      list = list.filter((x) => (x.project.date ?? 0) >= from);
    }

    if (toDate) {
      const to = new Date(toDate).getTime();
      list = list.filter((x) => (x.project.date ?? 0) <= to);
    }

    if (responsibleFilter.trim().length > 0) {
      const term = responsibleFilter.toLowerCase();
      list = list.filter(
        (x) =>
          (x.project.title ?? '').toLowerCase().includes(term) ||
          (x.project.body ?? '').toLowerCase().includes(term)
      );
    }

    return list;
  }, [projectsWithHealth, statusFilter, fromDate, toDate, responsibleFilter]);

  const onClickProject = (p: ProjectState) => {
    dispatch(setActiveProject(p));
    navigate('/');
  };

  const counts = useMemo(
    () => ({
      green: projectsWithHealth.filter((x) => x.health === 'green').length,
      amber: projectsWithHealth.filter((x) => x.health === 'amber').length,
      red: projectsWithHealth.filter((x) => x.health === 'red').length,
    }),
    [projectsWithHealth]
  );

  if (!projects || projects.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">No hay proyectos para mostrar</Typography>
      </Box>
    );
  }

  return (
    <Box className="health-board">
      <Typography variant="h4" sx={{ mb: 2 }}>
        Tablero de Salud del Portafolio
      </Typography>

      <Box className="filters">
        <Box className="chips-row">
          <Chip label={`${healthLabel.green} (${counts.green})`} color="success" />
          <Chip label={`${healthLabel.amber} (${counts.amber})`} sx={{ bgcolor: '#FFB74D' }} />
          <Chip label={`${healthLabel.red} (${counts.red})`} color="error" />
        </Box>

        <Box sx={{ flex: 1 }} />

        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="green">Verde (saludable)</MenuItem>
          <MenuItem value="amber">Ámbar (en atención)</MenuItem>
          <MenuItem value="red">Rojo (crítico)</MenuItem>
        </Select>

        <TextField type="date" label="Desde" InputLabelProps={{ shrink: true }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <TextField type="date" label="Hasta" InputLabelProps={{ shrink: true }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <TextField label="Responsable" placeholder="Buscar por responsable (aprox.)" value={responsibleFilter} onChange={(e) => setResponsibleFilter(e.target.value)} />
        <Button onClick={() => { setFromDate(''); setToDate(''); setResponsibleFilter(''); setStatusFilter('all'); }}>Limpiar filtros</Button>
      </Box>

      <Box className="cards-grid">
        {filtered.map((item) => {
          const p = item.project;
          const health = computeHealth(p);
          return (
            <Card key={p.id} className="project-card" onClick={() => onClickProject(p)}>
              <CardContent>
                <Typography variant="h6">{p.title ?? 'Sin título'}</Typography>
                <Typography className="project-body" sx={{ mb: 1 }}>{p.body?.slice(0, 120)}{p.body && p.body.length > 120 ? '...' : ''}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption">{p.date ? new Date(p.date).toLocaleDateString() : ''}</Typography>
                  <Chip label={healthLabel[health]} color={health === 'green' ? 'success' : health === 'red' ? 'error' : 'default'} sx={health === 'amber' ? { bgcolor: '#FFB74D', color: '#000' } : undefined} />
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default PortfolioHealthBoard;
