import { Drawer, Toolbar, Typography, Divider, Box, List } from '@mui/material';

import type { CustomItem } from '../../types/custom-item';

import { SideBarItem } from './SideBarItem';

interface Props {
  title?: string;
  items?: CustomItem[];
  drawerWidth?: number;
}

export const SideBar = ({ title = '', items, drawerWidth = 250 }: Props) => {
  return (
    <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
      <Drawer
        variant="permanent"
        open
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ width: '100%' }}>
            {title}
          </Typography>
        </Toolbar>
        <Divider />

        {items && (
          <List>
            {items?.map((item) => (
              <SideBarItem key={item.id} {...item} />
            ))}
          </List>
        )}
      </Drawer>
    </Box>
  );
};
