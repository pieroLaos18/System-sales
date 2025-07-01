<template>
  <div class="dashboard-page">
    <!-- Cabecera mejorada para Dashboard -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="header-text">
            <h1>Dashboard</h1>
            <p class="header-subtitle">Panel de control y estadísticas en tiempo real</p>
            <div class="header-stats">
              <div class="stat-item">
                <span class="stat-number">{{ resumenVentas.hoy }}</span>
                <span class="stat-label">Ventas Hoy</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ resumenVentas.mes }}</span>
                <span class="stat-label">Ventas Mes</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ resumenUsuarios.activos }}</span>
                <span class="stat-label">Usuarios</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <!-- Indicador de tiempo real -->
          <div class="real-time-indicator" :class="realTimeStatus">
            <div class="status-dot"></div>
            <div class="status-info">
              <div class="status-label">Tiempo Real</div>
              <div class="status-text">
                {{ realTimeStatus === 'connected' ? 'Conectado' : 
                   realTimeStatus === 'connecting' ? 'Conectando...' : 'Desconectado' }}
                <span v-if="realTimeType" class="connection-type">({{ realTimeType }})</span>
              </div>
              <div v-if="lastUpdate" class="last-update">
                Última actualización: {{ formatTimeAgo(lastUpdate) }}
              </div>
            </div>
          </div>
          
          <button class="btn-refresh" @click="refreshData" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            <span>{{ loading ? 'Cargando...' : 'Actualizar' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loader animado -->
    <div v-if="loading" class="loader"></div>

    <!-- Secciones principales -->
    <div v-else class="dashboard-content">
      <!-- Sección de gráficos -->
      <section class="charts-section">
        <div class="section-header">
          <h2><i class="fas fa-chart-bar"></i> Análisis de Ventas</h2>
        </div>
        <div class="charts-grid">
          <div class="chart-card">
            <div class="chart-header">
              <h3>Métodos de Pago</h3>
              <div class="chart-info">
                <i class="fas fa-info-circle" title="Distribución de métodos de pago utilizados"></i>
              </div>
            </div>
            <div class="chart-wrapper" v-if="metodosPago.length > 0">
              <Pie 
                :key="`pie-chart-${metodosPago.length}`"
                :data="chartDataMetodosPago" 
                :options="pieOptions" 
              />
            </div>
            <div v-else class="no-data-msg">
              <i class="fas fa-chart-pie"></i>
              <p>No hay datos de métodos de pago</p>
            </div>
          </div>
          
          <div class="chart-card">
            <div class="chart-header">
              <h3>Ventas por Día</h3>
              <div class="chart-info">
                <i class="fas fa-info-circle" title="Evolución de ventas en los últimos días"></i>
              </div>
            </div>
            <div class="chart-wrapper" v-if="ventasPorDia.length > 0">
              <Bar 
                :key="`bar-chart-${ventasPorDia.length}-${Date.now()}`"
                :data="chartDataVentasPorDia" 
                :options="barOptions" 
              />
            </div>
            <div v-else class="no-data-msg">
              <i class="fas fa-chart-bar"></i>
              <h4>Sin datos de ventas por día</h4>
              <p v-if="ventasPorDiaError">{{ ventasPorDiaError }}</p>
              <p v-else>El gráfico se mostrará cuando el servidor esté funcionando correctamente</p>
              <div v-if="ventasPorDiaError && ventasPorDiaError.includes('sql_mode')" class="error-details">
                <i class="fas fa-wrench"></i>
                <span>Problema técnico del servidor - contacta al administrador</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Sección de productos más vendidos -->
      <section class="top-products-section">
        <div class="section-header">
          <h2><i class="fas fa-trophy"></i> Productos Más Vendidos</h2>
          <router-link to="/main/products" class="section-link">
            <i class="fas fa-external-link-alt"></i>
            Ver todos
          </router-link>
        </div>
        <div class="top-products-grid">
          <div v-if="topProducts.length === 0" class="no-data-msg">
            <i class="fas fa-box-open"></i>
            <p>No hay datos de productos vendidos</p>
          </div>
          <div v-else v-for="(product, index) in topProducts" :key="product.id" class="product-rank-card">
            <div class="rank-badge" :class="'rank-' + (index + 1)">
              <span class="rank-number">{{ index + 1 }}</span>
              <i v-if="index === 0" class="fas fa-crown"></i>
              <i v-else-if="index === 1" class="fas fa-medal"></i>
              <i v-else class="fas fa-award"></i>
            </div>
            <div class="product-info">
              <div class="product-image">
                <img :src="product.image || defaultProductImg" :alt="product.name" />
              </div>
              <div class="product-details">
                <h4 class="product-name">{{ product.name }}</h4>
                <p class="product-category">{{ product.category }}</p>
                <div class="product-stats">
                  <div class="stat">
                    <span class="stat-label">Vendidos:</span>
                    <span class="stat-value">{{ product.cantidad_vendida }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Ingresos:</span>
                    <span class="stat-value">S/ {{ formatCurrency(product.total_ingresos) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Sección de actividades recientes -->
      <section class="recent-activities-section">
        <div class="section-header">
          <h2><i class="fas fa-history"></i> Actividades Recientes</h2>
          <router-link to="/main/actividades" class="section-link">
            <i class="fas fa-list"></i>
            Ver historial completo
          </router-link>
        </div>
        <div class="activities-list">
          <div v-if="recentActivities.length === 0" class="no-data-msg">
            <i class="fas fa-clipboard-list"></i>
            <p>No hay actividades registradas</p>
          </div>
          <div v-else v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon">
              <i :class="getActivityIcon(activity.tipo)"></i>
            </div>
            <div class="activity-content">
              <div class="activity-description">{{ activity.descripcion }}</div>
              <div class="activity-meta">
                <span class="activity-user">{{ activity.usuario || 'Sistema' }}</span>
                <span class="activity-time">{{ formatTimeAgo(activity.fecha) }}</span>
              </div>
            </div>
            <div class="activity-type" :class="'type-' + activity.tipo">
              {{ getActivityTypeName(activity.tipo) }}
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Notificaciones -->
    <div v-if="notification.show" class="notification" :class="notification.type">
      <i :class="notification.icon"></i>
      <span>{{ notification.message }}</span>
    </div>

    <div class="dashboard-background-decor"></div>
  </div>
</template>

<script>
import api from '@/services/api';
import realTimeService from '@/services/realTimeService';
import { Pie, Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

// Registrar todos los componentes necesarios para Chart.js
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale
);

export default {
  name: 'Dashboard',
  components: { Pie, Bar },
  data() {
    return {
      // Estado de carga
      loading: false,
      // Estado de tiempo real
      realTimeConnected: false,
      realTimeStatus: 'disconnected',
      realTimeType: null,
      lastUpdate: null,
      // Datos existentes
      resumenVentas: { hoy: 0, mes: 0 },
      resumenUsuarios: { activos: 0 },
      metodosPago: [],
      ventasPorDia: [],
      ventasPorDiaError: null, // Para rastrear errores específicos de ventas por día
      // Nuevos datos
      topProducts: [],
      recentActivities: [],
      // Imagen por defecto
      defaultProductImg: '/src/assets/images/default-product.png',
      // Notificaciones
      notification: {
        show: false,
        message: '',
        type: 'success',
        icon: 'fas fa-check-circle'
      },
      // Opciones de gráficos mejoradas
      pieOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: '#374151',
              font: { size: 12, weight: '600' },
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1f2937',
            bodyColor: '#374151',
            borderColor: '#667eea',
            borderWidth: 1,
            cornerRadius: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed * 100) / total).toFixed(1);
                return `${context.label}: ${percentage}%`;
              }
            }
          }
        },
        elements: {
          arc: {
            borderWidth: 2,
            borderColor: '#ffffff'
          }
        }
      },
      barOptions: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#374151',
              font: { size: 12, weight: '600' },
              padding: 15,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1f2937',
            bodyColor: '#374151',
            borderColor: '#667eea',
            borderWidth: 1,
            cornerRadius: 12,
            callbacks: {
              label: function(context) {
                return `Ventas: S/ ${Number(context.parsed.y).toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'category',
            ticks: { 
              color: '#6b7280', 
              font: { size: 11, weight: '500' },
              maxRotation: 45
            },
            grid: { 
              color: 'rgba(229, 231, 235, 0.5)',
              drawBorder: false,
              display: false
            }
          },
          y: {
            type: 'linear',
            beginAtZero: true,
            ticks: { 
              color: '#6b7280', 
              font: { size: 11, weight: '500' },
              callback: function(value) {
                return 'S/ ' + Number(value).toFixed(0);
              }
            },
            grid: { 
              color: 'rgba(229, 231, 235, 0.5)',
              drawBorder: false
            }
          }
        },
        elements: {
          bar: {
            borderRadius: {
              topLeft: 6,
              topRight: 6,
              bottomLeft: 0,
              bottomRight: 0
            },
            borderSkipped: false,
          }
        }
      }
    };
  },
  computed: {
    chartDataMetodosPago() {
      if (!this.metodosPago || !Array.isArray(this.metodosPago) || this.metodosPago.length === 0) {
        return {
          labels: ['Sin datos'],
          datasets: [{
            data: [1],
            backgroundColor: ['#e5e7eb'],
            borderWidth: 0,
            hoverOffset: 0
          }]
        };
      }
      
      const labels = this.metodosPago.map(m => m.metodo_pago || 'Otro');
      const data = this.metodosPago.map(m => Number(m.total) || 0);
      
      return {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#667eea',
            '#764ba2', 
            '#f093fb',
            '#f5576c',
            '#4facfe',
            '#00f2fe',
            '#43e97b'
          ],
          borderWidth: 0,
          hoverOffset: 8
        }]
      };
    },
    chartDataVentasPorDia() {
      console.log('🎨 Generando gráfico de barras con datos:', this.ventasPorDia);
      
      if (!this.ventasPorDia || !Array.isArray(this.ventasPorDia) || this.ventasPorDia.length === 0) {
        console.warn('⚠️ No hay datos para el gráfico de barras');
        return {
          labels: [],
          datasets: [{
            label: 'Total Ventas',
            data: [],
            backgroundColor: '#667eea',
            borderColor: '#667eea',
            borderWidth: 0,
            borderRadius: 8,
            borderSkipped: false,
          }]
        };
      }
      
      const labels = this.ventasPorDia.map(v => {
        return v.dia || v.day || v.fecha || 'Día';
      });
      
      const data = this.ventasPorDia.map(v => {
        const total = Number(v.total) || 0;
        return total;
      });
      
      console.log('� Datos del gráfico - Labels:', labels);
      console.log('📊 Datos del gráfico - Valores:', data);
      console.log('📊 Muestra de datos originales:', this.ventasPorDia.slice(0, 2));
      
      return {
        labels: labels,
        datasets: [{
          label: 'Total Ventas (S/)',
          data: data,
          backgroundColor: '#667eea',
          borderColor: '#5a67d8',
          borderWidth: 1,
          borderRadius: {
            topLeft: 8,
            topRight: 8,
            bottomLeft: 0,
            bottomRight: 0
          },
          borderSkipped: false,
        }]
      };
    }
  },
  async mounted() {
    this.$emit('set-title', 'Dashboard');
    
    // Inicializar servicio de tiempo real
    await this.initializeRealTime();
    
    // Cargar datos iniciales
    await this.loadAllData();
  },
  
  async beforeUnmount() {
    // Limpiar listeners y conexiones del tiempo real
    this.cleanupRealTime();
  },
  methods: {
    // ======= MÉTODOS DE TIEMPO REAL =======
    async initializeRealTime() {
      try {
        console.log('🚀 Inicializando tiempo real en Dashboard...');
        
        // Configurar listeners antes de inicializar
        realTimeService.addListener('dashboard-sales', this.handleSalesUpdate);
        realTimeService.addListener('dashboard-activities', this.handleActivitiesUpdate);
        realTimeService.addListener('dashboard-products', this.handleProductsUpdate);
        realTimeService.addListener('connection', this.handleConnectionStatus);
        
        // Inicializar el servicio
        await realTimeService.initialize();
        
        console.log('✅ Tiempo real inicializado correctamente');
        this.showNotification('Sistema de tiempo real activado', 'success', 'fas fa-broadcast-tower');
        
      } catch (error) {
        console.warn('⚠️ Error inicializando tiempo real:', error);
        this.showNotification('Tiempo real no disponible, usando modo manual', 'warning', 'fas fa-exclamation-triangle');
      }
    },
    
    cleanupRealTime() {
      console.log('🧹 Limpiando conexiones de tiempo real...');
      realTimeService.removeListener('dashboard-sales', this.handleSalesUpdate);
      realTimeService.removeListener('dashboard-activities', this.handleActivitiesUpdate);
      realTimeService.removeListener('dashboard-products', this.handleProductsUpdate);
      realTimeService.removeListener('connection', this.handleConnectionStatus);
      realTimeService.disconnect();
    },
    
    handleConnectionStatus(data) {
      console.log('🔌 Estado de conexión actualizado:', data);
      this.realTimeStatus = data.status;
      this.realTimeType = data.type;
      this.realTimeConnected = data.status === 'connected';
      
      if (data.status === 'connected') {
        this.showNotification(
          `Tiempo real conectado via ${data.type}`, 
          'success', 
          'fas fa-plug'
        );
      } else if (data.status === 'error') {
        console.warn('⚠️ Error de conexión tiempo real:', data.error);
      }
    },
    
    handleSalesUpdate(data) {
      console.log('💰 Actualización de ventas recibida:', data);
      this.lastUpdate = new Date();
      
      // Actualizar datos según el tipo de actualización
      if (data.type === 'summary') {
        this.resumenVentas = { ...this.resumenVentas, ...data.data };
      } else if (data.type === 'daily-sales') {
        this.ventasPorDia = this.processVentasPorDia(data.data);
      } else if (data.type === 'payment-methods') {
        this.metodosPago = data.data || [];
      }
      
      // Mostrar notificación de actualización
      this.showNotification('Datos de ventas actualizados', 'info', 'fas fa-chart-line');
    },
    
    handleActivitiesUpdate(data) {
      console.log('📋 Actualización de actividades recibida:', data);
      this.lastUpdate = new Date();
      
      if (data.data && Array.isArray(data.data)) {
        // Si es una nueva actividad, añadirla al principio
        if (data.type === 'new-activity') {
          this.recentActivities = [data.data, ...this.recentActivities.slice(0, 4)];
        } else {
          // Si es una actualización completa
          this.recentActivities = data.data.slice(0, 5);
        }
      }
      
      this.showNotification('Nueva actividad registrada', 'info', 'fas fa-bell');
    },
    
    handleProductsUpdate(data) {
      console.log('📦 Actualización de productos recibida:', data);
      this.lastUpdate = new Date();
      
      if (data.data && Array.isArray(data.data)) {
        this.topProducts = data.data.slice(0, 5).map(product => ({
          ...product,
          image: product.image 
            ? (product.image.startsWith('/uploads/') 
                ? `${import.meta.env.VITE_API_URL}${product.image}` 
                : product.image)
            : this.defaultProductImg
        }));
      }
      
      this.showNotification('Ranking de productos actualizado', 'info', 'fas fa-trophy');
    },

    // ======= MÉTODOS DE CARGA DE DATOS =======
    async loadAllData() {
      this.loading = true;
      try {
        await Promise.all([
          this.loadSummaryData(),
          this.loadTopProducts(),
          this.loadRecentActivities()
        ]);
        this.showNotification('Dashboard actualizado correctamente', 'success');
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        this.showNotification('Error al cargar datos del dashboard', 'error', 'fas fa-exclamation-triangle');
      } finally {
        this.loading = false;
      }
    },

    async loadSummaryData() {
      try {
        console.log('📡 Cargando datos de resumen del dashboard...');
        
        // Cargar datos básicos que generalmente funcionan
        const [resumen, usuarios, metodos] = await Promise.all([
          api.get('/sales/resumen'),
          api.get('/users/stats/activos'),
          api.get('/sales/metodos-pago')
        ]);
        
        // Asignar datos básicos
        this.resumenVentas = resumen.data || { hoy: 0, mes: 0 };
        this.resumenUsuarios = usuarios.data || { activos: 0 };
        
        // Procesar métodos de pago
        if (metodos.data && Array.isArray(metodos.data)) {
          this.metodosPago = metodos.data;
          console.log('✅ Métodos de pago cargados:', this.metodosPago.length);
        } else {
          console.warn('⚠️ Métodos de pago no válidos:', metodos.data);
          this.metodosPago = [];
        }
        
        // Intentar cargar ventas por día por separado para manejar errores específicos
        try {
          console.log('🔍 Cargando ventas por día...');
          const ventasDia = await api.get('/sales/ventas-por-dia');
          this.ventasPorDia = this.processVentasPorDia(ventasDia.data);
          this.ventasPorDiaError = null; // Limpiar error previo
          console.log('✅ Ventas por día cargadas:', this.ventasPorDia.length);
        } catch (ventasError) {
          console.warn('⚠️ Error específico en ventas por día:', ventasError);
          this.ventasPorDia = [];
          
          // Detectar tipo específico de error
          if (ventasError.response?.data?.error?.includes('sql_mode=only_full_group_by')) {
            this.ventasPorDiaError = 'Error de configuración del servidor (SQL)';
            console.error('🔧 Error de SQL detectado: sql_mode=only_full_group_by');
          } else if (ventasError.response?.status === 500) {
            this.ventasPorDiaError = 'Error interno del servidor en ventas por día';
          } else {
            this.ventasPorDiaError = `Error: ${ventasError.message}`;
          }
        }
        
      } catch (error) {
        console.error('❌ Error cargando datos de resumen:', error);
        
        // Asignar valores por defecto en caso de error general
        this.resumenVentas = { hoy: 0, mes: 0 };
        this.resumenUsuarios = { activos: 0 };
        this.metodosPago = [];
        this.ventasPorDia = [];
        this.ventasPorDiaError = 'Error general del servidor';
        
        this.showNotification('Error cargando datos del dashboard', 'error');
      }
    },

    async loadTopProducts() {
      try {
        const response = await api.get('/sales/top-products?limit=5');
        
        // Verificar la estructura de la respuesta
        let products = [];
        
        if (response.data && Array.isArray(response.data)) {
          products = response.data;
        } else if (response.data && response.data.productos && Array.isArray(response.data.productos)) {
          products = response.data.productos;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          products = response.data.data;
        } else {
          console.warn('Estructura de respuesta inesperada para productos más vendidos:', response.data);
          products = [];
        }

        if (products.length > 0) {
          this.topProducts = products.map(product => ({
            ...product,
            image: product.image 
              ? (product.image.startsWith('/uploads/') 
                  ? `${import.meta.env.VITE_API_URL}${product.image}` 
                  : product.image)
              : this.defaultProductImg
          }));
        } else {
          this.topProducts = [];
        }
      } catch (error) {
        console.error('Error cargando productos más vendidos:', error);
        this.topProducts = [];
      }
    },

    async loadRecentActivities() {
      try {
        const response = await api.get('/actividades/recientes?limit=5');
        // Verificar la estructura de la respuesta
        let activities = [];
        
        if (response.data && Array.isArray(response.data)) {
          // Si la respuesta es un array directo
          activities = response.data;
        } else if (response.data && response.data.actividades && Array.isArray(response.data.actividades)) {
          // Si la respuesta tiene la estructura {actividades: Array}
          activities = response.data.actividades;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Si la respuesta tiene la estructura {data: Array}
          activities = response.data.data;
        } else {
          console.warn('Estructura de respuesta inesperada para actividades recientes:', response.data);
          activities = [];
        }

        this.recentActivities = activities;
      } catch (error) {
        console.error('Error cargando actividades recientes:', error);
        this.recentActivities = [];
      }
    },

    async refreshData() {
      console.log('🔄 Actualizando datos del dashboard...');
      
      // Si el tiempo real está conectado, solicitar actualización via tiempo real
      if (this.realTimeConnected) {
        try {
          realTimeService.requestUpdate('dashboard');
          this.showNotification('Solicitando actualización en tiempo real...', 'info', 'fas fa-broadcast-tower');
        } catch (error) {
          console.warn('⚠️ Error solicitando actualización tiempo real, usando método manual:', error);
          await this.loadAllData();
        }
      } else {
        // Si no hay tiempo real, cargar datos manualmente
        await this.loadAllData();
      }
    },

    formatCurrency(amount) {
      return parseFloat(amount || 0).toFixed(2);
    },

    formatTimeAgo(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) {
        return 'Hace unos momentos';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `Hace ${days} día${days > 1 ? 's' : ''}`;
      }
    },

    getActivityIcon(tipo) {
      const icons = {
        'venta': 'fas fa-shopping-cart',
        'producto': 'fas fa-box',
        'usuario': 'fas fa-user',
        'login': 'fas fa-sign-in-alt',
        'logout': 'fas fa-sign-out-alt',
        'sistema': 'fas fa-cog',
        'inventario': 'fas fa-warehouse',
        'reporte': 'fas fa-chart-bar'
      };
      return icons[tipo] || 'fas fa-info-circle';
    },

    getActivityTypeName(tipo) {
      const types = {
        'venta': 'Venta',
        'producto': 'Producto',
        'usuario': 'Usuario',
        'login': 'Inicio',
        'logout': 'Cierre',
        'sistema': 'Sistema',
        'inventario': 'Inventario',
        'reporte': 'Reporte'
      };
      return types[tipo] || 'Actividad';
    },

    showNotification(message, type = 'success', icon = 'fas fa-check-circle') {
      this.notification = {
        show: true,
        message,
        type,
        icon
      };
      
      setTimeout(() => {
        this.notification.show = false;
      }, 4000);
    },

    // Método de debugging para ventas por día
    async debugVentasPorDia() {
      console.log('🔍 === DEBUGGING VENTAS POR DÍA ===');
      
      try {
        console.log('📡 Llamando a /sales/ventas-por-dia...');
        const response = await api.get('/sales/ventas-por-dia');
        
        console.log('✅ Respuesta recibida:');
        console.log('- Status:', response.status);
        console.log('- Headers:', response.headers);
        console.log('- Data completa:', response.data);
        console.log('- Tipo de data:', typeof response.data);
        console.log('- Es array?:', Array.isArray(response.data));
        
        if (response.data) {
          console.log('- Propiedades del objeto:', Object.keys(response.data));
          
          // Intentar encontrar los datos de ventas
          const processedData = this.processVentasPorDia(response.data);
          console.log('- Datos procesados:', processedData);
          
          if (processedData.length > 0) {
            console.log('- Primer elemento:', processedData[0]);
            console.log('- Estructura del primer elemento:', Object.keys(processedData[0]));
          } else {
            console.log('⚠️ No se encontraron datos de ventas procesados');
          }
        }
        
        this.showNotification('Debugging completado - revisa la consola', 'info');
        return response.data;
        
      } catch (error) {
        console.error('❌ Error en debugging:', error);
        console.error('- Mensaje:', error.message);
        console.error('- Status:', error.response?.status);
        console.error('- Data del error:', error.response?.data);
        
        if (error.response?.status === 500) {
          console.log('🔍 Error 500 - El backend tiene problemas con este endpoint');
          this.showNotification('Error 500: Problema en el servidor con ventas-por-dia', 'error');
        } else if (error.response?.status === 404) {
          console.log('🔍 Error 404 - El endpoint no existe');
          this.showNotification('Error 404: Endpoint ventas-por-dia no encontrado', 'warning');
        } else {
          this.showNotification(`Error de debugging: ${error.message}`, 'error');
        }
        
        // No relanzar el error para evitar el error no capturado
        return null;
      }
    },

    // Método mejorado para procesar ventas por día
    processVentasPorDia(data) {
      console.log('🔄 Procesando ventas por día:', data);
      
      if (!data) {
        console.warn('⚠️ No hay datos para procesar');
        return [];
      }
      
      // Caso 1: Es directamente un array
      if (Array.isArray(data)) {
        console.log('✅ Datos son un array directo:', data.length, 'elementos');
        return data;
      }
      
      // Caso 2: Tiene propiedad 'data' que es un array
      if (data.data && Array.isArray(data.data)) {
        console.log('✅ Datos encontrados en propiedad "data":', data.data.length, 'elementos');
        return data.data;
      }
      
      // Caso 3: Tiene propiedad 'ventas' que es un array
      if (data.ventas && Array.isArray(data.ventas)) {
        console.log('✅ Datos encontrados en propiedad "ventas":', data.ventas.length, 'elementos');
        return data.ventas;
      }
      
      // Caso 4: Buscar cualquier propiedad que sea un array
      const possibleKeys = ['results', 'items', 'sales', 'dailySales', 'ventasDiarias'];
      for (const key of possibleKeys) {
        if (data[key] && Array.isArray(data[key])) {
          console.log(`✅ Datos encontrados en propiedad "${key}":`, data[key].length, 'elementos');
          return data[key];
        }
      }
      
      // Caso 5: Es un objeto con datos de un solo día
      if (typeof data === 'object' && data.fecha && data.total !== undefined) {
        console.log('✅ Datos de un solo día detectados, convirtiendo a array');
        return [data];
      }
      
      console.warn('⚠️ Estructura inesperada en ventas por día:', data);
      console.warn('📋 Propiedades disponibles:', Object.keys(data));
      return [];
    },

    // Método para probar conectividad general del backend
    async testBackendConnectivity() {
      console.log('🧪 === PROBANDO CONECTIVIDAD DEL BACKEND ===');
      
      const endpoints = [
        { name: 'Resumen', url: '/sales/resumen' },
        { name: 'Usuarios', url: '/users/stats/activos' },
        { name: 'Métodos de pago', url: '/sales/metodos-pago' },
        { name: 'Ventas por día', url: '/sales/ventas-por-dia' },
        { name: 'Top productos', url: '/sales/top-products?limit=5' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Probando ${endpoint.name}: ${endpoint.url}`);
          const response = await api.get(endpoint.url);
          console.log(`✅ ${endpoint.name}: OK (${response.status})`);
          console.log(`   Data:`, response.data);
        } catch (error) {
          console.error(`❌ ${endpoint.name}: ERROR (${error.response?.status || 'No response'})`);
          console.error(`   Error:`, error.message);
          if (error.response?.data) {
            console.error(`   Server Error:`, error.response.data);
          }
        }
      }
      
      this.showNotification('Prueba de conectividad completada - revisa la consola', 'info');
    },

    // Método para verificar configuración del tiempo real
    checkRealTimeConfig() {
      console.log('🔧 === CONFIGURACIÓN DE TIEMPO REAL ===');
      
      const config = {
        enabled: import.meta.env.VITE_REALTIME_ENABLED,
        websockets: import.meta.env.VITE_ENABLE_WEBSOCKETS,
        polling: import.meta.env.VITE_POLLING_ENABLED,
        pollingInterval: import.meta.env.VITE_POLLING_INTERVAL,
        apiUrl: import.meta.env.VITE_API_URL,
        wsUrl: import.meta.env.VITE_WS_URL,
        dev: import.meta.env.DEV
      };
      
      console.log('📊 Variables de entorno:', config);
      console.log('🔌 Estado actual del servicio:', realTimeService.getStatus());
      console.log('📈 Estadísticas de errores:', realTimeService.getErrorStats());
      
      this.showNotification('Configuración mostrada en consola', 'info');
    },
  }
};
</script>

<style scoped>
.dashboard-page {
  padding: min(2.5rem, 4vw) min(1.5rem, 3vw) min(6rem, 8vw) min(1.5rem, 3vw);
  font-family: 'Inter', Arial, sans-serif;
  background: #f6f7fb;
  min-height: 100vh;
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
  box-sizing: border-box;
}

/* Estilos personalizados para scrollbar en navegadores webkit */
.dashboard-page::-webkit-scrollbar {
  width: 8px;
}

.dashboard-page::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.dashboard-page::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #cbd5e1, #94a3b8);
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.dashboard-page::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #94a3b8, #64748b);
}

/* Cabecera del Dashboard */
.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  pointer-events: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  gap: 1.5rem;
  flex: 1;
}

.header-icon {
  background: rgba(255,255,255,0.2);
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3);
}

.header-icon i {
  font-size: 1.8rem;
  color: white;
}

.header-text h1 {
  color: white;
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-subtitle {
  color: rgba(255,255,255,0.9);
  font-size: 1.1rem;
  margin: 0 0 1.5rem 0;
}

.header-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  min-width: 100px;
}

.stat-number {
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.stat-label {
  color: rgba(255,255,255,0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

/* Indicador de tiempo real */
.real-time-indicator {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 180px;
  transition: all 0.3s ease;
}

.real-time-indicator.connected {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
}

.real-time-indicator.connecting {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.4);
}

.real-time-indicator.disconnected {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #6b7280;
  flex-shrink: 0;
  animation: pulse 2s infinite;
}

.real-time-indicator.connected .status-dot {
  background: #10b981;
}

.real-time-indicator.connecting .status-dot {
  background: #f59e0b;
  animation: pulse 1s infinite;
}

.real-time-indicator.disconnected .status-dot {
  background: #ef4444;
  animation: none;
}

.status-info {
  flex: 1;
  min-width: 0;
}

.status-label {
  color: rgba(255,255,255,0.8);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.125rem;
}

.status-text {
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.2;
}

.connection-type {
  font-size: 0.75rem;
  opacity: 0.8;
  font-weight: 400;
}

.last-update {
  color: rgba(255,255,255,0.7);
  font-size: 0.7rem;
  margin-top: 0.125rem;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.btn-refresh {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-refresh:hover:not(:disabled) {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Contenido principal */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Secciones */
.charts-section,
.top-products-section,
.recent-activities-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 1rem;
}

.section-header h2 {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-header h2 i {
  color: #667eea;
  font-size: 1.3rem;
}

.section-link {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  text-decoration: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.section-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Gráficos */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.chart-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-header h3 {
  color: #374151;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.chart-info i {
  color: #9ca3af;
  cursor: help;
}

.chart-wrapper {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Productos más vendidos */
.top-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.product-rank-card {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #f1f5f9;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.product-rank-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.rank-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  border: 3px solid #fbbf24;
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #c0c0c0, #e5e7eb);
  border: 3px solid #9ca3af;
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #d97706);
  border: 3px solid #b45309;
}

.rank-number {
  font-size: 1.2rem;
  position: relative;
  z-index: 2;
}

.rank-badge i {
  position: absolute;
  font-size: 0.8rem;
  top: 8px;
  color: rgba(255,255,255,0.8);
}

.product-info {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-top: 0.5rem;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
  flex-shrink: 0;
  border: 2px solid #e5e7eb;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  flex: 1;
}

.product-name {
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.product-category {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
}

.product-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #6b7280;
  font-size: 0.85rem;
  font-weight: 500;
}

.stat-value {
  color: #1f2937;
  font-weight: 600;
  font-size: 0.9rem;
}

/* Actividades recientes */
.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateX(5px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-description {
  color: #1f2937;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.activity-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #6b7280;
}

.activity-type {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #e5e7eb;
  color: #374151;
}

.activity-type.type-venta {
  background: #dcfce7;
  color: #166534;
}

.activity-type.type-producto {
  background: #ddd6fe;
  color: #5b21b6;
}

.activity-type.type-usuario {
  background: #fef3c7;
  color: #92400e;
}

.activity-type.type-sistema {
  background: #e0f2fe;
  color: #0369a1;
}

/* Estados sin datos */
.no-data-msg {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.no-data-msg i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
  color: #d1d5db;
}

.no-data-msg p {
  font-size: 1.1rem;
  margin: 0;
}

/* Loader */
.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.loader::after {
  content: '';
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Notificaciones */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.notification.info {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.notification.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Decoración de fondo */
.dashboard-background-decor {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

/* Media queries para responsividad */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .top-products-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 1rem 1rem 4rem 1rem;
  }
  
  .dashboard-header {
    padding: 1.5rem;
    border-radius: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-left {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-stats {
    gap: 1rem;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }
  
  .real-time-indicator {
    min-width: auto;
    width: 100%;
    justify-content: center;
  }
  
  .charts-section,
  .top-products-section,
  .recent-activities-section {
    padding: 1.5rem;
    border-radius: 16px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .top-products-grid {
    grid-template-columns: 1fr;
  }
  
  .product-rank-card {
    padding: 1rem;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .activity-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
}

/* Media queries para responsividad del scroll */
@media (min-width: 1024px) {
  .dashboard-page {
    padding: 2.5rem 1.5rem 6rem 1.5rem !important;
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 1rem 1rem 5rem 1rem !important;
  }
}

@media (max-width: 480px) {
  .dashboard-page {
    padding: 0.5rem 0.5rem 3.5rem 0.5rem !important;
  }
}

@media (max-width: 360px) {
  .dashboard-page {
    padding: 0.75rem 0.25rem 3rem 0.25rem !important;
  }
}

/* Detalles de errores técnicos */
.error-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #dc2626;
  margin-top: 1rem;
}

.error-details i {
  font-size: 1rem !important;
  color: #dc2626 !important;
  margin: 0 !important;
}
</style>
