import { Box, Typography } from '@mui/material';
import StarOutline from '@mui/icons-material/StarOutline';

export const NothingSelectedView = () => {
  return (
    <Box
      sx={{
        bgcolor: 'primary.main',
        minHeight: 'calc(100dvh - 110px)',
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <StarOutline sx={{ fontSize: 100, color: 'white' }} />
      <Typography variant="h5" color="white">
        Selecciona o crea un proyecto
      </Typography>
    </Box>
  );
};
