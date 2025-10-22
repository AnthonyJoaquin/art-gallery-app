import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import {
  AppBar,
  Toolbar,
  Typography,
  Grid,
  IconButton,
  Box,
} from '@mui/material';

import { useAppDispatch } from '../../store/reduxHooks';
import { startLogout } from '../../store/auth';

interface Props {
  drawerWidth?: number;
}

export const NavBar = ({ drawerWidth }: Props) => {
  const dispatch = useAppDispatch();

  const handleClick = () => {
    dispatch(startLogout());
  };

  return (
    <AppBar
      sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6">Art Gallery</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <nav>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Typography sx={{ cursor: 'pointer' }}>Proyectos</Typography>
              <Typography sx={{ cursor: 'pointer' }}>Actividades</Typography>
            </Grid>
          </nav>

          <IconButton color="error" onClick={handleClick}>
            <LogoutOutlined />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
