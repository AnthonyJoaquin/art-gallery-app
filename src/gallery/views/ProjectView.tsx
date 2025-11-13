import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Grid, IconButton, TextField, Typography, Chip, Snackbar, Alert } from '@mui/material';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import UploadOutlined from '@mui/icons-material/UploadOutlined';

import type { ProjectState } from '../types/project-state';

import { useAppDispatch, useAppSelector } from '../../store/reduxHooks';
import {
  setActiveProject,
  startDeletingProject,
  startSavingProject,
  startUploadingFiles,
} from '../../store/gallery';

import { ImageGallery } from '../../ui';

type ProjectForm = Omit<ProjectState, 'id' | 'imagesUrls' | 'date'>;

export const ProjectView = () => {
  const {
    active: project,
    savedMessage,
    isSaving,
  } = useAppSelector((state) => state.gallery);

  const { body, date, title } = project!;

  const { control, watch, setValue } = useForm<ProjectForm>({
    values: {
      title,
      body,
      acceptanceCriteria: project.acceptanceCriteria ?? [],
      startDate: project.startDate ?? date,
      endDate: project.endDate ?? date,
      milestones: project.milestones ?? [],
    },
  });

  const dateString = useMemo(() => {
    const newDate = new Date(date);
    return newDate.toUTCString();
  }, [date]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const criteriaInputRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (savedMessage.length > 0) {
      console.log('Nota salvada');
    }
  }, [savedMessage]);

  const onSaveProject = () => {
    const { title, body, acceptanceCriteria } = watch();
    const { startDate, endDate, acceptanceCriteria: ac } = watch();

    // validate date range
    if (startDate && endDate && startDate > endDate) {
      const startStr = new Date(startDate).toLocaleDateString();
      const endStr = new Date(endDate).toLocaleDateString();
      showMessage(`La fecha de inicio debe ser anterior o igual a la fecha fin (${startStr} - ${endStr})`, 'error');
      return;
    }

    const updatedProject = {
      ...project!,
      title,
      body,
      acceptanceCriteria: ac,
      startDate: startDate ?? project!.startDate,
      endDate: endDate ?? project!.endDate,
      withAcceptanceCriteria: (ac ?? []).length > 0,
      milestones: watch('milestones') ?? project!.milestones,
    };

    // If there are no criteria, show the required-exception message (but still save other fields)
    if (!updatedProject.withAcceptanceCriteria) {
      showMessage('Este entregable no tiene criterios de aceptación definidos', 'warning');
    }

    dispatch(setActiveProject(updatedProject));
    dispatch(startSavingProject());
  };

  const criteria = watch('acceptanceCriteria') ?? [];
  const addCriterionLocal = (text: string) => {
    const val = (text ?? '').trim();
    if (val.length === 0) {
      showMessage('El criterio está vacío.', 'warning');
      return;
    }

    if (val.length < 3) {
      showMessage('El criterio es muy corto (mínimo 3 caracteres).', 'warning');
      return;
    }

    const exists = criteria.some((c: any) => c.text.toLowerCase() === val.toLowerCase());
    if (exists) {
      showMessage('El criterio ya existe.', 'warning');
      return;
    }

    const newItem = { id: crypto?.randomUUID?.() ?? String(Date.now()), text: val };
    setValue('acceptanceCriteria', [...criteria, newItem], { shouldDirty: true, shouldValidate: true });
    showMessage('Criterio agregado.', 'success');
    setTimeout(() => criteriaInputRef.current?.focus(), 50);
  };

  const removeCriterionLocal = (id: string) => {
    setValue('acceptanceCriteria', criteria.filter((c: any) => c.id !== id), { shouldDirty: true, shouldValidate: true });
    showMessage('Criterio eliminado.', 'info');
  };

  // Snackbar state and helpers
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');

  const showMessage = (message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setSnackMsg(message);
    setSnackSeverity(severity);
    setSnackOpen(true);
  };

  const handleSnackClose = (_?: any, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackOpen(false);
  };

  const onFileInputChange = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = target;

    if (!files || files.length === 0) return;

    dispatch(startUploadingFiles(files));
  };

  const onDelete = () => {
    dispatch(startDeletingProject());
  };

  // Milestones (hitos)
  const milestones = watch('milestones') ?? [];
  const [showNewMilestone, setShowNewMilestone] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');

  const addMilestoneLocal = () => {
    const name = (newMilestoneName ?? '').trim();
    if (name.length === 0) return showMessage('El nombre del hito está vacío.', 'warning');

    if (!newMilestoneDate) return showMessage('La fecha del hito no es válida.', 'warning');

    const ts = new Date(newMilestoneDate).getTime();
    const start = watch('startDate') ?? date;
    const end = watch('endDate') ?? date;

    if (ts < start || ts > end) {
      const startStr = new Date(start).toLocaleDateString();
      const endStr = new Date(end).toLocaleDateString();
      return showMessage(`La fecha del hito debe estar entre ${startStr} y ${endStr}`, 'error');
    }

    const newItem = { id: crypto?.randomUUID?.() ?? String(Date.now()), name, date: ts, description: newMilestoneDesc };
    setValue('milestones', [...milestones, newItem], { shouldDirty: true, shouldValidate: true });
    showMessage('Hito añadido.', 'success');

    // persist immediately
    const { title: t, body: b, acceptanceCriteria } = watch();
    const updatedProject = { ...project!, title: t, body: b, acceptanceCriteria, milestones: [...milestones, newItem], withAcceptanceCriteria: (acceptanceCriteria ?? []).length > 0 };
    dispatch(setActiveProject(updatedProject));
    dispatch(startSavingProject());

    // reset form
    setNewMilestoneName('');
    setNewMilestoneDate('');
    setNewMilestoneDesc('');
    setShowNewMilestone(false);
  };

  return (
    <Grid
      className="animate__animated animate__fadeIn animate__faster"
      container
      sx={{
        mb: 1,
        px: 2,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Grid>
        <Typography fontSize={39} fontWeight="light">
          {dateString}
        </Typography>
      </Grid>

      <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            // focus the criteria input
            criteriaInputRef.current?.focus();
          }}
        >
          Gestionar Criterios de Aceptación
        </Button>

        {project?.withAcceptanceCriteria ? (
          <Chip label="Con Criterios Definidos" color="success" size="small" />
        ) : null}
      </Grid>

      <Grid>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={onFileInputChange}
          style={{ display: 'none' }}
        />
        <IconButton
          color="primary"
          disabled={isSaving}
          onClick={() => fileInputRef.current!.click()}
        >
          <UploadOutlined />
        </IconButton>

        <Button
          disabled={isSaving}
          onClick={onSaveProject}
          color="primary"
          sx={{ padding: 2 }}
        >
          <SaveOutlined sx={{ fontSize: 30, mr: 1 }} />
          Guardar
        </Button>
      </Grid>

      <Grid container size={12}>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              variant="filled"
              fullWidth
              placeholder="Ingrese el titulo del proyecto"
              label="Proyecto"
              sx={{ border: 'none', mb: 1 }}
              // {...register('title')}
            />
          )}
        />

        <Controller
          name="body"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              variant="filled"
              fullWidth
              multiline
              placeholder="Ingrese detalles acerca del proyecto"
              minRows={5}
              // {...register('body')}
            />
          )}
        />
        {/* Project date range fields */}
        <Grid container sx={{ gap: 1, mt: 1 }}>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Fecha Inicio"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setValue('startDate', new Date(e.target.value).getTime())}
                value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ''}
              />
            )}
          />

          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Fecha Fin"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setValue('endDate', new Date(e.target.value).getTime())}
                value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ''}
              />
            )}
          />
        </Grid>
      </Grid>

      {/* Acceptance criteria section */}
      <Grid container sx={{ mt: 2, gap: 1 }}>
        <Typography variant="h6">Criterios de aceptación</Typography>

        <Controller
          name="acceptanceCriteria"
          control={control}
          render={({ field }) => {
            const items = field.value ?? [];

            return (
              <Grid container direction="column" sx={{ gap: 1 }}>
                <Grid container sx={{ gap: 1, alignItems: 'center' }}>
                  <TextField
                    inputRef={criteriaInputRef}
                    size="small"
                    variant="outlined"
                    placeholder="Agregar criterio de aceptación"
                    fullWidth
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = criteriaInputRef.current?.value ?? '';
                        addCriterionLocal(val);
                        if (criteriaInputRef.current) criteriaInputRef.current.value = '';
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const val = criteriaInputRef.current?.value ?? '';
                      addCriterionLocal(val);
                      if (criteriaInputRef.current) criteriaInputRef.current.value = '';
                    }}
                    size="small"
                    variant="contained"
                  >
                    Agregar
                  </Button>
                </Grid>

                  {items.length === 0 ? (
                    <Typography color="text.secondary">Este entregable no tiene criterios de aceptación definidos</Typography>
                  ) : (
                  items.map((c: any) => (
                    <Grid
                      key={c.id}
                      container
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography>{c.text}</Typography>
                      <IconButton onClick={() => removeCriterionLocal(c.id)} color="error">
                        <DeleteOutline />
                      </IconButton>
                    </Grid>
                  ))
                )}
              </Grid>
            );
          }}
        />
      </Grid>

      {/* Milestones (Cronograma) section */}
      <Grid container sx={{ mt: 3, gap: 1 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Hitos</Typography>
          <Button size="small" variant="outlined" onClick={() => setShowNewMilestone((s) => !s)}>
            {showNewMilestone ? 'Cancelar' : 'Nuevo Hito'}
          </Button>
        </Grid>

        {showNewMilestone && (
          <Grid container direction="column" sx={{ gap: 1, mt: 1 }}>
            <TextField
              label="Nombre del hito"
              value={newMilestoneName}
              onChange={(e) => setNewMilestoneName(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Fecha del hito"
              type="date"
              value={newMilestoneDate}
              onChange={(e) => setNewMilestoneDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="Descripción (opcional)"
              value={newMilestoneDesc}
              onChange={(e) => setNewMilestoneDesc(e.target.value)}
              multiline
              minRows={2}
              fullWidth
              size="small"
            />
            <Grid>
              <Button variant="contained" size="small" onClick={addMilestoneLocal}>
                Guardar Hito
              </Button>
            </Grid>
          </Grid>
        )}

        <Grid container direction="column" sx={{ gap: 1, mt: 1 }}>
          {milestones.length === 0 ? (
            <Typography color="text.secondary">No hay hitos registrados.</Typography>
          ) : (
            [...milestones]
              .sort((a: any, b: any) => a.date - b.date)
              .map((m: any) => (
                <Grid key={m.id} container sx={{ p: 1, borderRadius: 1, bgcolor: 'background.paper', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Typography fontWeight="bold">{m.name}</Typography>
                    <Typography variant="caption">{new Date(m.date).toLocaleDateString()}</Typography>
                    {m.description ? <Typography>{m.description}</Typography> : null}
                  </div>
                </Grid>
              ))
          )}
        </Grid>
      </Grid>

      <Snackbar open={snackOpen} autoHideDuration={3500} onClose={handleSnackClose}>
        <Alert onClose={handleSnackClose} severity={snackSeverity} sx={{ width: '100%' }}>
          {snackMsg}
        </Alert>
      </Snackbar>

      <Grid container sx={{ justifyContent: 'end' }}>
        <Button onClick={onDelete} sx={{ mt: 2 }} color="error">
          <DeleteOutline />
          Borrar
        </Button>
      </Grid>

      {/* Image gallery */}
      <ImageGallery images={project!.imagesUrls} />
    </Grid>
  );
};
