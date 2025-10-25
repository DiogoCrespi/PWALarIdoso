import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import DashboardCell from './DashboardCell';
import type { Idoso } from '../../electron.d';

interface DashboardGridProps {
  idosos: Idoso[];
  pagamentos: Record<number, Record<number, any>>;
  onCellClick: (idosoId: number, mes: number) => void;
}

const meses = [
  'Jan - 01', 'Fev - 02', 'Mar - 03', 'Abr - 04', 
  'Mai - 05', 'Jun - 06', 'Jul - 07', 'Ago - 08', 
  'Set - 09', 'Out - 10', 'Nov - 11', 'Dez - 12'
];

export default function DashboardGrid({ idosos, pagamentos, onCellClick }: DashboardGridProps) {
  return (
    <TableContainer sx={{ 
      maxHeight: { 
        xs: 'calc(100vh - 240px)', // Mobile: mais espaço sem rodapé
        sm: 'calc(100vh - 220px)', // Tablet: mais espaço sem rodapé
        md: 'calc(100vh - 210px)'  // Desktop: mais espaço sem rodapé
      },
      overflowX: 'auto',
      overflowY: 'auto'
    }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 'bold',
                backgroundColor: 'primary.main',
                color: 'white',
                minWidth: { xs: '120px', sm: '150px', md: '200px' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                padding: { xs: '8px', sm: '12px', md: '16px' },
                position: 'sticky',
                left: 0,
                zIndex: 3,
              }}
            >
              Idoso
            </TableCell>
            {meses.map((mes, idx) => (
              <TableCell
                key={idx}
                align="center"
                sx={{
                  fontWeight: 'bold',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  minWidth: { xs: '60px', sm: '70px', md: '80px' },
                  fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' },
                  padding: { xs: '6px 4px', sm: '8px', md: '12px' },
                }}
              >
                {mes}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {idosos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={13} align="center" sx={{ py: 4 }}>
                Nenhum idoso cadastrado
              </TableCell>
            </TableRow>
          ) : (
            idosos.map((idoso, index) => {
              // Usar uma chave única combinando ID e índice (fallback para índice se ID não existir)
              const uniqueKey = idoso.id ? `idoso-${idoso.id}` : `idoso-temp-${index}`;
              
              return (
                <TableRow key={uniqueKey} hover>
                  <TableCell
                    sx={{
                      fontWeight: 'medium',
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      padding: { xs: '8px', sm: '12px', md: '16px' },
                      position: 'sticky',
                      left: 0,
                      backgroundColor: 'background.paper',
                      zIndex: 1,
                      whiteSpace: { xs: 'normal', md: 'nowrap' },
                      wordBreak: { xs: 'break-word', md: 'normal' },
                    }}
                  >
                    {idoso.nome}
                  </TableCell>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mes) => {
                    const pag = pagamentos[idoso.id]?.[mes];
                    const status = (pag?.status || 'PENDENTE') as 'PAGO' | 'PARCIAL' | 'PENDENTE';

                    return (
                      <TableCell key={mes} sx={{ padding: 0 }}>
                        <DashboardCell
                          status={status}
                          nfse={pag?.nfse}
                          onClick={() => onCellClick(idoso.id, mes)}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}




