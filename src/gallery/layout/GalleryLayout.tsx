import { useMemo } from 'react';
import { Box, Toolbar } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../store/reduxHooks';
import { setActiveProject } from '../../store/gallery';

import { NavBar, SideBar } from '../../ui';

const drawerWidth = 240;

export const GalleryLayout = ({ children }: React.PropsWithChildren) => {
  const { fullName } = useAppSelector((state) => state.auth);
  const { projects } = useAppSelector((state) => state.gallery);
  const dispatch = useAppDispatch();

  const sideBarItems = useMemo(() => {
    return projects.map((project) => ({
      id: project.id,
      title: project.title ?? 'Nueva entrada',
      subtitle: project.body,
      onClick: () => dispatch(setActiveProject(project)),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <NavBar drawerWidth={drawerWidth} />
        <SideBar
          title={fullName!}
          drawerWidth={drawerWidth}
          items={sideBarItems}
        />

        <Box
          className="animate__animated animate__fadeIn animate__faster"
          component="main"
          sx={{ flexGrow: 1, p: 3 }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>

      {/* <Snackbar
        open={savedMessage.length !== 0}
        onClose={handleClose}
        autoHideDuration={3000}
      >
        <Alert onClose={handleClose} severity="success" variant="filled">
          {savedMessage}
        </Alert>
      </Snackbar> */}
    </>
  );
};
