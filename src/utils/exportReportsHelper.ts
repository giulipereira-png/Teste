import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AthleteRecord, AttendanceSession, SwimmingStroke, DisabilityCategory } from '../types';
import { groupAndRankMetrics, STROKE_OPTIONS } from './swimmingMetricsHelper';

// Instituição
export const INSTITUTION_INFO = {
  name: 'ACEDEP - Associação Cultural e Esportiva de Deficientes Paulistas',
  cnpj: '12.579.030/0001-83',
  location: 'Centro Paralímpico Brasileiro (CPB) - Rod. dos Imigrantes, km 11,5 - São Paulo/SP',
  program: 'Programa de Alto Rendimento e Formação - Natação Paralímpica S14 / CBDI / CPB',
  contact: 'contato@acedep.org.br',
};

export type ReportType = 
  | 'athletes_general'
  | 'attendance_monthly'
  | 'attendance_blank_sheet'
  | 'swimming_times_ranking'
  | 'athlete_individual';

export type ExportFormat = 'pdf' | 'word' | 'print';

export interface ExportReportOptions {
  reportType: ReportType;
  format: ExportFormat;
  athletes: AthleteRecord[];
  attendanceSessions?: AttendanceSession[];
  selectedAthleteId?: string;
  selectedMonth?: number; // 0 - 11
  selectedYear?: number;
  selectedStroke?: string; // 'all' or SwimmingStroke
  filterCategory?: string; // 'all' or DisabilityCategory
  sessionTypeFilter?: 'all' | 'treino' | 'campeonato';
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Trigger download of Blob file in browser
 */
function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Format current date for report timestamp
 */
function getFormattedTimestamp(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} às ${hours}:${mins}`;
}

/**
 * ============================================================================
 * 1. WORD (.DOC) EXPORT GENERATION
 * Generates rich HTML with Microsoft Word formatting and UTF-8 BOM
 * ============================================================================
 */
export function generateWordDocument(options: ExportReportOptions): void {
  const { reportType, athletes, attendanceSessions = [], selectedAthleteId, selectedMonth = new Date().getMonth(), selectedYear = new Date().getFullYear(), selectedStroke = 'all', filterCategory = 'all' } = options;

  let title = '';
  let subtitle = '';
  let contentHtml = '';
  const timestamp = getFormattedTimestamp();

  // Filter athletes if needed
  const filteredAthletes = athletes.filter(a => {
    if (filterCategory !== 'all' && a.disabilityCategory !== filterCategory) return false;
    return true;
  });

  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId) || athletes[0];

  if (reportType === 'athletes_general') {
    title = 'RELATÓRIO GERAL DE ATLETAS E CADASTRO';
    subtitle = `Quadro Geral de Nadadores e Responsáveis • Total de Atletas: ${filteredAthletes.length}`;

    contentHtml = `
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 11px;">
        <thead>
          <tr style="background-color: #0c1f38; color: #ffffff; text-align: left;">
            <th style="padding: 8px;">Atleta</th>
            <th style="padding: 8px;">Nascimento / Idade</th>
            <th style="padding: 8px;">Reg. CBDI / CPB</th>
            <th style="padding: 8px;">Condição / Categoria</th>
            <th style="padding: 8px;">Classe</th>
            <th style="padding: 8px;">Responsável Legal</th>
            <th style="padding: 8px;">Telefone / WhatsApp</th>
            <th style="padding: 8px;">Local / Raia</th>
            <th style="padding: 8px;">Assiduidade</th>
          </tr>
        </thead>
        <tbody>
          ${filteredAthletes.map((ath, idx) => `
            <tr style="background-color: ${idx % 2 === 0 ? '#f8fafc' : '#ffffff'};">
              <td style="padding: 6px; font-weight: bold; color: #0c1f38;">${ath.name}</td>
              <td style="padding: 6px;">${ath.birthDate || 'N/I'}</td>
              <td style="padding: 6px; font-family: monospace; font-weight: bold; color: #b45309;">${ath.cbdiRegistration || 'Homologado'}</td>
              <td style="padding: 6px;">${ath.disabilityCategory || 'Deficiente Intelectual'}</td>
              <td style="padding: 6px; font-weight: bold;">${ath.paralympicClass || 'S14'}</td>
              <td style="padding: 6px;">${ath.guardianName || 'N/I'}</td>
              <td style="padding: 6px;">${ath.guardianPhone || 'N/I'}</td>
              <td style="padding: 6px;">${ath.trainingSchedule?.pool || 'CPB 50m'} (${ath.trainingSchedule?.lane || 'Raia 3'})</td>
              <td style="padding: 6px; font-weight: bold; color: #047857;">${ath.attendanceRate || 100}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (reportType === 'attendance_monthly') {
    title = `RELATÓRIO DE FREQUÊNCIA E LISTA DE CHAMADA - ${MONTH_NAMES[selectedMonth].toUpperCase()} / ${selectedYear}`;
    subtitle = `Controle de Assiduidade em Treinos Aquáticos e Campeonatos Oficiais`;

    // Filter sessions for month
    const monthSessions = attendanceSessions.filter(s => {
      if (!s.date) return false;
      const d = new Date(s.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    }).sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    contentHtml = `
      <div style="margin-bottom: 15px; font-family: Arial, sans-serif;">
        <p><strong>Total de Sessões Registradas no Mês:</strong> ${monthSessions.length} (${monthSessions.filter(s => s.type === 'treino').length} Treinos, ${monthSessions.filter(s => s.type === 'campeonato').length} Campeonatos)</p>
      </div>

      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 11px; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #0c1f38; color: #ffffff; text-align: left;">
            <th style="padding: 8px;">Atleta</th>
            <th style="padding: 8px;">Categoria / Reg. CBDI</th>
            <th style="padding: 8px; text-align: center;">Presenças</th>
            <th style="padding: 8px; text-align: center;">Faltas</th>
            <th style="padding: 8px; text-align: center;">Justificadas</th>
            <th style="padding: 8px; text-align: center;">% Frequência</th>
          </tr>
        </thead>
        <tbody>
          ${filteredAthletes.map((ath, idx) => {
            let present = 0;
            let absent = 0;
            let justified = 0;
            monthSessions.forEach(s => {
              const rec = s.records?.find(r => r.athleteId === ath.id);
              if (rec) {
                if (rec.status === 'presente') present++;
                else if (rec.status === 'ausente') absent++;
                else if (rec.status === 'justificado') justified++;
              }
            });
            const total = present + absent + justified;
            const pct = total > 0 ? Math.round((present / total) * 100) : (ath.attendanceRate || 100);

            return `
              <tr style="background-color: ${idx % 2 === 0 ? '#f8fafc' : '#ffffff'};">
                <td style="padding: 6px; font-weight: bold; color: #0c1f38;">${ath.name}</td>
                <td style="padding: 6px;">${ath.disabilityCategory || 'Deficiente Intelectual'} (${ath.cbdiRegistration || 'CBDI'})</td>
                <td style="padding: 6px; text-align: center; font-weight: bold; color: #047857;">${present}</td>
                <td style="padding: 6px; text-align: center; font-weight: bold; color: #b91c1c;">${absent}</td>
                <td style="padding: 6px; text-align: center; color: #d97706;">${justified}</td>
                <td style="padding: 6px; text-align: center; font-weight: bold; color: ${pct >= 85 ? '#047857' : '#b91c1c'};">${pct}%</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <h3 style="font-family: Arial, sans-serif; color: #0c1f38; border-bottom: 2px solid #0c1f38; padding-bottom: 4px; margin-top: 20px;">Detalhamento das Sessões e Campeonatos</h3>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 11px;">
        <thead>
          <tr style="background-color: #1e3a5f; color: #ffffff;">
            <th style="padding: 6px;">Data</th>
            <th style="padding: 6px;">Tipo</th>
            <th style="padding: 6px;">Título / Evento</th>
            <th style="padding: 6px;">Local</th>
            <th style="padding: 6px;">Quórum de Atletas</th>
          </tr>
        </thead>
        <tbody>
          ${monthSessions.map((s, idx) => {
            const presCount = s.records?.filter(r => r.status === 'presente').length || 0;
            const totalCount = s.records?.length || athletes.length;
            return `
              <tr style="background-color: ${idx % 2 === 0 ? '#f8fafc' : '#ffffff'};">
                <td style="padding: 6px; font-weight: bold;">${s.date}</td>
                <td style="padding: 6px; text-transform: uppercase; font-weight: bold; color: ${s.type === 'campeonato' ? '#b45309' : '#0284c7'};">${s.type}</td>
                <td style="padding: 6px; font-weight: bold;">${s.title}</td>
                <td style="padding: 6px;">${s.location || 'CPB'}</td>
                <td style="padding: 6px; font-weight: bold;">${presCount} de ${totalCount} presentes (${Math.round((presCount / (totalCount || 1)) * 100)}%)</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } else if (reportType === 'attendance_blank_sheet') {
    title = 'LISTA DE CHAMADA OFICIAL EM BRANCO (BORDA DE PISCINA / COMPETIÇÃO)';
    subtitle = `Para Preenchimento Manual da Comissão Técnica da ACEDEP em Treinos e Viagens`;

    contentHtml = `
      <div style="margin-bottom: 15px; font-family: Arial, sans-serif; font-size: 12px; border: 1px solid #cbd5e1; padding: 10px; background-color: #f8fafc;">
        <p style="margin: 3px 0;"><strong>Evento / Atividade:</strong> ____________________________________________________________________</p>
        <p style="margin: 3px 0;"><strong>Data:</strong> ____ / ____ / 2026 &nbsp;&nbsp;&nbsp;&nbsp; <strong>Horário:</strong> ____:____ às ____:____ &nbsp;&nbsp;&nbsp;&nbsp; <strong>Local / Piscina:</strong> ________________________</p>
        <p style="margin: 3px 0;"><strong>Professor / Treinador Responsável:</strong> ____________________________________________________</p>
      </div>

      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 11px;">
        <thead>
          <tr style="background-color: #0c1f38; color: #ffffff;">
            <th style="width: 35px; text-align: center;">Nº</th>
            <th style="padding: 8px;">Nome do Atleta</th>
            <th style="padding: 8px;">Reg. CBDI</th>
            <th style="padding: 8px;">Condição / Categoria</th>
            <th style="width: 70px; text-align: center;">Presente [ P ]</th>
            <th style="width: 70px; text-align: center;">Falta [ F ]</th>
            <th style="padding: 8px;">Assinatura / Visto / Observação</th>
          </tr>
        </thead>
        <tbody>
          ${filteredAthletes.map((ath, idx) => `
            <tr>
              <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
              <td style="font-weight: bold; color: #0c1f38;">${ath.name}</td>
              <td style="font-family: monospace;">${ath.cbdiRegistration || 'CBDI-SP'}</td>
              <td>${ath.disabilityCategory || 'Deficiente Intelectual'}</td>
              <td style="text-align: center;">( &nbsp;&nbsp; )</td>
              <td style="text-align: center;">( &nbsp;&nbsp; )</td>
              <td>__________________________________</td>
            </tr>
          `).join('')}
          ${Array.from({ length: 4 }).map((_, i) => `
            <tr>
              <td style="text-align: center; font-weight: bold;">${filteredAthletes.length + i + 1}</td>
              <td>________________________________________</td>
              <td>_______________</td>
              <td>_______________</td>
              <td style="text-align: center;">( &nbsp;&nbsp; )</td>
              <td style="text-align: center;">( &nbsp;&nbsp; )</td>
              <td>__________________________________</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (reportType === 'swimming_times_ranking') {
    title = 'RELATÓRIO DE TEMPOS OFICIAIS, RANKING E RECORDES PESSOAIS (RP)';
    subtitle = `Quadro de Marcas e Evolução Cronometrada de Natação Paralímpica S14`;

    const strokeList = selectedStroke === 'all' 
      ? STROKE_OPTIONS 
      : [selectedStroke as SwimmingStroke];

    contentHtml = `
      <div style="margin-bottom: 15px; font-family: Arial, sans-serif;">
        <p>Este relatório consolida os melhores tempos oficiais (Recordes Pessoais - RP) e histórico de tomadas de tempo em campeonatos CBDI, FAP e Circuito CPB.</p>
      </div>

      ${filteredAthletes.map(ath => {
        const { allEventGroups } = groupAndRankMetrics(ath.swimmingMetrics || []);
        const filteredGroups = selectedStroke === 'all' 
          ? allEventGroups 
          : allEventGroups.filter(g => g.stroke === selectedStroke);

        if (filteredGroups.length === 0) {
          return `
            <div style="margin-bottom: 20px; font-family: Arial, sans-serif;">
              <h3 style="color: #0c1f38; border-bottom: 2px solid #0c1f38; padding-bottom: 3px;">Atleta: ${ath.name} (Reg. CBDI: ${ath.cbdiRegistration || 'Homologado'} - ${ath.disabilityCategory || 'S14'})</h3>
              <p style="color: #64748b; font-style: italic;">Nenhum tempo oficial registrado para este filtro.</p>
            </div>
          `;
        }

        return `
          <div style="margin-bottom: 25px; font-family: Arial, sans-serif;">
            <h3 style="color: #0c1f38; border-bottom: 2px solid #0c1f38; padding-bottom: 3px; margin-bottom: 8px;">
              Atleta: ${ath.name} <span style="font-size: 12px; font-weight: normal; color: #475569;">• Reg. CBDI: <strong>${ath.cbdiRegistration || 'Homologado'}</strong> • Categoria: <strong>${ath.disabilityCategory || 'Def. Intelectual'}</strong> • Classe: <strong>${ath.paralympicClass || 'S14'}</strong></span>
            </h3>

            <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; font-size: 11px;">
              <thead>
                <tr style="background-color: #1e3a5f; color: #ffffff;">
                  <th style="padding: 6px;">Prova / Estilo</th>
                  <th style="padding: 6px; text-align: center;">Posição</th>
                  <th style="padding: 6px; text-align: center;">Tempo Oficial</th>
                  <th style="padding: 6px;">Campeonato / Etapa</th>
                  <th style="padding: 6px; text-align: center;">Ano / Data</th>
                  <th style="padding: 6px; text-align: center;">Evolução / Delta</th>
                  <th style="padding: 6px;">Piscina</th>
                </tr>
              </thead>
              <tbody>
                ${filteredGroups.map(grp => 
                  grp.allMetrics.map((m, mIdx) => `
                    <tr style="background-color: ${m.rank === 1 ? '#fefce8' : (mIdx % 2 === 0 ? '#f8fafc' : '#ffffff')};">
                      <td style="padding: 5px; font-weight: bold; color: #0c1f38;">${grp.event}</td>
                      <td style="padding: 5px; text-align: center; font-weight: bold;">${m.rank === 1 ? '🥇 RECORDE PESSOAL (RP)' : `${m.rank}º melhor tempo`}</td>
                      <td style="padding: 5px; text-align: center; font-family: monospace; font-size: 12px; font-weight: bold; color: ${m.rank === 1 ? '#b45309' : '#0c1f38'};">${m.bestTime}</td>
                      <td style="padding: 5px;">${m.stageName || 'Campeonato Oficial'}</td>
                      <td style="padding: 5px; text-align: center;">${m.year || ''} ${m.dateRecorded ? `(${m.dateRecorded})` : ''}</td>
                      <td style="padding: 5px; text-align: center; font-weight: bold; color: ${(m.differenceFromPrevious || '').startsWith('-') ? '#047857' : '#b45309'};">
                        ${m.rank === 1 ? 'Melhor Marca' : (m.differenceFromBest || m.differenceFromPrevious || m.evolution || '-')}
                      </td>
                      <td style="padding: 5px;">${m.laneType || '50m'}</td>
                    </tr>
                  `).join('')
                ).join('')}
              </tbody>
            </table>
          </div>
        `;
      }).join('')}
    `;
  } else if (reportType === 'athlete_individual') {
    title = `DOSSIÊ E FICHA INDIVIDUAL DO ATLETA`;
    subtitle = `${selectedAthlete.name} • Associação Cultural e Esportiva de Deficientes Paulistas`;

    const { allEventGroups } = groupAndRankMetrics(selectedAthlete.swimmingMetrics || []);

    contentHtml = `
      <div style="font-family: Arial, sans-serif; font-size: 12px; margin-bottom: 20px;">
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
          <tr style="background-color: #0c1f38; color: #ffffff;">
            <th colspan="2" style="font-size: 13px; text-align: left;">1. DADOS CADASTRAIS & PARADESPORTIVOS</th>
          </tr>
          <tr>
            <td style="width: 50%;"><strong>Nome Completo:</strong> ${selectedAthlete.name}</td>
            <td style="width: 50%;"><strong>Data de Nascimento / Idade:</strong> ${selectedAthlete.birthDate || 'N/I'}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td><strong>Registro CBDI / CPB:</strong> <span style="font-family: monospace; font-weight: bold; color: #b45309;">${selectedAthlete.cbdiRegistration || 'Homologado'}</span></td>
            <td><strong>Matrícula Clube:</strong> ${selectedAthlete.clubRegistration || 'ACEDEP-2026'}</td>
          </tr>
          <tr>
            <td><strong>Condição / Categoria:</strong> <span style="font-weight: bold;">${selectedAthlete.disabilityCategory || 'Deficiente Intelectual'}</span></td>
            <td><strong>Classe Paralímpica:</strong> <span style="font-weight: bold;">${selectedAthlete.paralympicClass || 'S14'}</span></td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td><strong>Responsável Legal:</strong> ${selectedAthlete.guardianName || 'Família'}</td>
            <td><strong>Contato / WhatsApp:</strong> ${selectedAthlete.guardianPhone || 'N/I'}</td>
          </tr>
          <tr>
            <td><strong>E-mail de Notificações:</strong> ${selectedAthlete.guardianEmail || 'N/I'}</td>
            <td><strong>Local & Raia de Treino:</strong> ${selectedAthlete.trainingSchedule?.pool || 'CPB 50m'} (${selectedAthlete.trainingSchedule?.lane || 'Raia 3'})</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td><strong>Frequência Geral:</strong> <span style="font-weight: bold; color: #047857;">${selectedAthlete.attendanceRate || 100}%</span></td>
            <td><strong>Código de Acesso Portal:</strong> <span style="font-family: monospace;">${selectedAthlete.accessCode || '******'}</span></td>
          </tr>
        </table>

        <h3 style="color: #0c1f38; border-bottom: 2px solid #0c1f38; padding-bottom: 4px; margin-top: 25px;">2. QUADRO DE RECORDES PESSOAIS (RP) & TEMPOS EM CAMPEONATOS</h3>
        ${allEventGroups.length === 0 ? '<p style="color: #64748b; font-style: italic;">Nenhum tempo oficial registrado.</p>' : `
          <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; font-size: 11px; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #1e3a5f; color: #ffffff;">
                <th style="padding: 6px;">Prova / Estilo</th>
                <th style="padding: 6px; text-align: center;">Posição</th>
                <th style="padding: 6px; text-align: center;">Tempo Oficial</th>
                <th style="padding: 6px;">Campeonato / Etapa</th>
                <th style="padding: 6px; text-align: center;">Ano / Data</th>
                <th style="padding: 6px; text-align: center;">Evolução</th>
              </tr>
            </thead>
            <tbody>
              ${allEventGroups.map(grp => 
                grp.allMetrics.map(m => `
                  <tr style="background-color: ${m.rank === 1 ? '#fefce8' : '#ffffff'};">
                    <td style="padding: 5px; font-weight: bold; color: #0c1f38;">${grp.event}</td>
                    <td style="padding: 5px; text-align: center; font-weight: bold;">${m.rank === 1 ? '🥇 RECORDE PESSOAL (RP)' : `${m.rank}º tempo`}</td>
                    <td style="padding: 5px; text-align: center; font-family: monospace; font-size: 12px; font-weight: bold; color: ${m.rank === 1 ? '#b45309' : '#0c1f38'};">${m.bestTime}</td>
                    <td style="padding: 5px;">${m.stageName || 'Campeonato Oficial'}</td>
                    <td style="padding: 5px; text-align: center;">${m.year || ''}</td>
                    <td style="padding: 5px; text-align: center; font-weight: bold; color: #047857;">${m.rank === 1 ? 'Melhor Marca' : (m.differenceFromBest || '-')}</td>
                  </tr>
                `).join('')
              ).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;
  }

  // Full Word Document HTML Structure
  const fullHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 2cm 1.5cm 2cm 1.5cm;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #0f172a;
            line-height: 1.4;
          }
          .header-box {
            border-bottom: 3px double #0c1f38;
            padding-bottom: 12px;
            margin-bottom: 20px;
            text-align: center;
          }
          .inst-title {
            font-size: 16pt;
            font-weight: bold;
            color: #0c1f38;
            margin: 0;
          }
          .inst-sub {
            font-size: 9pt;
            color: #475569;
            margin: 3px 0;
          }
          .report-title {
            font-size: 14pt;
            font-weight: bold;
            color: #b45309;
            margin: 12px 0 3px 0;
            text-transform: uppercase;
          }
          .report-sub {
            font-size: 10pt;
            color: #334155;
            margin: 0 0 10px 0;
          }
          .footer-box {
            margin-top: 30px;
            border-top: 1px solid #cbd5e1;
            padding-top: 8px;
            font-size: 8pt;
            color: #64748b;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <p class="inst-title">${INSTITUTION_INFO.name}</p>
          <p class="inst-sub"><strong>CNPJ:</strong> ${INSTITUTION_INFO.cnpj} • <strong>Sede:</strong> ${INSTITUTION_INFO.location}</p>
          <p class="inst-sub">${INSTITUTION_INFO.program}</p>
          <h1 class="report-title">${title}</h1>
          <p class="report-sub">${subtitle}</p>
          <p style="font-size: 8pt; color: #64748b; margin: 0;">Documento emitido em: <strong>${timestamp}</strong> pelo Sistema Oficial ACEDEP</p>
        </div>

        <div class="content-body">
          ${contentHtml}
        </div>

        <div class="footer-box">
          <p>ACEDEP - Associação Cultural e Esportiva de Deficientes Paulistas | CNPJ: ${INSTITUTION_INFO.cnpj}</p>
          <p>Relatório gerado eletronicamente para fins cadastrais, de acompanhamento técnico e prestação de contas esportivas.</p>
        </div>
      </body>
    </html>
  `;

  // Create Blob with Word MIME type and UTF-8 BOM
  const blob = new Blob(['\ufeff', fullHtml], {
    type: 'application/msword;charset=utf-8'
  });

  const sanitizedFileName = `${reportType}_acedep_${new Date().toISOString().split('T')[0]}.doc`;
  triggerBlobDownload(blob, sanitizedFileName);
}

/**
 * ============================================================================
 * 2. PDF EXPORT GENERATION
 * Generates structured, high-resolution PDF with jsPDF & AutoTable
 * ============================================================================
 */
export function generatePdfDocument(options: ExportReportOptions): void {
  const { reportType, athletes, attendanceSessions = [], selectedAthleteId, selectedMonth = new Date().getMonth(), selectedYear = new Date().getFullYear(), selectedStroke = 'all', filterCategory = 'all' } = options;

  const doc = new jsPDF({
    orientation: reportType === 'attendance_monthly' || reportType === 'athletes_general' || reportType === 'attendance_blank_sheet' ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const timestamp = getFormattedTimestamp();

  // Helper for Header
  const drawHeader = (docInstance: jsPDF, titleText: string, subtitleText: string) => {
    // Header background banner
    docInstance.setFillColor(12, 31, 56); // #0c1f38
    docInstance.rect(0, 0, pageWidth, 24, 'F');

    // Gold accent stripe
    docInstance.setFillColor(212, 175, 55); // #d4af37
    docInstance.rect(0, 24, pageWidth, 1.5, 'F');

    // Institution Name
    docInstance.setFont('helvetica', 'bold');
    docInstance.setFontSize(11);
    docInstance.setTextColor(255, 255, 255);
    docInstance.text('ACEDEP - ASSOCIAÇÃO CULTURAL E ESPORTIVA DE DEFICIENTES PAULISTAS', 14, 9);

    // Sub details
    docInstance.setFont('helvetica', 'normal');
    docInstance.setFontSize(7.5);
    docInstance.setTextColor(220, 220, 230);
    docInstance.text(`CNPJ: ${INSTITUTION_INFO.cnpj}  |  Centro Paralímpico Brasileiro (CPB)  |  Natação S14 / CBDI`, 14, 15);
    docInstance.text(`Emitido em: ${timestamp}`, pageWidth - 14, 15, { align: 'right' });

    // Document Title Bar below
    docInstance.setFont('helvetica', 'bold');
    docInstance.setFontSize(12);
    docInstance.setTextColor(12, 31, 56);
    docInstance.text(titleText, 14, 32);

    docInstance.setFont('helvetica', 'normal');
    docInstance.setFontSize(8.5);
    docInstance.setTextColor(80, 90, 105);
    docInstance.text(subtitleText, 14, 37);

    // Divider line
    docInstance.setDrawColor(200, 210, 225);
    docInstance.line(14, 39, pageWidth - 14, 39);
  };

  // Helper for Footer
  const drawFooter = (docInstance: jsPDF) => {
    const pageCount = (docInstance.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      docInstance.setPage(i);
      docInstance.setDrawColor(220, 225, 235);
      docInstance.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

      docInstance.setFont('helvetica', 'normal');
      docInstance.setFontSize(7);
      docInstance.setTextColor(120, 130, 145);
      docInstance.text(`ACEDEP - CNPJ: ${INSTITUTION_INFO.cnpj}  •  Sistema de Gestão Esportiva & Acompanhamento de Atletas`, 14, pageHeight - 7);
      docInstance.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
    }
  };

  // Filter athletes
  const filteredAthletes = athletes.filter(a => {
    if (filterCategory !== 'all' && a.disabilityCategory !== filterCategory) return false;
    return true;
  });

  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId) || athletes[0];

  if (reportType === 'athletes_general') {
    drawHeader(doc, 'RELATÓRIO GERAL DE ATLETAS E CADASTRO', `Quadro Geral de Nadadores e Responsáveis • Total: ${filteredAthletes.length} atletas`);

    const tableRows = filteredAthletes.map((ath, idx) => [
      idx + 1,
      ath.name,
      ath.birthDate || '-',
      ath.cbdiRegistration || 'Homologado',
      ath.disabilityCategory || 'Deficiente Intelectual',
      ath.paralympicClass || 'S14',
      ath.guardianName || '-',
      ath.guardianPhone || '-',
      `${ath.trainingSchedule?.pool || 'CPB'} (${ath.trainingSchedule?.lane || 'R3'})`,
      `${ath.attendanceRate || 100}%`
    ]);

    autoTable(doc, {
      startY: 42,
      head: [['#', 'Atleta', 'Nascimento', 'Reg. CBDI', 'Condição / Categoria', 'Classe', 'Responsável', 'Telefone', 'Piscina / Raia', 'Frequência']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [12, 31, 56], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, cellPadding: 2 },
      alternateRowStyles: { fillColor: [245, 248, 252] },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { fontStyle: 'bold', cellWidth: 45 },
        3: { fontStyle: 'bold', textColor: [180, 83, 9] },
        9: { fontStyle: 'bold', textColor: [4, 120, 87], halign: 'center' }
      },
      margin: { left: 14, right: 14 },
    });

  } else if (reportType === 'attendance_monthly') {
    const monthSessions = attendanceSessions.filter(s => {
      if (!s.date) return false;
      const d = new Date(s.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    }).sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    drawHeader(
      doc, 
      `FREQUÊNCIA E LISTA DE CHAMADA - ${MONTH_NAMES[selectedMonth].toUpperCase()} / ${selectedYear}`,
      `Total de Sessões no Mês: ${monthSessions.length} (${monthSessions.filter(s => s.type === 'treino').length} Treinos, ${monthSessions.filter(s => s.type === 'campeonato').length} Campeonatos)`
    );

    const summaryRows = filteredAthletes.map(ath => {
      let present = 0;
      let absent = 0;
      let justified = 0;
      monthSessions.forEach(s => {
        const rec = s.records?.find(r => r.athleteId === ath.id);
        if (rec) {
          if (rec.status === 'presente') present++;
          else if (rec.status === 'ausente') absent++;
          else if (rec.status === 'justificado') justified++;
        }
      });
      const total = present + absent + justified;
      const pct = total > 0 ? Math.round((present / total) * 100) : (ath.attendanceRate || 100);

      return [
        ath.name,
        ath.cbdiRegistration || 'Homologado',
        ath.disabilityCategory || 'Def. Intelectual',
        present,
        absent,
        justified,
        `${pct}%`
      ];
    });

    autoTable(doc, {
      startY: 42,
      head: [['Atleta', 'Reg. CBDI', 'Condição', 'Presenças', 'Faltas', 'Justificadas', '% Frequência']],
      body: summaryRows,
      theme: 'grid',
      headStyles: { fillColor: [12, 31, 56], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, cellPadding: 2.2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { fontStyle: 'bold', textColor: [180, 83, 9] },
        3: { halign: 'center', textColor: [4, 120, 87], fontStyle: 'bold' },
        4: { halign: 'center', textColor: [185, 28, 28], fontStyle: 'bold' },
        5: { halign: 'center', textColor: [217, 119, 6] },
        6: { halign: 'center', fontStyle: 'bold', textColor: [12, 31, 56] }
      },
      margin: { left: 14, right: 14 },
    });

    // Detailed sessions subtable
    const lastY = (doc as any).lastAutoTable.finalY || 100;
    if (lastY < pageHeight - 50) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(12, 31, 56);
      doc.text('Sessões Realizadas no Mês:', 14, lastY + 8);

      const sessionRows = monthSessions.map(s => {
        const presCount = s.records?.filter(r => r.status === 'presente').length || 0;
        const totalCount = s.records?.length || athletes.length;
        return [
          s.date,
          s.type.toUpperCase(),
          s.title,
          s.location || 'CPB',
          `${presCount} de ${totalCount} atletas (${Math.round((presCount / (totalCount || 1)) * 100)}%)`
        ];
      });

      autoTable(doc, {
        startY: lastY + 11,
        head: [['Data', 'Tipo', 'Título / Evento', 'Local', 'Quórum de Presença']],
        body: sessionRows,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255], fontSize: 7.5 },
        bodyStyles: { fontSize: 7.5, cellPadding: 1.8 },
        margin: { left: 14, right: 14 },
      });
    }

  } else if (reportType === 'attendance_blank_sheet') {
    drawHeader(
      doc, 
      'LISTA DE CHAMADA OFICIAL EM BRANCO (BORDA DE PISCINA / COMPETIÇÃO)',
      'Para Controle Presencial Manual da Comissão Técnica da ACEDEP'
    );

    // Box with session info blanks
    doc.setDrawColor(200, 210, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 42, pageWidth - 28, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(12, 31, 56);
    doc.text('Evento / Atividade: ___________________________________________   Data: ___ / ___ / 2026   Horário: ___:___ às ___:___', 18, 48);
    doc.text('Local / Piscina: _____________________________________________   Professor / Técnico Responsável: ______________________', 18, 54);

    const blankRows = filteredAthletes.map((ath, idx) => [
      idx + 1,
      ath.name,
      ath.cbdiRegistration || 'CBDI-SP',
      ath.disabilityCategory || 'Def. Intelectual',
      '[   ]',
      '[   ]',
      '_________________________________'
    ]);

    // Extra empty lines for guests
    for (let i = 1; i <= 3; i++) {
      blankRows.push([
        filteredAthletes.length + i,
        '__________________________________',
        '___________',
        '___________',
        '[   ]',
        '[   ]',
        '_________________________________'
      ]);
    }

    autoTable(doc, {
      startY: 62,
      head: [['#', 'Nome do Atleta', 'Reg. CBDI', 'Condição', 'Presente', 'Falta', 'Assinatura / Visto / Observações']],
      body: blankRows,
      theme: 'grid',
      headStyles: { fillColor: [12, 31, 56], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, cellPadding: 2.8 },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { fontStyle: 'bold', cellWidth: 60 },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 18, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    });

  } else if (reportType === 'swimming_times_ranking') {
    drawHeader(
      doc, 
      'RELATÓRIO DE TEMPOS OFICIAIS, RANKING & RECORDES PESSOAIS (RP)',
      'Quadro Consolidado de Melhores Marcas e Evolução Cronometrada de Natação Paralímpica S14'
    );

    let startY = 42;

    filteredAthletes.forEach(ath => {
      const { allEventGroups } = groupAndRankMetrics(ath.swimmingMetrics || []);
      const filteredGroups = selectedStroke === 'all' 
        ? allEventGroups 
        : allEventGroups.filter(g => g.stroke === selectedStroke);

      if (filteredGroups.length > 0) {
        const rows: any[] = [];
        filteredGroups.forEach(grp => {
          grp.allMetrics.forEach(m => {
            rows.push([
              grp.event,
              m.rank === 1 ? '🥇 RP' : `${m.rank}º tempo`,
              m.bestTime,
              m.stageName || 'Oficial',
              m.year || '-',
              m.rank === 1 ? 'Melhor Marca' : (m.differenceFromBest || m.differenceFromPrevious || '-'),
              m.laneType || '50m'
            ]);
          });
        });

        // Add athlete section title
        if (startY > pageHeight - 40) {
          doc.addPage();
          drawHeader(doc, 'RELATÓRIO DE TEMPOS OFICIAIS & RANKING (CONT.)', 'Natação Paralímpica S14 • ACEDEP');
          startY = 42;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(12, 31, 56);
        doc.text(`Atleta: ${ath.name}   |   Reg. CBDI: ${ath.cbdiRegistration || 'Homologado'}   |   Categoria: ${ath.disabilityCategory || 'Def. Intelectual'}`, 14, startY);

        autoTable(doc, {
          startY: startY + 2,
          head: [['Prova', 'Classificação', 'Tempo', 'Campeonato', 'Ano', 'Evolução', 'Piscina']],
          body: rows,
          theme: 'striped',
          headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
          bodyStyles: { fontSize: 7.5, cellPadding: 1.8 },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 32 },
            1: { fontStyle: 'bold', halign: 'center' },
            2: { fontStyle: 'bold', textColor: [180, 83, 9], halign: 'center' },
            5: { fontStyle: 'bold', textColor: [4, 120, 87], halign: 'center' }
          },
          margin: { left: 14, right: 14 },
        });

        startY = (doc as any).lastAutoTable.finalY + 8;
      }
    });

  } else if (reportType === 'athlete_individual') {
    drawHeader(
      doc, 
      `DOSSIÊ INDIVIDUAL: ${selectedAthlete.name.toUpperCase()}`,
      `Ficha Cadastral, Histórico de Tempos e Acompanhamento Paradesportivo • ACEDEP`
    );

    // Profile summary card
    const athleteInfo = [
      ['Nome Completo:', selectedAthlete.name, 'Data Nascimento / Idade:', selectedAthlete.birthDate || 'N/I'],
      ['Registro CBDI / CPB:', selectedAthlete.cbdiRegistration || 'Homologado', 'Matrícula Clube:', selectedAthlete.clubRegistration || 'ACEDEP-2026'],
      ['Categoria / Condição:', selectedAthlete.disabilityCategory || 'Deficiente Intelectual', 'Classe Paralímpica:', selectedAthlete.paralympicClass || 'S14'],
      ['Responsável Legal:', selectedAthlete.guardianName || 'Família', 'Telefone / WhatsApp:', selectedAthlete.guardianPhone || 'N/I'],
      ['E-mail Notificações:', selectedAthlete.guardianEmail || 'N/I', 'Local & Raia de Treino:', `${selectedAthlete.trainingSchedule?.pool || 'CPB 50m'} (${selectedAthlete.trainingSchedule?.lane || 'Raia 3'})`],
      ['Frequência Geral:', `${selectedAthlete.attendanceRate || 100}%`, 'Status do Atleta:', 'Ativo / Homologado no Sistema']
    ];

    autoTable(doc, {
      startY: 42,
      head: [['DADOS CADASTRAIS & PARADESPORTIVOS', '', '', '']],
      body: athleteInfo,
      theme: 'plain',
      headStyles: { fillColor: [12, 31, 56], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [12, 31, 56], cellWidth: 40 },
        1: { cellWidth: 55 },
        2: { fontStyle: 'bold', textColor: [12, 31, 56], cellWidth: 40 },
        3: { cellWidth: 55 },
      },
      margin: { left: 14, right: 14 },
    });

    const lastY = (doc as any).lastAutoTable.finalY + 8;
    const { allEventGroups } = groupAndRankMetrics(selectedAthlete.swimmingMetrics || []);

    if (allEventGroups.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(12, 31, 56);
      doc.text('Quadro de Recordes Pessoais (RP) e Tempos Oficiais:', 14, lastY);

      const rows: any[] = [];
      allEventGroups.forEach(grp => {
        grp.allMetrics.forEach(m => {
          rows.push([
            grp.event,
            m.rank === 1 ? '🥇 RECORDE PESSOAL (RP)' : `${m.rank}º melhor tempo`,
            m.bestTime,
            m.stageName || 'Campeonato Oficial',
            m.year || '-',
            m.rank === 1 ? 'Melhor Marca' : (m.differenceFromBest || '-')
          ]);
        });
      });

      autoTable(doc, {
        startY: lastY + 3,
        head: [['Prova / Estilo', 'Classificação', 'Tempo Oficial', 'Campeonato', 'Ano', 'Evolução']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, cellPadding: 2.2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { fontStyle: 'bold', halign: 'center' },
          2: { fontStyle: 'bold', textColor: [180, 83, 9], halign: 'center' },
          5: { fontStyle: 'bold', textColor: [4, 120, 87], halign: 'center' }
        },
        margin: { left: 14, right: 14 },
      });
    }
  }

  // Draw footer across all pages
  drawFooter(doc);

  // Save PDF
  const sanitizedFileName = `${reportType}_acedep_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(sanitizedFileName);
}

/**
 * ============================================================================
 * 3. PRINT / SAVE AS PDF VIA BROWSER DIALOG
 * Opens clean, styled printable window
 * ============================================================================
 */
export function openPrintableView(options: ExportReportOptions): void {
  // Leverage generateWordDocument logic or open a dedicated print window
  const { reportType, athletes, attendanceSessions = [], selectedAthleteId, selectedMonth = new Date().getMonth(), selectedYear = new Date().getFullYear(), selectedStroke = 'all', filterCategory = 'all' } = options;

  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    alert('Por favor, permita pop-ups para abrir a visualização de impressão.');
    return;
  }

  // We can write clean HTML with window.print() trigger
  const timestamp = getFormattedTimestamp();
  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId) || athletes[0];
  const filteredAthletes = athletes.filter(a => filterCategory === 'all' || a.disabilityCategory === filterCategory);

  let bodyContent = '';

  if (reportType === 'athletes_general') {
    bodyContent = `
      <h2>RELATÓRIO GERAL DE ATLETAS E CADASTRO</h2>
      <p class="subtitle">Quadro Geral de Nadadores e Responsáveis • Total: ${filteredAthletes.length} atletas</p>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Atleta</th>
            <th>Nascimento</th>
            <th>Reg. CBDI</th>
            <th>Categoria</th>
            <th>Classe</th>
            <th>Responsável</th>
            <th>Telefone</th>
            <th>Frequência</th>
          </tr>
        </thead>
        <tbody>
          ${filteredAthletes.map((ath, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${ath.name}</strong></td>
              <td>${ath.birthDate || '-'}</td>
              <td><span class="cbdi">${ath.cbdiRegistration || 'Homologado'}</span></td>
              <td>${ath.disabilityCategory || 'Deficiente Intelectual'}</td>
              <td><strong>${ath.paralympicClass || 'S14'}</strong></td>
              <td>${ath.guardianName || '-'}</td>
              <td>${ath.guardianPhone || '-'}</td>
              <td><strong>${ath.attendanceRate || 100}%</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (reportType === 'attendance_monthly') {
    const monthSessions = attendanceSessions.filter(s => {
      if (!s.date) return false;
      const d = new Date(s.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    }).sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    bodyContent = `
      <h2>RELATÓRIO DE FREQUÊNCIA E LISTA DE CHAMADA - ${MONTH_NAMES[selectedMonth].toUpperCase()} / ${selectedYear}</h2>
      <p class="subtitle">Controle de Assiduidade em Treinos Aquáticos e Campeonatos Oficiais (${monthSessions.length} sessões)</p>
      <table>
        <thead>
          <tr>
            <th>Atleta</th>
            <th>Reg. CBDI</th>
            <th>Categoria</th>
            <th style="text-align:center;">Presenças</th>
            <th style="text-align:center;">Faltas</th>
            <th style="text-align:center;">Justificadas</th>
            <th style="text-align:center;">% Assiduidade</th>
          </tr>
        </thead>
        <tbody>
          ${filteredAthletes.map(ath => {
            let present = 0;
            let absent = 0;
            let justified = 0;
            monthSessions.forEach(s => {
              const rec = s.records?.find(r => r.athleteId === ath.id);
              if (rec) {
                if (rec.status === 'presente') present++;
                else if (rec.status === 'ausente') absent++;
                else if (rec.status === 'justificado') justified++;
              }
            });
            const total = present + absent + justified;
            const pct = total > 0 ? Math.round((present / total) * 100) : (ath.attendanceRate || 100);

            return `
              <tr>
                <td><strong>${ath.name}</strong></td>
                <td><span class="cbdi">${ath.cbdiRegistration || 'Homologado'}</span></td>
                <td>${ath.disabilityCategory || 'Deficiente Intelectual'}</td>
                <td style="text-align:center; color:#047857; font-weight:bold;">${present}</td>
                <td style="text-align:center; color:#b91c1c; font-weight:bold;">${absent}</td>
                <td style="text-align:center; color:#d97706;">${justified}</td>
                <td style="text-align:center; font-weight:bold;">${pct}%</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } else if (reportType === 'attendance_blank_sheet') {
    bodyContent = `
      <h2>LISTA DE CHAMADA OFICIAL EM BRANCO (BORDA DE PISCINA / COMPETIÇÃO)</h2>
      <div style="border: 1px solid #cbd5e1; padding: 12px; margin: 15px 0; background: #f8fafc; border-radius: 6px;">
        <p style="margin: 4px 0;"><strong>Evento / Atividade:</strong> ____________________________________________________________________</p>
        <p style="margin: 4px 0;"><strong>Data:</strong> ____ / ____ / 2026 &nbsp;&nbsp;&nbsp;&nbsp; <strong>Horário:</strong> ____:____ às ____:____ &nbsp;&nbsp;&nbsp;&nbsp; <strong>Local / Piscina:</strong> ________________________</p>
        <p style="margin: 4px 0;"><strong>Professor / Treinador Responsável:</strong> ____________________________________________________</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nome do Atleta</th>
            <th>Reg. CBDI</th>
            <th>Categoria</th>
            <th style="text-align:center;">Presente [ P ]</th>
            <th style="text-align:center;">Falta [ F ]</th>
            <th>Assinatura / Visto / Observação</th>
          </tr>
        </thead>
        <tbody>
          ${filteredAthletes.map((ath, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${ath.name}</strong></td>
              <td><span class="cbdi">${ath.cbdiRegistration || 'CBDI-SP'}</span></td>
              <td>${ath.disabilityCategory || 'Deficiente Intelectual'}</td>
              <td style="text-align:center;">( &nbsp;&nbsp; )</td>
              <td style="text-align:center;">( &nbsp;&nbsp; )</td>
              <td>__________________________________</td>
            </tr>
          `).join('')}
          ${Array.from({ length: 4 }).map((_, i) => `
            <tr>
              <td>${filteredAthletes.length + i + 1}</td>
              <td>________________________________________</td>
              <td>_______________</td>
              <td>_______________</td>
              <td style="text-align:center;">( &nbsp;&nbsp; )</td>
              <td style="text-align:center;">( &nbsp;&nbsp; )</td>
              <td>__________________________________</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (reportType === 'swimming_times_ranking') {
    bodyContent = `
      <h2>RELATÓRIO DE TEMPOS OFICIAIS, RANKING & RECORDES PESSOAIS (RP)</h2>
      <p class="subtitle">Quadro de Melhores Marcas e Evolução Cronometrada de Natação Paralímpica S14</p>
      ${filteredAthletes.map(ath => {
        const { allEventGroups } = groupAndRankMetrics(ath.swimmingMetrics || []);
        const filteredGroups = selectedStroke === 'all' 
          ? allEventGroups 
          : allEventGroups.filter(g => g.stroke === selectedStroke);

        if (filteredGroups.length === 0) return '';

        return `
          <div style="margin-top: 20px;">
            <h3 style="color: #0c1f38; border-bottom: 2px solid #0c1f38; padding-bottom: 3px;">
              Atleta: ${ath.name} (Reg. CBDI: ${ath.cbdiRegistration || 'Homologado'} - ${ath.disabilityCategory || 'S14'})
            </h3>
            <table>
              <thead>
                <tr>
                  <th>Prova</th>
                  <th>Classificação</th>
                  <th style="text-align:center;">Tempo</th>
                  <th>Campeonato</th>
                  <th style="text-align:center;">Ano</th>
                  <th style="text-align:center;">Evolução</th>
                </tr>
              </thead>
              <tbody>
                ${filteredGroups.map(grp => 
                  grp.allMetrics.map(m => `
                    <tr class="${m.rank === 1 ? 'rp-row' : ''}">
                      <td><strong>${grp.event}</strong></td>
                      <td>${m.rank === 1 ? '🥇 RECORDE PESSOAL (RP)' : `${m.rank}º tempo`}</td>
                      <td style="text-align:center; font-family: monospace; font-weight: bold; color: #b45309;">${m.bestTime}</td>
                      <td>${m.stageName || 'Campeonato'}</td>
                      <td style="text-align:center;">${m.year || '-'}</td>
                      <td style="text-align:center; color: #047857; font-weight: bold;">${m.rank === 1 ? 'Melhor Marca' : (m.differenceFromBest || '-')}</td>
                    </tr>
                  `).join('')
                ).join('')}
              </tbody>
            </table>
          </div>
        `;
      }).join('')}
    `;
  } else if (reportType === 'athlete_individual') {
    const { allEventGroups } = groupAndRankMetrics(selectedAthlete.swimmingMetrics || []);
    bodyContent = `
      <h2>DOSSIÊ E FICHA INDIVIDUAL DO ATLETA: ${selectedAthlete.name.toUpperCase()}</h2>
      <p class="subtitle">Associação Cultural e Esportiva de Deficientes Paulistas (ACEDEP)</p>
      
      <table style="margin-bottom: 20px;">
        <tbody>
          <tr>
            <td style="width: 25%;"><strong>Nome do Atleta:</strong></td>
            <td style="width: 25%;"><strong>${selectedAthlete.name}</strong></td>
            <td style="width: 25%;"><strong>Nascimento / Idade:</strong></td>
            <td style="width: 25%;">${selectedAthlete.birthDate || 'N/I'}</td>
          </tr>
          <tr>
            <td><strong>Registro CBDI / CPB:</strong></td>
            <td><span class="cbdi">${selectedAthlete.cbdiRegistration || 'Homologado'}</span></td>
            <td><strong>Matrícula Clube:</strong></td>
            <td>${selectedAthlete.clubRegistration || 'ACEDEP-2026'}</td>
          </tr>
          <tr>
            <td><strong>Categoria / Condição:</strong></td>
            <td><strong>${selectedAthlete.disabilityCategory || 'Deficiente Intelectual'}</strong></td>
            <td><strong>Classe Paralímpica:</strong></td>
            <td><strong>${selectedAthlete.paralympicClass || 'S14'}</strong></td>
          </tr>
          <tr>
            <td><strong>Responsável Legal:</strong></td>
            <td>${selectedAthlete.guardianName || 'Família'}</td>
            <td><strong>Telefone / WhatsApp:</strong></td>
            <td>${selectedAthlete.guardianPhone || 'N/I'}</td>
          </tr>
          <tr>
            <td><strong>Piscina / Raia:</strong></td>
            <td>${selectedAthlete.trainingSchedule?.pool || 'CPB 50m'} (${selectedAthlete.trainingSchedule?.lane || 'Raia 3'})</td>
            <td><strong>Frequência Geral:</strong></td>
            <td><strong style="color: #047857;">${selectedAthlete.attendanceRate || 100}%</strong></td>
          </tr>
        </tbody>
      </table>

      <h3>Quadro de Recordes Pessoais (RP) & Tempos Oficiais</h3>
      <table>
        <thead>
          <tr>
            <th>Prova</th>
            <th>Classificação</th>
            <th style="text-align:center;">Tempo Oficial</th>
            <th>Campeonato</th>
            <th style="text-align:center;">Ano</th>
            <th style="text-align:center;">Evolução</th>
          </tr>
        </thead>
        <tbody>
          ${allEventGroups.map(grp => 
            grp.allMetrics.map(m => `
              <tr class="${m.rank === 1 ? 'rp-row' : ''}">
                <td><strong>${grp.event}</strong></td>
                <td>${m.rank === 1 ? '🥇 RECORDE PESSOAL (RP)' : `${m.rank}º tempo`}</td>
                <td style="text-align:center; font-family: monospace; font-weight: bold; color: #b45309;">${m.bestTime}</td>
                <td>${m.stageName || 'Campeonato'}</td>
                <td style="text-align:center;">${m.year || '-'}</td>
                <td style="text-align:center; color: #047857; font-weight: bold;">${m.rank === 1 ? 'Melhor Marca' : (m.differenceFromBest || '-')}</td>
              </tr>
            `).join('')
          ).join('')}
        </tbody>
      </table>
    `;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>ACEDEP - Relatório Oficial</title>
        <style>
          @page { size: auto; margin: 15mm; }
          body { font-family: Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; line-height: 1.4; }
          .header-box { border-bottom: 3px double #0c1f38; padding-bottom: 10px; margin-bottom: 20px; text-align: center; }
          .inst-name { font-size: 15pt; font-weight: bold; color: #0c1f38; margin: 0; }
          .inst-meta { font-size: 8.5pt; color: #475569; margin: 3px 0; }
          h2 { font-size: 13pt; color: #b45309; text-transform: uppercase; margin: 10px 0 4px 0; }
          .subtitle { font-size: 9.5pt; color: #475569; margin: 0 0 15px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-top: 10px; }
          th { background: #0c1f38; color: white; text-align: left; padding: 6px 8px; font-size: 8.5pt; }
          td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 8.5pt; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .rp-row { background-color: #fefce8 !important; }
          .cbdi { font-family: monospace; font-weight: bold; color: #b45309; }
          .footer { margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 8pt; color: #64748b; text-align: center; }
          .btn-print { position: fixed; top: 15px; right: 15px; background: #0c1f38; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; }
          @media print { .btn-print { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
        <div class="header-box">
          <p class="inst-name">${INSTITUTION_INFO.name}</p>
          <p class="inst-meta"><strong>CNPJ:</strong> ${INSTITUTION_INFO.cnpj} • ${INSTITUTION_INFO.location}</p>
          <p class="inst-meta">${INSTITUTION_INFO.program} • Emitido em: <strong>${timestamp}</strong></p>
        </div>

        ${bodyContent}

        <div class="footer">
          <p>ACEDEP - Associação Cultural e Esportiva de Deficientes Paulistas • CNPJ: ${INSTITUTION_INFO.cnpj}</p>
          <p>Documento oficial emitido eletronicamente para fins cadastrais e de acompanhamento esportivo.</p>
        </div>

        <script>
          setTimeout(() => {
            window.print();
          }, 400);
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Universal export function that executes the chosen format
 */
export function exportReport(options: ExportReportOptions): void {
  if (options.format === 'word') {
    generateWordDocument(options);
  } else if (options.format === 'pdf') {
    generatePdfDocument(options);
  } else if (options.format === 'print') {
    openPrintableView(options);
  }
}
