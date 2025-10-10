import { Box, Typography, Paper } from '@mui/material';

export default function ConfiguracoesPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Configurações
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Página em desenvolvimento...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Aqui você poderá configurar caminhos de pastas, dados da instituição, etc.
        </Typography>
      </Paper>
    </Box>
  );
}




