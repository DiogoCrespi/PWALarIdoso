import { Box, Tooltip } from '@mui/material';
import { statusColors, statusLabels } from '../../styles/theme';

interface DashboardCellProps {
  status: 'PAGO' | 'PARCIAL' | 'PENDENTE';
  nfse?: string;
  onClick: () => void;
}

export default function DashboardCell({ status, nfse, onClick }: DashboardCellProps) {
  return (
    <Tooltip title={statusLabels[status]} arrow>
      <Box
        onClick={onClick}
        sx={{
          backgroundColor: statusColors[status],
          minHeight: { xs: '45px', sm: '50px', md: '60px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: { xs: '1px solid white', md: '2px solid white' },
          transition: 'all 0.2s ease',
          color: 'white',
          fontWeight: 'bold',
          fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
          '&:hover': {
            transform: { xs: 'scale(1.02)', md: 'scale(1.05)' },
            boxShadow: 4,
            zIndex: 2,
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        }}
      >
        {nfse || '-'}
      </Box>
    </Tooltip>
  );
}




