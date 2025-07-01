/**
 * Servicio para manejo de datos en tiempo real
 * Implementa tanto WebSockets como polling como fallback
 */

class RealTimeService {
  constructor() {
    this.websocket = null;
    this.pollingInterval = null;
    this.listeners = new Map();
    this.config = {
      // Usar la URL del API actual en lugar de asumir un puerto diferente
      websocketUrl: this.getWebSocketUrl(),
      pollingInterval: 30000, // 30 segundos
      reconnectInterval: 5000, // 5 segundos
      maxReconnectAttempts: 3, // Reducido para evitar spam
      currentAttempts: 0
    };
    this.isConnected = false;
    this.useWebSockets = this.shouldUseWebSockets();
    this.lastConnectionAttempt = null;
    
    // Error suppression system
    this.errorHistory = {
      polling: {
        consecutiveErrors: 0,
        lastErrorTime: null,
        lastErrorMessage: null,
        suppressionActive: false
      }
    };
    this.suppressionThreshold = 3; // Suppress after 3 consecutive errors
    this.suppressionInterval = 5 * 60 * 1000; // Log summary every 5 minutes
    this.lastSuppressedSummary = null;
  }

  /**
   * Determinar la URL de WebSocket basada en la configuración actual
   */
  getWebSocketUrl() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const wsUrl = import.meta.env.VITE_WS_URL;
    
    if (wsUrl) {
      return wsUrl + '/ws';
    }
    
    // Convertir HTTP a WebSocket URL
    const url = new URL(apiUrl);
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${url.host}/ws`;
  }

  /**
   * Determinar si se deben usar WebSockets basado en la configuración
   */
  shouldUseWebSockets() {
    // Desactivar WebSockets en desarrollo si no está explícitamente habilitado
    const enableWS = import.meta.env.VITE_ENABLE_WEBSOCKETS;
    
    if (enableWS === 'false') return false;
    if (enableWS === 'true') return true;
    
    // Por defecto, usar solo polling en desarrollo local
    const isDevelopment = import.meta.env.DEV;
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    return !isDevelopment || !isLocalhost;
  }

  /**
   * Inicializar el servicio de tiempo real
   */
  async initialize() {
    console.log('🚀 Inicializando servicio de tiempo real...');
    console.log('📊 Configuración:', {
      useWebSockets: this.useWebSockets,
      websocketUrl: this.config.websocketUrl,
      pollingInterval: this.config.pollingInterval
    });
    
    if (this.useWebSockets) {
      console.log('🔌 Intentando conexión WebSocket...');
      await this.initWebSocket();
    } else {
      console.log('⏰ Iniciando modo polling...');
      this.initPolling();
    }
  }

  /**
   * Inicializar WebSocket con manejo mejorado de errores
   */
  async initWebSocket() {
    // Evitar múltiples intentos simultáneos
    const now = Date.now();
    if (this.lastConnectionAttempt && (now - this.lastConnectionAttempt) < 2000) {
      console.log('⏳ Evitando intento de conexión duplicado');
      return;
    }
    this.lastConnectionAttempt = now;

    try {
      console.log('🔌 Conectando a WebSocket:', this.config.websocketUrl);
      
      // Timeout para la conexión
      const connectionTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
      });

      const connectionPromise = new Promise((resolve, reject) => {
        this.websocket = new WebSocket(this.config.websocketUrl);
        
        this.websocket.onopen = () => {
          console.log('✅ WebSocket conectado exitosamente');
          this.isConnected = true;
          this.config.currentAttempts = 0;
          this.notifyListeners('connection', { status: 'connected', type: 'websocket' });
          resolve();
        };

        this.websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 Datos recibidos por WebSocket:', data);
            this.handleRealTimeData(data);
          } catch (error) {
            console.error('❌ Error parseando datos WebSocket:', error);
          }
        };

        this.websocket.onclose = (event) => {
          console.log('🔌 WebSocket cerrado:', { code: event.code, reason: event.reason });
          this.isConnected = false;
          this.notifyListeners('connection', { status: 'disconnected', type: 'websocket' });
          
          // Solo reconectar si no fue un cierre intencional
          if (event.code !== 1000) {
            this.handleReconnection();
          }
        };

        this.websocket.onerror = (error) => {
          console.warn('⚠️ Error en WebSocket:', error);
          this.notifyListeners('connection', { status: 'error', type: 'websocket', error });
          reject(error);
        };
      });

      await Promise.race([connectionPromise, connectionTimeout]);

    } catch (error) {
      console.warn('⚠️ WebSocket falló, cambiando a polling:', error.message);
      this.useWebSockets = false;
      this.initPolling();
    }
  }

  /**
   * Inicializar polling como fallback
   */
  initPolling() {
    console.log('⏰ Iniciando polling cada', this.config.pollingInterval / 1000, 'segundos');
    
    this.isConnected = true;
    this.notifyListeners('connection', { status: 'connected', type: 'polling' });
    
    // Reset error tracking when starting polling
    this.resetErrorTracking('polling');
    
    this.pollingInterval = setInterval(async () => {
      try {
        await this.fetchLatestData();
        // Reset error count on successful fetch
        if (this.errorHistory.polling.consecutiveErrors > 0) {
          this.handlePollingRecovery();
        }
      } catch (error) {
        this.handlePollingError(error);
      }
    }, this.config.pollingInterval);
  }

  /**
   * Obtener datos más recientes via API
   */
  async fetchLatestData() {
    try {
      const { default: api } = await import('./api');
      
      const [resumen, metodos, ventasDia, topProducts, activities] = await Promise.all([
        api.get('/sales/resumen'),
        api.get('/sales/metodos-pago'),
        api.get('/sales/ventas-por-dia'),
        api.get('/sales/top-products?limit=5'),
        api.get('/actividades/recientes?limit=5')
      ]);

      const data = {
        type: 'dashboard_update',
        timestamp: Date.now(),
        data: {
          resumen: resumen.data,
          metodosPago: metodos.data,
          ventasPorDia: ventasDia.data,
          topProducts: topProducts.data,
          recentActivities: activities.data
        }
      };

      this.handleRealTimeData(data);
    } catch (error) {
      // Don't log here - let the caller handle it
      // This prevents double logging when called from polling
      throw error;
    }
  }

  /**
   * Manejar datos recibidos en tiempo real
   */
  handleRealTimeData(data) {
    switch (data.type) {
      case 'dashboard_update':
        this.notifyListeners('dashboard_update', data.data);
        break;
      case 'new_sale':
        this.notifyListeners('new_sale', data.data);
        break;
      case 'new_product':
        this.notifyListeners('new_product', data.data);
        break;
      case 'user_activity':
        this.notifyListeners('user_activity', data.data);
        break;
      default:
        console.log('📦 Tipo de datos no manejado:', data.type);
    }
  }

  /**
   * Manejar reconexión automática
   */
  handleReconnection() {
    if (this.config.currentAttempts >= this.config.maxReconnectAttempts) {
      console.warn('⚠️ Máximo de intentos de reconexión alcanzado, cambiando a polling');
      this.useWebSockets = false;
      this.initPolling();
      this.notifyListeners('connection', { 
        status: 'fallback_to_polling', 
        type: 'polling',
        reason: 'websocket_failed'
      });
      return;
    }

    this.config.currentAttempts++;
    const delay = this.config.reconnectInterval * this.config.currentAttempts; // Backoff exponencial
    
    console.log(`🔄 Reintentando conexión WebSocket en ${delay/1000}s (${this.config.currentAttempts}/${this.config.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      if (this.useWebSockets) {
        this.initWebSocket();
      }
    }, delay);
  }

  /**
   * Suscribirse a eventos
   */
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Retornar función de unsuscribe
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Notificar a todos los listeners de un evento
   */
  notifyListeners(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Error en callback de evento:', error);
        }
      });
    }
  }

  /**
   * Enviar datos por WebSocket
   */
  send(data) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ WebSocket no está conectado, no se puede enviar datos');
    }
  }

  /**
   * Destruir el servicio
   */
  destroy() {
    console.log('🔌 Cerrando servicio de tiempo real...');
    
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.listeners.clear();
    this.isConnected = false;
    
    // Reset error tracking
    this.resetErrorTracking('polling');
    this.lastSuppressedSummary = null;
  }

  /**
   * Obtener estado de conexión
   */
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      type: this.useWebSockets ? 'websocket' : 'polling',
      attempts: this.config.currentAttempts,
      maxAttempts: this.config.maxReconnectAttempts,
      pollingErrors: {
        consecutive: this.errorHistory.polling.consecutiveErrors,
        suppressed: this.errorHistory.polling.suppressionActive,
        lastError: this.errorHistory.polling.lastErrorMessage
      }
    };
  }

  /**
   * Obtener estadísticas de errores (útil para UI)
   */
  getErrorStats() {
    return {
      polling: {
        consecutiveErrors: this.errorHistory.polling.consecutiveErrors,
        suppressionActive: this.errorHistory.polling.suppressionActive,
        lastErrorTime: this.errorHistory.polling.lastErrorTime,
        lastErrorMessage: this.errorHistory.polling.lastErrorMessage,
        hasErrors: this.errorHistory.polling.consecutiveErrors > 0
      }
    };
  }

  /**
   * Forzar actualización de datos
   */
  async forceUpdate() {
    try {
      if (this.useWebSockets && this.isConnected) {
        this.send({ type: 'force_update', timestamp: Date.now() });
      } else {
        await this.fetchLatestData();
      }
    } catch (error) {
      // Handle force update errors silently to avoid console spam
      // The regular polling error handling will manage this
      this.handlePollingError(error);
    }
  }

  /**
   * Handle polling errors with smart suppression
   */
  handlePollingError(error) {
    const errorInfo = this.errorHistory.polling;
    errorInfo.consecutiveErrors++;
    errorInfo.lastErrorTime = Date.now();
    errorInfo.lastErrorMessage = error.message || 'Unknown error';

    // Log first few errors normally
    if (errorInfo.consecutiveErrors <= this.suppressionThreshold) {
      console.error('❌ Error en polling:', error);
      this.notifyListeners('connection', { status: 'error', type: 'polling', error });
    } else {
      // Activate suppression
      if (!errorInfo.suppressionActive) {
        errorInfo.suppressionActive = true;
        console.warn(`⚠️ Polling: Suprimiendo logs de errores repetidos después de ${this.suppressionThreshold} errores consecutivos`);
        this.notifyListeners('connection', { 
          status: 'error_suppressed', 
          type: 'polling', 
          consecutiveErrors: errorInfo.consecutiveErrors,
          message: 'Backend errors suppressed - check connectivity'
        });
      }

      // Log periodic summaries
      this.logSuppressedSummary();
    }
  }

  /**
   * Handle recovery from polling errors
   */
  handlePollingRecovery() {
    const errorInfo = this.errorHistory.polling;
    
    if (errorInfo.suppressionActive) {
      console.log(`✅ Polling: Recuperado después de ${errorInfo.consecutiveErrors} errores`);
      this.notifyListeners('connection', { 
        status: 'recovered', 
        type: 'polling',
        previousErrors: errorInfo.consecutiveErrors
      });
    }
    
    this.resetErrorTracking('polling');
  }

  /**
   * Log suppressed error summary periodically
   */
  logSuppressedSummary() {
    const now = Date.now();
    const errorInfo = this.errorHistory.polling;
    
    if (!this.lastSuppressedSummary || 
        (now - this.lastSuppressedSummary) >= this.suppressionInterval) {
      
      this.lastSuppressedSummary = now;
      console.log(`📊 Polling: ${errorInfo.consecutiveErrors} errores consecutivos (último: ${errorInfo.lastErrorMessage})`);
    }
  }

  /**
   * Reset error tracking for a service type
   */
  resetErrorTracking(type) {
    if (this.errorHistory[type]) {
      this.errorHistory[type] = {
        consecutiveErrors: 0,
        lastErrorTime: null,
        lastErrorMessage: null,
        suppressionActive: false
      };
    }
  }

  /**
   * Add event listener
   */
  addListener(event, callback) {
    return this.subscribe(event, callback);
  }

  /**
   * Remove event listener
   */
  removeListener(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Request update for specific component
   */
  async requestUpdate(component = 'dashboard') {
    console.log(`🔄 Solicitando actualización para: ${component}`);
    
    if (this.isConnected && this.websocket) {
      // Enviar solicitud via WebSocket
      this.send({ 
        type: 'request_update', 
        component: component,
        timestamp: Date.now() 
      });
    } else {
      // Fallback a actualización manual
      console.log('📡 WebSocket no disponible, usando actualización manual...');
      await this.forceUpdate();
    }
  }

  /**
   * Send data via WebSocket
   */
  send(data) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  /**
   * Disconnect from real-time service
   */
  disconnect() {
    console.log('🔌 Desconectando servicio de tiempo real...');
    
    // Cerrar WebSocket
    if (this.websocket) {
      this.websocket.close(1000, 'Cliente desconectando');
      this.websocket = null;
    }
    
    // Limpiar polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.isConnected = false;
    this.notifyListeners('connection', { status: 'disconnected', type: 'manual' });
  }
}

// Instancia singleton
const realTimeService = new RealTimeService();

export default realTimeService;
