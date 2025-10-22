import { Fab } from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';

import { useAppDispatch, useAppSelector } from '../../store/reduxHooks';
import { startNewProject } from '../../store/gallery';

import { GalleryLayout } from '../layout/GalleryLayout';
import { NothingSelectedView, ProjectView } from '../views';

export const GalleryPage = () => {
  const { active, isSaving } = useAppSelector((state) => state.gallery);
  const dispatch = useAppDispatch();

  const onClickNewProject = () => {
    dispatch(startNewProject());
  };

  return (
    <GalleryLayout>
      {active ? <ProjectView /> : <NothingSelectedView />}

      <Fab
        disabled={isSaving}
        color="error"
        sx={{ position: 'fixed', right: 50, bottom: 50 }}
        onClick={onClickNewProject}
      >
        <AddOutlined sx={{ fontSize: 30 }} />
      </Fab>
    </GalleryLayout>
  );
};
