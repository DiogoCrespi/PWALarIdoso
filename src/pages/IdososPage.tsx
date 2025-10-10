import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import IdososList from '../components/Idosos/IdososList';

export default function IdososPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciar Idosos
      </Typography>
      
      <IdososList 
        key={refreshKey}
        onRefresh={handleRefresh} 
      />
    </Box>
  );
}


