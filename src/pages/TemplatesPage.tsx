import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  Description as DescriptionIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import MensalidadeTemplate from '../components/Templates/MensalidadeTemplate';
import ListaIdososTemplate from '../components/Templates/ListaIdososTemplate';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`template-tabpanel-${index}`}
      aria-labelledby={`template-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TemplatesPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Geradores de Documentos
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Gere documentos DOCX personalizados para o Lar dos Idosos.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Funcionalidades disponíveis:</strong>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>Recibos de mensalidade individuais</li>
          <li>Lista completa de idosos</li>
          <li>Templates personalizáveis</li>
          <li>Geração automática em DOCX</li>
        </ul>
      </Alert>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="template tabs"
            variant="fullWidth"
          >
            <Tab 
              icon={<ReceiptIcon />} 
              label="Recibo de Mensalidade" 
              iconPosition="start"
            />
            <Tab 
              icon={<PeopleIcon />} 
              label="Lista de Idosos" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <MensalidadeTemplate />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ListaIdososTemplate />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default TemplatesPage;
