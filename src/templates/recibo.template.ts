// Templates HTML para geração de PDFs

export const getReciboMensalidadeHtml = (data: any): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recibo de Mensalidade</title>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            color: #333; 
            margin: 0;
            padding: 20px;
            background: white;
          }
          @media print {
            body { 
              margin: 0;
              padding: 15px;
              background: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .container {
              border: none !important;
              box-shadow: none !important;
            }
            /* Remover cabeçalho e rodapé do navegador */
            @page {
              margin: 0.75cm 0.5cm 0.5cm 0.75cm; /* Superior, Direita, Inferior, Esquerda */
              size: A4;
            }
            /* Esconder elementos do navegador */
            body::before,
            body::after {
              display: none !important;
            }
            /* Remover URLs e timestamps */
            a[href]:after {
              content: none !important;
            }
            /* Garantir que não apareça about:blank */
            html, body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            /* Remover elementos de impressão do navegador */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            /* Remover cabeçalho e rodapé específicos */
            @page {
              @top-left { content: ""; }
              @top-center { content: ""; }
              @top-right { content: ""; }
              @bottom-left { content: ""; }
              @bottom-center { content: ""; }
              @bottom-right { content: ""; }
            }
          }
          .container { 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 28px 19px 19px 28px; /* Superior: 0.75cm, Direita: 0.5cm, Inferior: 1cm, Esquerda: 1.5cm */
          }
          .header { 
            position: relative;
            margin-bottom: 30px;
          }
          .logo {
            position: absolute;
            top: 0;
            left: 0;
            width: 80px;
            height: auto;
          }
          .header-text {
            text-align: center;
            margin-left: 0.5px;
          }
          .institution-name {
            font-family: 'Calibri', sans-serif;
            font-size: 13px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            line-height: 1.3;
          }
          .institution-info {
            font-family: 'Calibri', sans-serif;
            font-size: 13px;
            color: #666;
            line-height: 1.4;
            margin-bottom: 20px;
          }
          .recibo-header {
            text-align: center;
            margin: 80px 0 50px 0;
          }
          .recibo-number {
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 50px;
          }
         .recibo-value {
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            font-weight: bold;
            padding-left: 10em; /* <-- ESTA LINHA CONTROLA O RECUO */
            }
          .recibo-content {
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            line-height: 1.8;
            margin-bottom: 50px;
            text-align: justify;
          }
          .recibo-content strong {
            font-weight: bold;
          }
          .recibo-footer {
            text-align: center;
            margin-top: 60px;
          }
          .date-location {
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            margin-bottom: 50px;
          }
          .signature-section {
            text-align: center;
            margin-top: 50px;
          }
          .signature-line {
            border-bottom: 1px solid #333;
            width: 300px;
            margin: 0 auto 10px auto;
            height: 1px;
          }
          .signature-text {
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            margin-top: 10px;
          }
          .social-text {
            color: #4caf50;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="/logo.png" alt="Logo" class="logo" />
            <div class="header-text">
              <div class="institution-name">
                ASSOCIAÇÃO FILHAS DE SÃO CAMILO – LAR DOS IDOSOS NOSSA SENHORA DA SAÚDE
              </div>
              <div class="institution-info">
                Rua Alfredo Chaves, nº 778 | Centro | CEP: 85.887-000 | Matelândia/PR | Cx. Postal nº 149 |<br>
                Fone (45)3262-1251 | e-mail: larnssaude@gmail.com.br<br>
                CNPJ: 61.986.402/0019-20 | Inscrição Estadual: Isento
              </div>
            </div>
          </div>
          
          <div class="recibo-header">
            <div class="recibo-number">RECIBO Nº ${data.numeroNFSE}</div>
            <div class="recibo-value">&nbsp;&nbsp;&nbsp;&nbsp;Valor: R$ ${data.valorPagamento.toFixed(2).replace('.', ',')}</div>
          </div>
          
          <div class="recibo-content">
            &nbsp;&nbsp;&nbsp;&nbsp;Recebemos do(a) Sr.(a) <strong>${data.nomeResponsavel}</strong> CPF <strong>${data.cpfResponsavel}</strong>, a quantia de <strong>R$ ${data.valorPagamento.toFixed(2).replace('.', ',')}</strong> (${data.valorPorExtenso || 'valor por extenso'}). ${data.tipoIdoso === 'SOCIAL' ? 'Correspondente à participação no custeio da entidade.' : 'Correspondente a doações para nossas obras assistenciais.'}<br><br>
            &nbsp;&nbsp;&nbsp;&nbsp;Referente ao mês de <strong>${data.mesReferencia}</strong>. Conforme ${data.formaPagamento}.<br><br>
            &nbsp;&nbsp;&nbsp;&nbsp;Para clareza firmo(amos) o presente.
          </div>
          
          <div class="recibo-footer">
            <div class="date-location">
              Matelândia, ${new Date().getDate()} de ${new Date().toLocaleDateString('pt-BR', { month: 'long' })} de ${new Date().getFullYear()}.
            </div>
            
            <div class="signature-section">
              <div class="signature-line"></div>
              <div class="signature-text">
                <br>Associação Filhas de São Camilo<br><br>
                Lar dos Idosos Nossa Senhora da Saúde
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  export const getListaIdososHtml = (data: any): string => {
    return `
      <!DOCTYPE html>
      <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lista de Idosos</title>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            color: #333; 
            margin: 0;
            padding: 20px;
            background: white;
          }
          @media print {
            body { 
              margin: 0;
              padding: 15px;
              background: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .container {
              border: none !important;
              box-shadow: none !important;
            }
            /* Remover cabeçalho e rodapé do navegador */
            @page {
              margin: 1.5cm 1cm 1cm 1.5cm; /* Superior, Direita, Inferior, Esquerda */
              size: A4;
            }
            /* Esconder elementos do navegador */
            body::before,
            body::after {
              display: none !important;
            }
            /* Remover URLs e timestamps */
            a[href]:after {
              content: none !important;
            }
            /* Garantir que não apareça about:blank */
            html, body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            /* Remover elementos de impressão do navegador */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            /* Remover cabeçalho e rodapé específicos */
            @page {
              @top-left { content: ""; }
              @top-center { content: ""; }
              @top-right { content: ""; }
              @bottom-left { content: ""; }
              @bottom-center { content: ""; }
              @bottom-right { content: ""; }
            }
          }
          .container { 
            max-width: 1000px; 
            margin: 0 auto; 
            padding: 30px; 
            border: 2px solid #00843D;
            border-radius: 10px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
            border-bottom: 2px solid #00843D;
            padding-bottom: 20px;
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            color: #00843D;
            font-weight: bold;
          }
          .header h2 { 
            margin: 10px 0 0 0; 
            font-size: 20px; 
            color: #005A2A;
            font-weight: normal;
          }
          .idoso-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            background: #f9f9f9;
          }
          .idoso-title {
            font-size: 18px;
            font-weight: bold;
            color: #00843D;
            margin-bottom: 15px;
            border-bottom: 1px solid #00843D;
            padding-bottom: 5px;
          }
          .field-row {
            display: flex;
            margin-bottom: 8px;
          }
          .field-label {
            font-weight: bold;
            color: #005A2A;
            width: 150px;
            display: inline-block;
          }
          .field-value {
            flex: 1;
          }
          .donation {
            color: #00843D;
            font-weight: bold;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            font-size: 14px; 
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #00843D;
            margin-bottom: 10px;
          }
          .summary {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
          }
          .summary strong {
            color: #00843D;
            font-size: 16px;
          }
          .social-text {
            color: #4caf50;
            font-weight: bold;
          }
          .logo {
            position: absolute;
            top: 0;
            left: 0;
            width: 80px;
            height: auto;
          }
          .header-text {
            text-align: center;
            margin-left: 0.5px;
          }
          .institution-name {
            font-family: 'Calibri', sans-serif;
            font-size: 13px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            line-height: 1.3;
          }
          .institution-info {
            font-family: 'Calibri', sans-serif;
            font-size: 13px;
            color: #666;
            line-height: 1.4;
            margin-bottom: 20px;
          }
          .recibo-header {
            text-align: center;
            margin: 80px 0 50px 0;
          }
          .date-location {
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            margin-bottom: 50px;
            text-align: center;
          }
          .signature-section {
            text-align: center;
            margin-top: 50px;
          }
          .signature-line {
            border-bottom: 1px solid #333;
            width: 300px;
            margin: 0 auto 10px auto;
            height: 1px;
          }
          .signature-text {
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            margin-top: 10px;
          }
          .recibo-header h1 {
            font-size: 20px;
            margin: 0;
            color: #00843D;
            font-weight: bold;
          }
          .recibo-header h2 {
            font-size: 16px;
            margin: 10px 0 0 0;
            color: #005A2A;
            font-weight: normal;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="/logo.png" alt="Logo" class="logo" />
            <div class="header-text">
              <div class="institution-name">
                ASSOCIAÇÃO FILHAS DE SÃO CAMILO – LAR DOS IDOSOS NOSSA SENHORA DA SAÚDE
              </div>
              <div class="institution-info">
                Rua Alfredo Chaves, nº 778 | Centro | CEP: 85.887-000 | Matelândia/PR | Cx. Postal nº 149 |<br>
                Fone (45)3262-1251 | e-mail: larnssaude@gmail.com.br<br>
                CNPJ: 61.986.402/0019-20 | Inscrição Estadual: Isento
              </div>
            </div>
          </div>
          
          <div class="recibo-header">
            <h1>MENSALIDADE LAR DOS IDOSOS – ${data.mesReferencia}</h1>
            <h2>Formato: ${data.formato}</h2>
          </div>
          
          <div class="summary">
            <strong>Total de Idosos: ${data.idosos?.length || 0}</strong>
          </div>
          
          ${data.idosos?.map((idoso: any) => `
            <div class="idoso-card">
              <div class="idoso-title">Nome do Idoso: ${idoso.nome} ${idoso.ativo ? '*' : ''}</div>
              
              ${idoso.dataPagamento ? `
              <div class="field-row">
                <span class="field-label">Data Pagamento:</span>
                <span class="field-value"><strong>${idoso.dataPagamento} R$ ${idoso.valorPagamento}</strong></span>
              </div>
              ` : ''}
              
              <div class="field-row">
                <span class="field-label">Referência:</span>
                <span class="field-value"><strong>${data.mesReferencia}</strong></span>
              </div>
              
              ${idoso.tipo === 'SOCIAL' ? `
              <div class="field-row">
                <span class="field-label">SOMENTE NOTA</span>
                <span class="field-value"><strong><span class="social-text">SOCIAL</span></strong></span>
              </div>
              ` : `
              <div class="field-row">
                <span class="field-label">Benefício:</span>
                <span class="field-value"><strong>${idoso.beneficio} X ${idoso.percentualBeneficio}% = ${idoso.valorBeneficio}</strong></span>
              </div>
              
              <div class="field-row">
                <span class="field-label">Doação:</span>
                <span class="field-value"><span class="donation">R$ ${idoso.doacao}</span></span>
              </div>
              `}
              
              <div class="field-row">
                <span class="field-label">CPF:</span>
                <span class="field-value"><strong>${idoso.cpf || 'N/A'}</strong></span>
              </div>
              
              ${idoso.formaPagamento ? `
              <div class="field-row">
                <span class="field-label">Forma pagamento:</span>
                <span class="field-value"><strong>${idoso.formaPagamento}</strong></span>
              </div>
              ` : ''}
              
              ${idoso.numeroNFSE ? `
              <div class="field-row">
                <span class="field-label">NFS-e:</span>
                <span class="field-value"><strong>${idoso.numeroNFSE}</strong></span>
              </div>
              ` : ''}
              
              <div class="field-row">
                <span class="field-label">RESPONSAVEL:</span>
                <span class="field-value"><strong>${idoso.responsavel || 'N/A'}</strong></span>
              </div>
              
              <div class="field-row">
                <span class="field-label">CPF:</span>
                <span class="field-value"><strong>${idoso.cpfResponsavel || 'N/A'}</strong></span>
              </div>
            </div>
          `).join('') || '<div class="idoso-card"><div class="idoso-title">Nenhum idoso encontrado.</div></div>'}
          
          <div class="footer">
            <div class="date-location">
              Matelândia, ${new Date().getDate()} de ${new Date().toLocaleDateString('pt-BR', { month: 'long' })} de ${new Date().getFullYear()}.
            </div>
            
            <div class="signature-section">
              <div class="signature-line"></div>
              <div class="signature-text">
                <br>Associação Filhas de São Camilo<br><br>
                Lar dos Idosos Nossa Senhora da Saúde
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };