# Dashboard en Tiempo Real - Configuración

Este dashboard implementa actualizaciones en tiempo real siguiendo las mejores prácticas de desarrollo.

## 🚀 Características

### ✅ Implementado
- **Actualizaciones en tiempo real** con WebSockets y fallback a polling
- **Gráficos reactivos** que se actualizan automáticamente
- **Indicadores visuales** de estado de conexión
- **Optimización de rendimiento** con debouncing y throttling
- **Manejo de errores** robusto con reconexión automática
- **Composables reutilizables** para lógica de tiempo real
- **Responsive design** para móviles y desktop

### 📊 Datos en Tiempo Real
- Resumen de ventas (hoy/mes)
- Métodos de pago (gráfico de torta)
- Ventas por día (gráfico de barras)
- Productos más vendidos
- Actividades recientes
- Estadísticas de usuarios

## 🛠 Configuración

### 1. Variables de Entorno

Copia el archivo `.env.realtime` a `.env.local` y ajusta según tu configuración:

```bash
cp .env.realtime .env.local
```

### 2. Configuración del Backend

Para habilitar WebSockets en el backend, necesitas:

#### Express + Socket.IO (Recomendado)
```javascript
// server.js
const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Eventos para el dashboard
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  // Enviar datos iniciales
  socket.emit('dashboard_update', {
    type: 'dashboard_update',
    data: await getDashboardData()
  });
  
  // Escuchar solicitudes de actualización
  socket.on('force_update', async () => {
    const data = await getDashboardData();
    io.emit('dashboard_update', {
      type: 'dashboard_update',
      data
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Emitir actualizaciones cuando hay cambios
function emitDashboardUpdate(data) {
  io.emit('dashboard_update', {
    type: 'dashboard_update',
    timestamp: Date.now(),
    data
  });
}

// Ejemplo: emitir cuando hay una nueva venta
app.post('/api/sales', async (req, res) => {
  // ... crear venta ...
  
  // Emitir actualización
  emitDashboardUpdate(await getDashboardData());
  
  res.json(newSale);
});
```

### 3. Solo Polling (Sin WebSockets)

Si prefieres no usar WebSockets, configura en `.env.local`:

```bash
VITE_ENABLE_WEBSOCKETS=false
VITE_POLLING_ENABLED=true
VITE_POLLING_INTERVAL=15000  # 15 segundos
```

## 📱 Uso

### Automático
El dashboard se conecta automáticamente al cargar y mantiene los datos actualizados.

### Manual
- **Botón "Tiempo Real"**: Activa/desactiva las actualizaciones automáticas
- **Botón "Actualizar"**: Fuerza una actualización inmediata
- **Indicador de estado**: Muestra el estado de la conexión en tiempo real

### Estados de Conexión
- 🟢 **En Vivo**: Datos actualizándose en tiempo real
- 🟡 **Actualizando**: Obteniendo nuevos datos
- 🔴 **Desactualizado**: Los datos pueden estar obsoletos
- ⚫ **Desconectado**: Sin conexión en tiempo real

## 🎨 Personalización

### Intervalos de Actualización
```javascript
// En .env.local
VITE_POLLING_INTERVAL=30000      # 30 segundos
VITE_DEBOUNCE_TIME=1000         # 1 segundo
VITE_RECONNECT_INTERVAL=5000    # 5 segundos
```

### Tipos de Datos
Para añadir nuevos tipos de datos en tiempo real:

```javascript
// En el servicio realTimeService.js
handleRealTimeData(data) {
  switch (data.type) {
    case 'new_inventory':
      this.notifyListeners('new_inventory', data.data);
      break;
    // ... otros casos
  }
}
```

### Composables Personalizados
```javascript
// Ejemplo de uso del composable
import { useDashboardRealTime } from '@/composables/useRealTime';

export default {
  setup() {
    const {
      data,
      isConnected,
      connectionStatus,
      forceUpdate,
      chartKeys
    } = useDashboardRealTime({
      updateInterval: 20000, // 20 segundos
      enableNotifications: true
    });

    return {
      data,
      isConnected,
      connectionStatus,
      forceUpdate,
      chartKeys
    };
  }
}
```

## 🔧 Solución de Problemas

### WebSocket no conecta
1. Verifica que el backend esté corriendo
2. Revisa la URL de WebSocket en `.env.local`
3. Comprueba el firewall/proxy
4. El sistema automáticamente hará fallback a polling

### Datos no se actualizan
1. Verifica que el botón "Tiempo Real" esté activo
2. Revisa la consola del navegador por errores
3. Comprueba que el backend esté enviando los eventos correctos

### Rendimiento lento
1. Aumenta el `VITE_DEBOUNCE_TIME`
2. Reduce la frecuencia de `VITE_POLLING_INTERVAL`
3. Desactiva las animaciones: `VITE_CHART_ANIMATION_ENABLED=false`

## 📊 Monitoreo de Performance

El sistema incluye métricas de rendimiento automáticas:

```javascript
import { useRealTimePerformance } from '@/composables/useRealTime';

const { metrics } = useRealTimePerformance();

// metrics.value contiene:
// - updateCount: Número de actualizaciones
// - averageUpdateTime: Tiempo promedio de actualización
// - errorRate: Tasa de errores
// - etc.
```

## 🔒 Consideraciones de Seguridad

1. **Autenticación**: Los WebSockets deben validar tokens JWT
2. **Rate Limiting**: Implementar límites de conexiones por IP
3. **CORS**: Configurar correctamente el origen permitido
4. **Sanitización**: Validar todos los datos recibidos

## 🚀 Mejoras Futuras

- [ ] Compresión de datos WebSocket
- [ ] Sincronización offline con Service Workers
- [ ] Análiticas de uso en tiempo real
- [ ] Notificaciones push del navegador
- [ ] Clustering para múltiples instancias del servidor

## 📚 Referencias

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Chart.js Reactive Updates](https://www.chartjs.org/docs/latest/developers/updates.html)
- [WebSocket Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications)
- [Performance Optimization](https://web.dev/performance-budgets-101/)
