/**
 * Composable para manejo de datos en tiempo real
 * Proporciona una interfaz reactiva para datos que cambian frecuentemente
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import realTimeService from '@/services/realTimeService';

export function useRealTimeData(options = {}) {
  // Configuración por defecto
  const config = {
    autoStart: true,
    enableNotifications: true,
    updateInterval: 30000,
    debounceTime: 1000,
    ...options
  };

  // Estado reactivo
  const isConnected = ref(false);
  const connectionType = ref('none');
  const lastUpdate = ref(null);
  const isUpdating = ref(false);
  const errorCount = ref(0);
  const data = ref({});

  // Subscripciones
  let unsubscribeFunctions = [];
  let debounceTimer = null;

  // Computed properties
  const connectionStatus = computed(() => {
    if (!isConnected.value) return 'disconnected';
    if (isUpdating.value) return 'updating';
    
    const now = Date.now();
    const timeSinceUpdate = lastUpdate.value ? now - lastUpdate.value : Infinity;
    
    if (timeSinceUpdate > config.updateInterval * 2) return 'stale';
    return 'live';
  });

  const isHealthy = computed(() => {
    return isConnected.value && errorCount.value < 3;
  });

  // Métodos
  const updateData = (newData, source = 'unknown') => {
    // Debounce para evitar actualizaciones muy frecuentes
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      console.log(`📊 Actualizando datos desde: ${source}`, newData);
      
      // Merge con datos existentes
      data.value = {
        ...data.value,
        ...newData,
        _metadata: {
          lastUpdate: Date.now(),
          source,
          version: (data.value._metadata?.version || 0) + 1
        }
      };
      
      lastUpdate.value = Date.now();
      isUpdating.value = false;
      errorCount.value = 0;
    }, config.debounceTime);
  };

  const handleConnectionChange = (status) => {
    isConnected.value = status.status === 'connected';
    connectionType.value = status.type || 'none';
    
    if (status.status === 'error') {
      errorCount.value++;
    } else if (status.status === 'connected') {
      errorCount.value = 0;
    }
  };

  const handleError = (error) => {
    console.error('❌ Error en tiempo real:', error);
    errorCount.value++;
    isUpdating.value = false;
  };

  const forceUpdate = async () => {
    if (!isConnected.value) {
      console.warn('⚠️ No se puede forzar actualización: no conectado');
      return;
    }

    try {
      isUpdating.value = true;
      await realTimeService.forceUpdate();
    } catch (error) {
      handleError(error);
    }
  };

  const subscribe = (eventType, callback) => {
    const unsubscribe = realTimeService.subscribe(eventType, callback);
    unsubscribeFunctions.push(unsubscribe);
    return unsubscribe;
  };

  const initialize = async () => {
    try {
      console.log('🚀 Inicializando useRealTimeData...');
      
      // Inicializar servicio
      await realTimeService.initialize();
      
      // Suscribirse a eventos básicos
      subscribe('connection', handleConnectionChange);
      subscribe('dashboard_update', (newData) => updateData(newData, 'websocket'));
      subscribe('error', handleError);
      
      console.log('✅ useRealTimeData inicializado');
    } catch (error) {
      console.error('❌ Error inicializando useRealTimeData:', error);
      handleError(error);
    }
  };

  const cleanup = () => {
    console.log('🧹 Limpiando useRealTimeData...');
    
    // Limpiar debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    
    // Unsuscribirse de eventos
    unsubscribeFunctions.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    unsubscribeFunctions = [];
  };

  // Hooks del ciclo de vida
  if (config.autoStart) {
    onMounted(initialize);
  }
  
  onBeforeUnmount(cleanup);

  // API pública
  return {
    // Estado reactivo
    data,
    isConnected,
    connectionType,
    connectionStatus,
    isHealthy,
    isUpdating,
    lastUpdate,
    errorCount,
    
    // Métodos
    updateData,
    forceUpdate,
    subscribe,
    initialize,
    cleanup,
    
    // Utilidades
    config
  };
}

/**
 * Composable específico para datos del dashboard
 */
export function useDashboardRealTime(options = {}) {
  const realTimeData = useRealTimeData(options);
  
  // Estado específico del dashboard
  const chartKeys = ref({
    pie: 0,
    bar: 0
  });

  // Métodos específicos del dashboard
  const forceChartUpdate = (chartType) => {
    chartKeys.value[chartType]++;
    console.log(`📈 Forzando actualización del gráfico ${chartType}`);
  };

  const updateCharts = (newData) => {
    let updated = false;
    
    if (newData.metodosPago) {
      forceChartUpdate('pie');
      updated = true;
    }
    
    if (newData.ventasPorDia) {
      forceChartUpdate('bar');
      updated = true;
    }
    
    return updated;
  };

  // Suscribirse a actualizaciones de gráficos
  realTimeData.subscribe('dashboard_update', (newData) => {
    updateCharts(newData);
  });

  return {
    ...realTimeData,
    chartKeys,
    forceChartUpdate,
    updateCharts
  };
}

/**
 * Hook para performance monitoring
 */
export function useRealTimePerformance() {
  const metrics = ref({
    updateCount: 0,
    averageUpdateTime: 0,
    lastUpdateDuration: 0,
    totalUpdateTime: 0,
    errorRate: 0,
    totalErrors: 0
  });

  const startTiming = () => {
    return performance.now();
  };

  const endTiming = (startTime) => {
    const duration = performance.now() - startTime;
    
    metrics.value.lastUpdateDuration = duration;
    metrics.value.totalUpdateTime += duration;
    metrics.value.updateCount++;
    metrics.value.averageUpdateTime = metrics.value.totalUpdateTime / metrics.value.updateCount;
    
    return duration;
  };

  const recordError = () => {
    metrics.value.totalErrors++;
    metrics.value.errorRate = metrics.value.totalErrors / Math.max(metrics.value.updateCount, 1);
  };

  const resetMetrics = () => {
    metrics.value = {
      updateCount: 0,
      averageUpdateTime: 0,
      lastUpdateDuration: 0,
      totalUpdateTime: 0,
      errorRate: 0,
      totalErrors: 0
    };
  };

  return {
    metrics,
    startTiming,
    endTiming,
    recordError,
    resetMetrics
  };
}
