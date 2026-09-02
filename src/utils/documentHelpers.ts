import { AthleteDocumentItem, DocumentCategory } from '../types';

/**
 * Utility to download a file cleanly in browser or iframe
 */
export const downloadAthleteDocument = (docItem: { title: string; fileName: string; fileUrl: string }) => {
  try {
    const link = document.createElement('a');
    link.href = docItem.fileUrl;
    link.download = docItem.fileName || `${docItem.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro ao efetuar download:', error);
    // Fallback: open in new tab
    window.open(docItem.fileUrl, '_blank');
  }
};

/**
 * Formats file size in readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Generates a clean, valid sample PDF Data URI for mock demonstration
 */
export const generateSamplePdfDataUrl = (title: string, athleteName: string, category: string, date: string): string => {
  // A minimal valid PDF 1.4 document containing the document metadata
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 260 >>
stream
BT
/F1 18 Tf
50 720 Td
(ACEDEP - ASSOCIACAO CULTURAL ESPORTIVA DE DEFICIENTES PAULISTAS) Tj
/F1 14 Tf
0 -40 Td
(DOCUMENTO: ${title.replace(/[()]/g, '')}) Tj
/F1 12 Tf
0 -30 Td
(Atleta: ${athleteName.replace(/[()]/g, '')}) Tj
0 -20 Td
(Categoria: ${category.replace(/[()]/g, '')}) Tj
0 -20 Td
(Data de Emissao: ${date}) Tj
0 -20 Td
(Status: Homologado e Arquivado na ACEDEP / Centro Paralimpico) Tj
0 -30 Td
(Documento oficial para fins de inscricao e acompanhamento paradesportivo.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000554 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
625
%%EOF`;

  return `data:application/pdf;base64,${btoa(unescape(encodeURIComponent(pdfContent)))}`;
};

/**
 * Initial sample documents for default athletes
 */
export const getInitialSampleDocuments = (athleteName: string): AthleteDocumentItem[] => [
  {
    id: `doc-${athleteName.toLowerCase().replace(/[^a-z0-9]/g, '')}-1`,
    title: 'Laudo Médico de Elegibilidade Paralímpica S14 (CBDI/CPB)',
    category: 'Laudo Médico / Neurológico (S14)',
    fileName: `laudo_elegibilidade_s14_${athleteName.toLowerCase().split(' ')[0]}.pdf`,
    fileUrl: generateSamplePdfDataUrl('Laudo Medico Elegibilidade S14 (CBDI/CPB)', athleteName, 'Laudo Medico / Neurologico (S14)', '12/01/2026'),
    fileSize: '1.4 MB',
    fileType: 'application/pdf',
    uploadedBy: 'Responsável',
    uploadedByName: 'Mariana Silva Pereira',
    uploadedAt: '12/01/2026',
    expiryDate: 'Permanente',
    status: 'Válido',
    notes: 'Laudo neurológico com CID-10 F70 e comprovação de elegibilidade para a classe S14 homologado pela CBDI.',
  },
  {
    id: `doc-${athleteName.toLowerCase().replace(/[^a-z0-9]/g, '')}-2`,
    title: 'Atestado Cardiológico e Aptidão Física para Natação',
    category: 'Atestado Médico / Liberação Piscina',
    fileName: `atestado_cardiologico_${athleteName.toLowerCase().split(' ')[0]}_2026.pdf`,
    fileUrl: generateSamplePdfDataUrl('Atestado Cardiologico e Aptidao Fisica', athleteName, 'Atestado Medico / Liberacao Piscina', '15/02/2026'),
    fileSize: '890 KB',
    fileType: 'application/pdf',
    uploadedBy: 'Responsável',
    uploadedByName: 'Mariana Silva Pereira',
    uploadedAt: '15/02/2026',
    expiryDate: '15/10/2026',
    status: 'Válido',
    notes: 'Apto para atividades físicas de alto rendimento aquático sem restrições. Dr. Roberto CRM/SP 148291.',
  },
  {
    id: `doc-${athleteName.toLowerCase().replace(/[^a-z0-9]/g, '')}-3`,
    title: 'Exame Dermatológico para Uso de Piscinas CPB',
    category: 'Atestado Médico / Liberação Piscina',
    fileName: `exame_dermatologico_piscina_${athleteName.toLowerCase().split(' ')[0]}.pdf`,
    fileUrl: generateSamplePdfDataUrl('Exame Dermatologico para Uso de Piscinas CPB', athleteName, 'Atestado Medico / Liberacao Piscina', '01/02/2026'),
    fileSize: '450 KB',
    fileType: 'application/pdf',
    uploadedBy: 'Técnico',
    uploadedByName: 'Prof. Leonardo Ramos',
    uploadedAt: '01/02/2026',
    expiryDate: '30/08/2026',
    status: 'Válido',
    notes: 'Avaliação dermatológica sem lesões ativas. Válido para o Complexo Aquático do CPB.',
  },
  {
    id: `doc-${athleteName.toLowerCase().replace(/[^a-z0-9]/g, '')}-4`,
    title: 'RG e Documento de Identidade do Atleta (Frente e Verso)',
    category: 'RG / Documento de Identidade do Atleta',
    fileName: `rg_identidade_${athleteName.toLowerCase().split(' ')[0]}.pdf`,
    fileUrl: generateSamplePdfDataUrl('Documento de Identidade RG Atleta', athleteName, 'RG / Documento de Identidade do Atleta', '10/01/2026'),
    fileSize: '1.1 MB',
    fileType: 'application/pdf',
    uploadedBy: 'Responsável',
    uploadedByName: 'Mariana Silva Pereira',
    uploadedAt: '10/01/2026',
    expiryDate: 'Indeterminado',
    status: 'Válido',
    notes: 'Cópia digitalizada do RG e CPF do atleta para inscrições em federações.',
  },
  {
    id: `doc-${athleteName.toLowerCase().replace(/[^a-z0-9]/g, '')}-5`,
    title: 'Termo de Autorização de Imagem e Adesão ACEDEP',
    category: 'Termo de Autorização & Imagem',
    fileName: `termo_autorizacao_adesao_${athleteName.toLowerCase().split(' ')[0]}.pdf`,
    fileUrl: generateSamplePdfDataUrl('Termo de Autorizacao de Imagem e Adesao ACEDEP', athleteName, 'Termo de Autorizacao & Imagem', '10/01/2026'),
    fileSize: '620 KB',
    fileType: 'application/pdf',
    uploadedBy: 'Administrador',
    uploadedByName: 'Coordenação ACEDEP',
    uploadedAt: '10/01/2026',
    expiryDate: '31/12/2026',
    status: 'Válido',
    notes: 'Termo assinado pelo responsável legal autorizando participação nos treinos e eventos da ACEDEP.',
  },
];
