import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import ResponsaveisList from '../components/Responsaveis/ResponsaveisList';

export default function ResponsaveisPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciar Responsáveis
      </Typography>
      
      <ResponsaveisList 
        key={refreshKey}
        onRefresh={handleRefresh} 
      />
    </Box>
  );
}


