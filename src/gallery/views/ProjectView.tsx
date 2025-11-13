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

  // Form initialization with ECUS 01 and ECUS 02 fields
  const { control, watch, setValue } = useForm<ProjectForm>({
    values: {
      title,
      body,
      // ECUS 01: Load acceptance criteria
      acceptanceCriteria: project.acceptanceCriteria ?? [],
      // ECUS 02: Load project date range
      startDate: project.startDate ?? date,
      endDate: project.endDate ?? date,
      // ECUS 02: Load milestones
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

    // ECUS 02: Validate project date range (startDate <= endDate)
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
      // ECUS 01: Save acceptance criteria
      acceptanceCriteria: ac,
      // ECUS 02: Save project dates and milestones
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
  // ECUS 01: Add acceptance criterion with validation
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

  // ECUS 01: Remove acceptance criterion
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

  // ECUS 02: Milestones (hitos) management
  const milestones = watch('milestones') ?? [];
  const [showNewMilestone, setShowNewMilestone] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');

  // ECUS 02: Add milestone with date range validation
  const addMilestoneLocal = () => {
    const name = (newMilestoneName ?? '').trim();
    if (name.length === 0) return showMessage('El nombre del hito está vacío.', 'warning');

    if (!newMilestoneDate) return showMessage('La fecha del hito no es válida.', 'warning');

    const ts = new Date(newMilestoneDate).getTime();
    const start = watch('startDate') ?? date;
    const end = watch('endDate') ?? date;

    // Validate milestone date is within project date range
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
        mb: 2,
        px: 3,
        py: 2,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Grid>
        <Typography fontSize={28} fontWeight={600} sx={{ letterSpacing: '-0.5px' }}>
          {dateString}
        </Typography>
      </Grid>

      <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Button
          size="small"
          variant="text"
          onClick={() => {
            // focus the criteria input
            criteriaInputRef.current?.focus();
          }}
          sx={{
            textTransform: 'none',
            fontSize: '0.9rem',
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          Criterios
        </Button>

        {project?.withAcceptanceCriteria ? (
          <Chip
            label="Definido"
            color="success"
            size="small"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
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
          sx={{ mr: 1 }}
        >
          <UploadOutlined sx={{ fontSize: 22 }} />
        </IconButton>

        <Button
          disabled={isSaving}
          onClick={onSaveProject}
          variant="contained"
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            py: 1,
            px: 2,
            fontWeight: 500,
            fontSize: '0.95rem',
            boxShadow: 'none',
            '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
          }}
        >
          <SaveOutlined sx={{ fontSize: 20, mr: 1 }} />
          Guardar
        </Button>
      </Grid>

      <Grid container size={12} sx={{ mt: 2 }}>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              variant="outlined"
              fullWidth
              placeholder="Título del proyecto"
              label="Proyecto"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 500,
                },
              }}
            />
          )}
        />

        <Controller
          name="body"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              variant="outlined"
              fullWidth
              multiline
              placeholder="Descripción del proyecto"
              minRows={5}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          )}
        />

        {/* Project date range fields */}
        <Grid container sx={{ gap: 2, mt: 1, mb: 2 }}>
          <Controller
            name="startDate"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Inicio"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setValue('startDate', new Date(e.target.value).getTime())}
                value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ''}
                error={!!fieldState.error}
                sx={{
                  flex: 1,
                  minWidth: '140px',
                  '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                }}
              />
            )}
          />

          <Controller
            name="endDate"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Fin"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setValue('endDate', new Date(e.target.value).getTime())}
                value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ''}
                error={!!fieldState.error}
                sx={{
                  flex: 1,
                  minWidth: '140px',
                  '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                }}
              />
            )}
          />
        </Grid>
      </Grid>

      {/* Acceptance criteria section */}
      <Grid container sx={{ mt: 3, mb: 3 }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
            Criterios de aceptación
          </Typography>
        </Grid>

        <Controller
          name="acceptanceCriteria"
          control={control}
          render={({ field }) => {
            const items = field.value ?? [];

            return (
              <Grid container direction="column" sx={{ gap: 1.5, width: '100%' }}>
                <Grid container sx={{ gap: 1, alignItems: 'stretch' }}>
                  <TextField
                    inputRef={criteriaInputRef}
                    size="small"
                    variant="outlined"
                    placeholder="Agregar criterio..."
                    fullWidth
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = criteriaInputRef.current?.value ?? '';
                        addCriterionLocal(val);
                        if (criteriaInputRef.current) criteriaInputRef.current.value = '';
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        fontSize: '0.95rem',
                      },
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
                    sx={{
                      textTransform: 'none',
                      borderRadius: 1.5,
                      fontWeight: 500,
                      px: 2,
                    }}
                  >
                    Agregar
                  </Button>
                </Grid>

                {items.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center', fontStyle: 'italic' }}>
                    Sin criterios definidos
                  </Typography>
                ) : (
                  <Grid container direction="column" sx={{ gap: 1 }}>
                    {items.map((c: any) => (
                      <Grid
                        key={c.id}
                        container
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: 'rgba(76, 175, 80, 0.08)',
                          border: '1px solid rgba(76, 175, 80, 0.2)',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'rgba(76, 175, 80, 0.12)',
                          },
                        }}
                      >
                        <Typography sx={{ fontSize: '0.95rem', flex: 1 }}>{c.text}</Typography>
                        <IconButton
                          onClick={() => removeCriterionLocal(c.id)}
                          color="error"
                          size="small"
                          sx={{
                            '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)' },
                          }}
                        >
                          <DeleteOutline sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>
            );
          }}
        />
      </Grid>

      {/* Milestones (Cronograma) section */}
      <Grid container sx={{ mt: 2 }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2, width: '100%' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
            Hitos
          </Typography>
          <Button
            size="small"
            variant={showNewMilestone ? 'contained' : 'outlined'}
            onClick={() => setShowNewMilestone((s) => !s)}
            sx={{
              textTransform: 'none',
              borderRadius: 1.5,
              fontWeight: 500,
            }}
          >
            {showNewMilestone ? '✕ Cancelar' : '+ Nuevo'}
          </Button>
        </Grid>

        {showNewMilestone && (
          <Grid container direction="column" sx={{ gap: 1.5, width: '100%', mb: 2, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2, border: '1px solid rgba(25, 118, 210, 0.1)' }}>
            <TextField
              label="Nombre del hito"
              value={newMilestoneName}
              onChange={(e) => setNewMilestoneName(e.target.value)}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
              }}
            />
            <TextField
              label="Fecha"
              type="date"
              value={newMilestoneDate}
              onChange={(e) => setNewMilestoneDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
              }}
            />
            <TextField
              label="Descripción"
              value={newMilestoneDesc}
              onChange={(e) => setNewMilestoneDesc(e.target.value)}
              multiline
              minRows={2}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={addMilestoneLocal}
              sx={{
                textTransform: 'none',
                borderRadius: 1.5,
                fontWeight: 500,
                alignSelf: 'flex-start',
              }}
            >
              Guardar
            </Button>
          </Grid>
        )}

        <Grid container direction="column" sx={{ gap: 1.5, width: '100%', mt: 1 }}>
          {milestones.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center', fontStyle: 'italic' }}>
              Sin hitos registrados
            </Typography>
          ) : (
            [...milestones]
              .sort((a: any, b: any) => a.date - b.date)
              .map((m: any, idx: number) => (
                <Grid
                  key={m.id}
                  container
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(25, 118, 210, 0.05)',
                    border: '1px solid rgba(25, 118, 210, 0.15)',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.1)',
                      borderColor: 'rgba(25, 118, 210, 0.3)',
                    },
                  }}
                >
                  <Grid
                    sx={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </Grid>
                  <Grid sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '1rem', mb: 0.3 }}>
                      {m.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                      {new Date(m.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                    {m.description && (
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary', mt: 0.5 }}>
                        {m.description}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              ))
          )}
        </Grid>
      </Grid>

      <Snackbar 
        open={snackOpen} 
        autoHideDuration={3500} 
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackClose} 
          severity={snackSeverity} 
          sx={{ width: '100%', borderRadius: 1.5 }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>

      <Grid container sx={{ justifyContent: 'flex-end', mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={onDelete} 
          color="error"
          variant="text"
          sx={{
            textTransform: 'none',
            fontSize: '0.9rem',
            '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)' },
          }}
        >
          <DeleteOutline sx={{ mr: 0.5, fontSize: 20 }} />
          Eliminar
        </Button>
      </Grid>

      {/* Image gallery */}
      <ImageGallery images={project!.imagesUrls} />
    </Grid>
  );
};
