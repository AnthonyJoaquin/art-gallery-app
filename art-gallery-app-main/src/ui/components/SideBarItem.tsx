import { useMemo } from 'react';
import { TurnedInNot } from '@mui/icons-material';
import {
  Grid,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import type { CustomItem } from '../../types/custom-item';

export const SideBarItem = ({ title, subtitle, onClick }: CustomItem) => {
  const newTitle = useMemo(() => {
    return title.length > 15 ? title.substring(0, 15) + '...' : title;
  }, [title]);

  const newSubtitle = useMemo(() => {
    if (!subtitle) return;
    return subtitle.length > 35 ? subtitle.substring(0, 35) + '...' : subtitle;
  }, [subtitle]);

  return (
    <ListItem className="animate__animated animate__fadeIn" disablePadding>
      <ListItemButton onClick={onClick}>
        <ListItemIcon>
          <TurnedInNot />
        </ListItemIcon>
        <Grid>
          <ListItemText primary={newTitle} />
          <ListItemText secondary={newSubtitle} />
        </Grid>
      </ListItemButton>
    </ListItem>
  );
};
