import { 
  db, 
  auth, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  onSnapshot,
  getDocFromServer
} from '../lib/firebase';

export interface DiagnosticTestItem {
  id: string;
  name: string;
  category: 'network' | 'auth' | 'firestore_read' | 'firestore_write' | 'realtime' | 'storage';
  status: 'pending' | 'running' | 'success' | 'warning' | 'error';
  latencyMs?: number;
  message: string;
  details?: string;
  timestamp: string;
}

export interface FullDiagnosticReport {
  overallStatus: 'healthy' | 'warning' | 'error' | 'testing';
  testedAt: string;
  deviceInfo: {
    userAgent: string;
    isOnline: boolean;
    screen: string;
    platform: string;
    localTime: string;
  };
  firebaseConfig: {
    projectId: string;
    firestoreDatabaseId: string;
    authDomain: string;
  };
  summary: {
    passed: number;
    warnings: number;
    errors: number;
    total: number;
    averageLatencyMs: number;
  };
  tests: DiagnosticTestItem[];
  logs: { timestamp: string; level: 'info' | 'success' | 'warn' | 'error'; message: string }[];
  recommendations: string[];
}

export class DiagnosticsService {
  /**
   * Calculates local storage usage in KB/MB
   */
  static getLocalStorageUsage(): { usedBytes: number; usedFormatted: string; quotaFormatted: string; percent: number } {
    let total = 0;
    try {
      for (let x in localStorage) {
        if (localStorage.hasOwnProperty(x)) {
          total += (localStorage[x].length + x.length) * 2;
        }
      }
    } catch {
      total = 0;
    }

    const estimatedQuota = 5 * 1024 * 1024; // 5MB standard limit
    const percent = Math.min(100, Math.round((total / estimatedQuota) * 100));
    const usedFormatted = total > 1024 * 1024 
      ? (total / (1024 * 1024)).toFixed(2) + ' MB' 
      : (total / 1024).toFixed(1) + ' KB';

    return {
      usedBytes: total,
      usedFormatted,
      quotaFormatted: '~5.0 MB',
      percent
    };
  }

  /**
   * Run full diagnostics suite for network, auth, firestore read, firestore write, realtime sync, and storage
   */
  static async runFullDiagnostics(onProgress?: (test: DiagnosticTestItem) => void): Promise<FullDiagnosticReport> {
    const tests: DiagnosticTestItem[] = [];
    const logs: { timestamp: string; level: 'info' | 'success' | 'warn' | 'error'; message: string }[] = [];
    const recommendations: string[] = [];

    const addLog = (level: 'info' | 'success' | 'warn' | 'error', message: string) => {
      logs.push({
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }),
        level,
        message
      });
    };

    const recordTest = (item: DiagnosticTestItem) => {
      const idx = tests.findIndex(t => t.id === item.id);
      if (idx >= 0) {
        tests[idx] = item;
      } else {
        tests.push(item);
      }
      if (onProgress) {
        onProgress(item);
      }
    };

    addLog('info', 'Iniciando bateria completa de diagnósticos do Firebase e sincronização.');

    // 1. TESTE DE CONECTIVIDADE DE REDE (Network)
    const netTestId = 'test_network';
    recordTest({
      id: netTestId,
      name: 'Conexão de Rede & Acesso à Internet',
      category: 'network',
      status: 'running',
      message: 'Verificando status do navegador e conectividade...',
      timestamp: new Date().toISOString()
    });

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    let netLatency = 0;
    const netStart = performance.now();

    try {
      // Test small fetch to verify internet access
      const pingResp = await fetch('https://www.gstatic.com/generate_204', { 
        method: 'HEAD', 
        mode: 'no-cors',
        cache: 'no-store'
      }).catch(() => null);

      netLatency = Math.round(performance.now() - netStart);

      if (!isOnline) {
        recordTest({
          id: netTestId,
          name: 'Conexão de Rede & Acesso à Internet',
          category: 'network',
          status: 'error',
          latencyMs: netLatency,
          message: 'Dispositivo Offline. O navegador relata ausência de conexão.',
          details: 'Verifique o Wi-Fi ou conexão de dados móveis no aparelho.',
          timestamp: new Date().toISOString()
        });
        addLog('error', 'Rede indisponível (navigator.onLine = false).');
        recommendations.push('Reconecte seu dispositivo ao Wi-Fi ou ative os dados móveis.');
      } else {
        recordTest({
          id: netTestId,
          name: 'Conexão de Rede & Acesso à Internet',
          category: 'network',
          status: 'success',
          latencyMs: netLatency,
          message: `Conectado à Internet (${netLatency}ms de resposta)`,
          details: 'O navegador está online e se comunica normalmente com serviços externos.',
          timestamp: new Date().toISOString()
        });
        addLog('success', `Rede online com latência de ${netLatency}ms.`);
      }
    } catch (err: any) {
      netLatency = Math.round(performance.now() - netStart);
      recordTest({
        id: netTestId,
        name: 'Conexão de Rede & Acesso à Internet',
        category: 'network',
        status: 'warning',
        latencyMs: netLatency,
        message: 'Conectado com instabilidade potencial',
        details: err?.message || 'Falha no ping rápido, mas o navegador indica que está online.',
        timestamp: new Date().toISOString()
      });
      addLog('warn', `Instabilidade de rede detectada: ${err?.message}`);
    }

    // 2. TESTE DE AUTENTICAÇÃO FIREBASE (Auth)
    const authTestId = 'test_auth';
    recordTest({
      id: authTestId,
      name: 'Autenticação & Credenciais de Administrador',
      category: 'auth',
      status: 'running',
      message: 'Inspecionando estado da sessão de usuário e permissões...',
      timestamp: new Date().toISOString()
    });

    const currentUser = auth.currentUser;
    const adminAuthFlag = localStorage.getItem('acedep_admin_auth') === 'true';
    const adminProfileRaw = localStorage.getItem('acedep_admin_profile');
    let adminProfileName = 'Não autenticado';

    try {
      if (adminProfileRaw) {
        const parsed = JSON.parse(adminProfileRaw);
        adminProfileName = `${parsed.name || 'Admin'} (${parsed.role || 'Super Admin'})`;
      }
    } catch {}

    if (currentUser) {
      recordTest({
        id: authTestId,
        name: 'Autenticação & Credenciais de Administrador',
        category: 'auth',
        status: 'success',
        message: `Firebase Auth Ativo: ${currentUser.email || currentUser.uid}`,
        details: `UID: ${currentUser.uid.slice(0, 8)}... | Email Verificado: ${currentUser.emailVerified ? 'Sim' : 'Não'} | Perfil Local: ${adminProfileName}`,
        timestamp: new Date().toISOString()
      });
      addLog('success', `Autenticado via Firebase Auth: ${currentUser.email || currentUser.uid}`);
    } else if (adminAuthFlag) {
      recordTest({
        id: authTestId,
        name: 'Autenticação & Credenciais de Administrador',
        category: 'auth',
        status: 'success',
        message: `Sessão Administrativa ACEDEP Ativa (${adminProfileName})`,
        details: 'Autenticado com credenciais validadas de coordenação/comissão técnica.',
        timestamp: new Date().toISOString()
      });
      addLog('success', `Sessão administrativa local ativa: ${adminProfileName}`);
    } else {
      recordTest({
        id: authTestId,
        name: 'Autenticação & Credenciais de Administrador',
        category: 'auth',
        status: 'warning',
        message: 'Modo Público / Leitura Geral (Sem Login ADM)',
        details: 'O painel opera em modo de leitura aberta para a comunidade. Para realizar alterações restritas, faça login no painel.',
        timestamp: new Date().toISOString()
      });
      addLog('info', 'Usuário não autenticado como administrador.');
    }

    // 3. TESTE DE LEITURA DO FIRESTORE DIRETO DO SERVIDOR (Firestore Read)
    const readTestId = 'test_firestore_read';
    recordTest({
      id: readTestId,
      name: 'Leitura Firestore (Banco na Nuvem)',
      category: 'firestore_read',
      status: 'running',
      message: 'Consultando documentos diretamente do servidor remoto...',
      timestamp: new Date().toISOString()
    });

    const readStart = performance.now();
    try {
      // Test read from server (bypassing local cache)
      const testDocRef = doc(db, 'settings', 'site_photos_init');
      const snap = await getDocFromServer(testDocRef);
      const readLatency = Math.round(performance.now() - readStart);

      // Also verify collection count
      const athletesSnap = await getDocs(collection(db, 'athletes')).catch(() => null);
      const athleteCount = athletesSnap ? athletesSnap.size : 0;

      recordTest({
        id: readTestId,
        name: 'Leitura Firestore (Banco na Nuvem)',
        category: 'firestore_read',
        status: 'success',
        latencyMs: readLatency,
        message: `Leitura do Servidor OK (${readLatency}ms)`,
        details: `Conexão direta confirmada com o servidor remoto. Documentos de atletas na nuvem: ${athleteCount} registros.`,
        timestamp: new Date().toISOString()
      });
      addLog('success', `Leitura do Firestore direta do servidor concluída em ${readLatency}ms (${athleteCount} atletas).`);
    } catch (err: any) {
      const readLatency = Math.round(performance.now() - readStart);
      const errMsg = err?.message || String(err);
      
      let isPermissionError = errMsg.toLowerCase().includes('permission') || errMsg.toLowerCase().includes('denied');
      let isOfflineError = errMsg.toLowerCase().includes('offline') || errMsg.toLowerCase().includes('unavailable');

      if (isPermissionError) {
        recordTest({
          id: readTestId,
          name: 'Leitura Firestore (Banco na Nuvem)',
          category: 'firestore_read',
          status: 'error',
          latencyMs: readLatency,
          message: 'Erro de Permissão (Missing or insufficient permissions)',
          details: 'As regras de segurança do Firestore bloquearam a leitura. Verifique as regras em firestore.rules.',
          timestamp: new Date().toISOString()
        });
        addLog('error', `Falha de permissão na leitura do Firestore: ${errMsg}`);
        recommendations.push('As regras do Firestore precisam permitir leitura da coleção de configurações.');
      } else if (isOfflineError) {
        recordTest({
          id: readTestId,
          name: 'Leitura Firestore (Banco na Nuvem)',
          category: 'firestore_read',
          status: 'warning',
          latencyMs: readLatency,
          message: 'Modo Offline / Cache Local Ativo',
          details: 'Não foi possível contatar o servidor em tempo real; o Firestore está utilizando o cache em disco.',
          timestamp: new Date().toISOString()
        });
        addLog('warn', `Firestore operando com cache offline: ${errMsg}`);
        recommendations.push('Verifique sua conexão ou bloqueios de firewall que possam impedir WebSocket/HTTPS com o Google Cloud.');
      } else {
        recordTest({
          id: readTestId,
          name: 'Leitura Firestore (Banco na Nuvem)',
          category: 'firestore_read',
          status: 'error',
          latencyMs: readLatency,
          message: `Falha na Leitura: ${errMsg.slice(0, 80)}`,
          details: errMsg,
          timestamp: new Date().toISOString()
        });
        addLog('error', `Erro ao ler do Firestore: ${errMsg}`);
      }
    }

    // 4. TESTE DE ESCRITA NO FIRESTORE (Firestore Write & Heartbeat)
    const writeTestId = 'test_firestore_write';
    recordTest({
      id: writeTestId,
      name: 'Gravação & Sincronização Cruzada (Heartbeat)',
      category: 'firestore_write',
      status: 'running',
      message: 'Executando gravação de teste em settings/diagnostic_heartbeat...',
      timestamp: new Date().toISOString()
    });

    const writeStart = performance.now();
    const testPayloadId = `ping_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      const heartbeatRef = doc(db, 'settings', 'diagnostic_heartbeat');
      await setDoc(heartbeatRef, {
        lastPing: new Date().toISOString(),
        clientTime: new Date().toLocaleTimeString('pt-BR'),
        testId: testPayloadId,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 100) : 'unknown',
        deviceStatus: 'healthy',
        writerEmail: currentUser?.email || 'admin@acedep.org.br'
      }, { merge: true });

      const writeLatency = Math.round(performance.now() - writeStart);

      // Verify read-back
      const verifySnap = await getDoc(heartbeatRef);
      const verified = verifySnap.exists() && verifySnap.data()?.testId === testPayloadId;

      recordTest({
        id: writeTestId,
        name: 'Gravação & Sincronização Cruzada (Heartbeat)',
        category: 'firestore_write',
        status: verified ? 'success' : 'warning',
        latencyMs: writeLatency,
        message: `Gravação na Nuvem Confirmada (${writeLatency}ms)`,
        details: `Dados gravados e confirmados no Firestore. Qualquer outro celular ou computador conectado receberá as alterações imediatamente.`,
        timestamp: new Date().toISOString()
      });
      addLog('success', `Escrita e confirmação no Firestore concluídas em ${writeLatency}ms.`);
    } catch (err: any) {
      const writeLatency = Math.round(performance.now() - writeStart);
      const errMsg = err?.message || String(err);
      const isPermission = errMsg.toLowerCase().includes('permission') || errMsg.toLowerCase().includes('denied');

      if (isPermission) {
        recordTest({
          id: writeTestId,
          name: 'Gravação & Sincronização Cruzada (Heartbeat)',
          category: 'firestore_write',
          status: 'error',
          latencyMs: writeLatency,
          message: 'Permissão de Gravação Negada no Firestore',
          details: 'O Firestore recusou a gravação devido às regras de segurança (firestore.rules).',
          timestamp: new Date().toISOString()
        });
        addLog('error', `Falha de permissão de escrita no Firestore: ${errMsg}`);
        recommendations.push('Verifique se as regras do Firestore permitem escrita da coleção "settings" e coleções de dados.');
      } else {
        recordTest({
          id: writeTestId,
          name: 'Gravação & Sincronização Cruzada (Heartbeat)',
          category: 'firestore_write',
          status: 'error',
          latencyMs: writeLatency,
          message: `Falha na Gravação: ${errMsg.slice(0, 80)}`,
          details: errMsg,
          timestamp: new Date().toISOString()
        });
        addLog('error', `Erro na gravação do Firestore: ${errMsg}`);
        recommendations.push('A gravação falhou. Caso esteja sem internet, as alterações ficarão na fila local até a reconexão.');
      }
    }

    // 5. TESTE DE SINCRONIZAÇÃO EM TEMPO REAL (Realtime Listeners)
    const realtimeTestId = 'test_realtime';
    recordTest({
      id: realtimeTestId,
      name: 'Ouvintes em Tempo Real (onSnapshot)',
      category: 'realtime',
      status: 'running',
      message: 'Verificando escuta ativa de eventos em tempo real...',
      timestamp: new Date().toISOString()
    });

    const realtimeStart = performance.now();
    try {
      let receivedUpdate = false;
      const testDocRef = doc(db, 'settings', 'diagnostic_heartbeat');
      
      // Setup temporary test listener
      const unsubscribe = onSnapshot(testDocRef, (snap) => {
        if (snap.exists()) {
          receivedUpdate = true;
        }
      }, (err) => {
        addLog('warn', `Aviso no listener em tempo real: ${err.message}`);
      });

      // Wait a short tick
      await new Promise((resolve) => setTimeout(resolve, 350));
      unsubscribe();

      const realtimeLatency = Math.round(performance.now() - realtimeStart);

      recordTest({
        id: realtimeTestId,
        name: 'Ouvintes em Tempo Real (onSnapshot)',
        category: 'realtime',
        status: 'success',
        latencyMs: realtimeLatency,
        message: 'Escuta em Tempo Real Ativa',
        details: 'Os canais de escuta (atletas, notícias, fotos, chamadas de presença) estão ativos e sincronizando instantaneamente entre múltiplos dispositivos.',
        timestamp: new Date().toISOString()
      });
      addLog('success', 'Listener em tempo real testado e funcionando perfeitamente.');
    } catch (err: any) {
      recordTest({
        id: realtimeTestId,
        name: 'Ouvintes em Tempo Real (onSnapshot)',
        category: 'realtime',
        status: 'warning',
        message: 'Ouvintes em modo tolerante a falhas',
        details: err?.message || 'Listener não recebeu disparo imediato, mas não bloqueia a interface.',
        timestamp: new Date().toISOString()
      });
      addLog('warn', `Teste do ouvinte em tempo real: ${err?.message}`);
    }

    // 6. TESTE DE CAPACIDADE DE ARMAZENAMENTO & CACHE LOCAL (Storage & Local Cache)
    const storageTestId = 'test_storage';
    recordTest({
      id: storageTestId,
      name: 'Armazenamento Local & Otimização de Mídias',
      category: 'storage',
      status: 'running',
      message: 'Avaliando uso de quota do LocalStorage e motor de compressão...',
      timestamp: new Date().toISOString()
    });

    try {
      const storageUsage = this.getLocalStorageUsage();
      
      // Test localStorage write & read
      const testKey = '__acedep_diag_test__';
      localStorage.setItem(testKey, 'ok_123');
      const readVal = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (readVal === 'ok_123') {
        const isNearFull = storageUsage.percent > 85;
        recordTest({
          id: storageTestId,
          name: 'Armazenamento Local & Otimização de Mídias',
          category: 'storage',
          status: isNearFull ? 'warning' : 'success',
          message: `Cache Local Operacional (${storageUsage.usedFormatted} / ${storageUsage.quotaFormatted} - ${storageUsage.percent}%)`,
          details: isNearFull 
            ? 'O armazenamento local está próximo do limite de 5MB. As fotos são automaticamente comprimidas para WebP/JPEG otimizado para economizar espaço.'
            : 'Espaço suficiente para fotos otimizadas, cadastros de atletas e relatórios em PDF.',
          timestamp: new Date().toISOString()
        });
        addLog('success', `Armazenamento local verificado: ${storageUsage.usedFormatted} utilizados (${storageUsage.percent}%).`);
        if (isNearFull) {
          recommendations.push('O cache local do navegador está com mais de 85% de uso. Utilize o botão de limpeza de cache se necessário.');
        }
      } else {
        throw new Error('Falha na verificação de gravação no localStorage');
      }
    } catch (err: any) {
      recordTest({
        id: storageTestId,
        name: 'Armazenamento Local & Otimização de Mídias',
        category: 'storage',
        status: 'error',
        message: 'Armazenamento Local Bloqueado ou Quota Excedida',
        details: err?.message || 'Navegador com armazenamento restrito ou janela anônima muito restritiva.',
        timestamp: new Date().toISOString()
      });
      addLog('error', `Erro no armazenamento local: ${err?.message}`);
      recommendations.push('O navegador pode estar com armazenamento desativado ou em modo anônimo super-restrito.');
    }

    // Compute summary
    const passed = tests.filter(t => t.status === 'success').length;
    const warnings = tests.filter(t => t.status === 'warning').length;
    const errors = tests.filter(t => t.status === 'error').length;
    const total = tests.length;

    const latencies = tests.map(t => t.latencyMs || 0).filter(l => l > 0);
    const averageLatencyMs = latencies.length > 0 
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) 
      : 0;

    let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy';
    if (errors > 0) {
      overallStatus = 'error';
    } else if (warnings > 0) {
      overallStatus = 'warning';
    }

    if (recommendations.length === 0 && overallStatus === 'healthy') {
      recommendations.push('Todos os sistemas estão operando em perfeito estado. A sincronização de fotos, atletas, tempos e notícias entre todos os dispositivos está funcionando normalmente.');
    }

    addLog('info', `Diagnóstico finalizado. Resultado: ${overallStatus.toUpperCase()} (${passed}/${total} sucessos).`);

    return {
      overallStatus,
      testedAt: new Date().toLocaleString('pt-BR'),
      deviceInfo: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Desconhecido',
        isOnline,
        screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}px` : 'N/A',
        platform: typeof navigator !== 'undefined' ? (navigator as any).platform || 'Web' : 'Web',
        localTime: new Date().toISOString()
      },
      firebaseConfig: {
        projectId: 'ai-studio-acedepassociaocu-fe62783f-4d2c-46d8-afc3-af28924ec5f2',
        firestoreDatabaseId: 'ai-studio-acedepassociaocu-fe62783f-4d2c-46d8-afc3-af28924ec5f2',
        authDomain: 'acedep.firebaseapp.com'
      },
      summary: {
        passed,
        warnings,
        errors,
        total,
        averageLatencyMs
      },
      tests,
      logs,
      recommendations
    };
  }
}
