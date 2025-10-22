import { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Grid, IconButton, TextField, Typography } from '@mui/material';
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

  const { control, watch } = useForm<ProjectForm>({
    values: {
      title,
      body,
    },
  });

  const dateString = useMemo(() => {
    const newDate = new Date(date);
    return newDate.toUTCString();
  }, [date]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (savedMessage.length > 0) {
      console.log('Nota salvada');
    }
  }, [savedMessage]);

  const onSaveProject = () => {
    const { title, body } = watch();

    const updatedProject = { ...project!, title, body };

    dispatch(setActiveProject(updatedProject));
    dispatch(startSavingProject());
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
      </Grid>

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
