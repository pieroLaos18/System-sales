<template>
  <div class="dynamic-content reports-page">
    <!-- Cabecera mejorada para Reports.vue -->
    <div class="reports-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="header-text">
            <h1>Reportes de Ventas</h1>
            <p class="header-subtitle">Análisis completo y exportación de datos de ventas</p>
            <div class="header-stats">
              <div class="stat-item">
                <span class="stat-number">{{ reportData.length }}</span>
                <span class="stat-label">Registros</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ totalAmount }}</span>
                <span class="stat-label">Total S/</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ uniqueProducts }}</span>
                <span class="stat-label">Productos</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button class="btn-generate-report" @click="fetchReport" :disabled="loading">
            <i class="fas fa-chart-bar"></i>
            <span>{{ loading ? 'Generando...' : 'Generar Reporte' }}</span>
          </button>
        </div>
      </div>
      
      <div class="filters-section">
        <div class="date-filters">
          <div class="date-container">
            <div class="date-wrapper">
              <i class="fas fa-calendar-alt date-icon"></i>
              <input
                type="date"
                v-model="fromDate"
                placeholder="Fecha inicio"
                class="date-input"
              />
              <label class="date-label">Desde</label>
            </div>
          </div>
          
          <div class="date-container">
            <div class="date-wrapper">
              <i class="fas fa-calendar-alt date-icon"></i>
              <input
                type="date"
                v-model="toDate"
                placeholder="Fecha fin"
                class="date-input"
              />
              <label class="date-label">Hasta</label>
            </div>
          </div>
        </div>
        
        <div class="export-controls" v-if="reportData.length > 0">
          <div class="export-label">Exportar como:</div>
          <div class="export-buttons">
            <button class="export-btn csv" @click="exportCSV" title="Exportar a CSV">
              <i class="fas fa-file-csv"></i>
              <span>CSV</span>
            </button>
            <button class="export-btn excel" @click="exportExcel" title="Exportar a Excel">
              <i class="fas fa-file-excel"></i>
              <span>Excel</span>
            </button>
            <button class="export-btn pdf" @click="exportPDF" title="Exportar a PDF">
              <i class="fas fa-file-pdf"></i>
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loader animado -->
    <div v-if="loading" class="loader"></div>

    <!-- Mensaje si no hay reportes -->
    <div v-else-if="reportData.length === 0 && !loading" class="no-reports-msg">
      <i class="fas fa-chart-line"></i>
      <p>No hay datos para mostrar en el período seleccionado.</p>
      <small>Selecciona un rango de fechas y genera un reporte</small>
    </div>

    <!-- Tabla de reportes moderna -->
    <div v-else class="reports-table-container">
      <div class="table-header">
        <h3>Datos del Reporte</h3>
        <div class="table-summary">
          <span>{{ reportData.length }} registro(s) encontrado(s)</span>
        </div>
      </div>
      
      <div class="table-wrapper">
        <table class="reports-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Total</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reportData" :key="item.id" class="table-row">
              <td>
                <div class="date-cell">
                  <i class="fas fa-calendar"></i>
                  {{ formatDate(item.date) }}
                </div>
              </td>
              <td>
                <div class="product-cell">
                  <span class="product-name">{{ item.product }}</span>
                </div>
              </td>
              <td>
                <div class="quantity-cell">
                  <span class="quantity-badge">{{ item.quantity }}</span>
                </div>
              </td>
              <td>
                <div class="total-cell">
                  <span class="total-amount">S/ {{ formatCurrency(item.total) }}</span>
                </div>
              </td>
              <td>
                <div class="user-cell">
                  <i class="fas fa-user"></i>
                  {{ item.usuario }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="table-footer" v-if="reportData.length > 0">
        <div class="summary-stats">
          <div class="summary-item">
            <span class="summary-label">Total General:</span>
            <span class="summary-value">S/ {{ formatCurrency(totalAmount) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Promedio por venta:</span>
            <span class="summary-value">S/ {{ formatCurrency(averageSale) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Notificaciones -->
    <div v-if="notification.show" class="notification" :class="notification.type">
      <i :class="notification.icon"></i>
      <span>{{ notification.message }}</span>
    </div>

    <div class="reports-background-decor"></div>
  </div>
</template>

<script>
// Importa librerías para exportar reportes
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

export default {
  data() {
    return {
      // Fechas para filtrar el reporte
      fromDate: '',
      toDate: '',
      // Datos del reporte
      reportData: [],
      // Estado de carga
      loading: false,
      // Notificaciones
      notification: {
        show: false,
        message: '',
        type: 'success',
        icon: 'fas fa-check-circle'
      }
    }
  },
  computed: {
    // Calcula el total de todas las ventas
    totalAmount() {
      return this.reportData.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2);
    },
    // Calcula el número de productos únicos
    uniqueProducts() {
      const products = new Set(this.reportData.map(item => item.product));
      return products.size;
    },
    // Calcula el promedio por venta
    averageSale() {
      return this.reportData.length > 0 
        ? (this.totalAmount / this.reportData.length).toFixed(2) 
        : '0.00';
    }
  },
  methods: {
    // Obtiene los datos del reporte desde la API
    async fetchReport() {
      if (!this.fromDate && !this.toDate) {
        this.showNotification('Por favor selecciona al menos una fecha', 'error', 'fas fa-exclamation-triangle');
        return;
      }

      this.loading = true;
      this.reportData = [];

      try {
        let url = `${import.meta.env.VITE_API_URL}/api/reports/by-date`;
        const params = [];
        if (this.fromDate) params.push(`from=${this.fromDate}`);
        if (this.toDate) params.push(`to=${this.toDate}`);
        if (params.length) url += `?${params.join('&')}`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Respuesta del backend:', data);
        
        this.reportData = data.map(item => ({
          id: item.id,
          date: item.fecha,
          product: item.product,
          quantity: item.cantidad,
          total: item.total,
          usuario: item.usuario
        }));

        if (this.reportData.length > 0) {
          this.showNotification(`Reporte generado con ${this.reportData.length} registros`, 'success');
        } else {
          this.showNotification('No se encontraron datos para el período seleccionado', 'warning', 'fas fa-info-circle');
        }

      } catch (error) {
        console.error('Error al obtener reporte:', error);
        this.showNotification('Error al generar el reporte', 'error', 'fas fa-exclamation-triangle');
        this.reportData = [];
      } finally {
        this.loading = false;
      }
    },

    // Exporta el reporte a CSV
    exportCSV() {
      try {
        const headers = ['Fecha', 'Producto', 'Cantidad', 'Total', 'Usuario'];
        const rows = this.reportData.map(item => [
          item.date, item.product, item.quantity, item.total, item.usuario
        ]);
        
        let csvContent = headers.join(',') + '\n' +
          rows.map(e => e.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `reporte_${this.getDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Reporte CSV descargado exitosamente', 'success');
      } catch (error) {
        this.showNotification('Error al exportar CSV', 'error', 'fas fa-exclamation-triangle');
      }
    },

    // Exporta el reporte a Excel
    async exportExcel() {
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Reporte de Ventas");

        // Estilo para encabezados
        worksheet.columns = [
          { header: 'Fecha', key: 'date', width: 15 },
          { header: 'Producto', key: 'product', width: 30 },
          { header: 'Cantidad', key: 'quantity', width: 12 },
          { header: 'Total', key: 'total', width: 15 },
          { header: 'Usuario', key: 'usuario', width: 20 },
        ];

        // Estilo del encabezado
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFF' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '667eea' }
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        // Agregar los datos
        this.reportData.forEach(item => {
          worksheet.addRow({
            date: item.date,
            product: item.product,
            quantity: item.quantity,
            total: parseFloat(item.total),
            usuario: item.usuario
          });
        });

        // Agregar fila de total
        const totalRow = worksheet.addRow({
          date: '',
          product: '',
          quantity: 'TOTAL:',
          total: parseFloat(this.totalAmount),
          usuario: ''
        });
        totalRow.font = { bold: true };
        totalRow.getCell(4).font = { bold: true, color: { argb: '059669' } };

        // Exportar como archivo .xlsx
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { 
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reporte_${this.getDateString()}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Reporte Excel descargado exitosamente', 'success');
      } catch (error) {
        this.showNotification('Error al exportar Excel', 'error', 'fas fa-exclamation-triangle');
      }
    },

    // Exporta el reporte a PDF
    exportPDF() {
      try {
        const doc = new jsPDF();
        
        // Título del documento
        doc.setFontSize(20);
        doc.text('Reporte de Ventas', 14, 22);
        
        // Fecha del reporte
        doc.setFontSize(12);
        doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 32);
        
        if (this.fromDate || this.toDate) {
          let dateRange = 'Período: ';
          if (this.fromDate) dateRange += `Desde ${this.fromDate}`;
          if (this.toDate) dateRange += ` Hasta ${this.toDate}`;
          doc.text(dateRange, 14, 40);
        }

        // Tabla de datos
        const tableData = this.reportData.map(item => [
          item.date,
          item.product,
          item.quantity.toString(),
          `S/ ${item.total}`,
          item.usuario
        ]);

        autoTable(doc, {
          head: [['Fecha', 'Producto', 'Cantidad', 'Total', 'Usuario']],
          body: tableData,
          startY: this.fromDate || this.toDate ? 50 : 42,
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [102, 126, 234],
            textColor: 255,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250],
          },
          foot: [['', '', '', `S/ ${this.totalAmount}`, '']],
          footStyles: {
            fillColor: [240, 240, 240],
            fontStyle: 'bold',
          },
        });

        // Guardar el PDF
        doc.save(`reporte_${this.getDateString()}.pdf`);
        this.showNotification('Reporte PDF descargado exitosamente', 'success');
      } catch (error) {
        this.showNotification('Error al exportar PDF', 'error', 'fas fa-exclamation-triangle');
      }
    },

    // Formatea fechas para mostrar
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },

    // Formatea moneda
    formatCurrency(amount) {
      return parseFloat(amount || 0).toFixed(2);
    },

    // Genera string de fecha para nombres de archivo
    getDateString() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    },

    // Muestra notificaciones
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
    }
  },
  
  mounted() {
    // Establecer fecha de hoy como valor por defecto
    const today = new Date().toISOString().split('T')[0];
    this.toDate = today;
    
    // Fecha de inicio: hace una semana
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    this.fromDate = weekAgo.toISOString().split('T')[0];
  }
}
</script>

<style scoped>
/* Fondo y contenedor principal */
.reports-page {
  padding: min(2.5rem, 4vw) min(1.5rem, 3vw) min(6rem, 8vw) min(1.5rem, 3vw);
  font-family: 'Inter', Arial, sans-serif;
  background: #f6f7fb;
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #667eea #f1f5f9;
}

/* Cabecera mejorada */
.reports-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.reports-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
  pointer-events: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}

.header-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 1.25rem;
  font-size: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-text h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.header-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0 0 1.5rem 0;
  font-weight: 400;
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-actions {
  position: relative;
  z-index: 1;
}

.btn-generate-report {
  background: white;
  color: #667eea;
  border: none;
  border-radius: 16px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-generate-report:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  background: #f8fafc;
}

.btn-generate-report:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.filters-section {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.date-filters {
  display: flex;
  gap: 1rem;
  flex: 1;
  min-width: 300px;
}

.date-container {
  flex: 1;
  position: relative;
}

.date-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-icon {
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.7);
  z-index: 1;
}

.date-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: white;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.date-input:focus {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.date-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

.date-label {
  position: absolute;
  top: -0.5rem;
  left: 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.export-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.75rem 1rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.export-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
}

.export-buttons {
  display: flex;
  gap: 0.5rem;
}

.export-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 12px;
  padding: 0.5rem 0.75rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.export-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.export-btn.csv:hover { background: rgba(46, 125, 50, 0.8); }
.export-btn.excel:hover { background: rgba(67, 160, 71, 0.8); }
.export-btn.pdf:hover { background: rgba(244, 67, 54, 0.8); }

/* Loader y mensajes */
.loader {
  width: 48px;
  height: 48px;
  border: 5px solid #ececec;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 2rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-reports-msg {
  color: #8a94a6;
  text-align: center;
  font-size: 1.1rem;
  margin: 2rem 0;
  padding: 3rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.no-reports-msg i {
  font-size: 3rem;
  color: #cbd5e0;
  margin-bottom: 1rem;
  display: block;
}

.no-reports-msg p {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #4a5568;
}

.no-reports-msg small {
  color: #9ca3af;
  font-size: 0.95rem;
}

/* Tabla moderna */
.reports-table-container {
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
}

.table-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-header h3::before {
  content: '📊';
  font-size: 1.5rem;
}

.table-summary {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 1px solid #d1d5db;
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  max-height: calc(100vh - 400px);
  -webkit-overflow-scrolling: touch;
  /* Optimización para muchos datos */
  contain: layout style paint;
  will-change: scroll-position;
  /* Scroll momentum para iOS */
  -webkit-overflow-scrolling: touch;
  /* Aceleración por hardware */
  transform: translateZ(0);
  /* Contenido optimizado */
  contain: strict;
  /* Scroll suave en todos los navegadores */
  scroll-behavior: smooth;
  /* Mejor performance con muchos elementos */
  will-change: scroll-position;
}

.reports-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: transparent;
  min-width: 700px;
  /* Optimización de rendering */
  contain: layout style;
}

.reports-table thead {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  position: sticky;
  top: 0;
  z-index: 10;
}

.reports-table th {
  padding: 1.25rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: none;
}

.reports-table tbody {
  /* Contenido optimizado para virtual scrolling */
  contain: layout style paint;
}

.reports-table tbody tr {
  /* Optimización para filas individuales */
  contain: layout style paint;
  /* Prepara para animaciones */
  will-change: transform, opacity;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
  /* Optimización para scrolling con muchos datos */
  contain: layout style paint;
}

.reports-table tbody tr:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  transform: translateX(2px);
}

.reports-table tbody tr:last-child {
  border-bottom: none;
}

.reports-table td {
  padding: 1rem;
  vertical-align: middle;
  border: none;
}

.date-cell,
.product-cell,
.quantity-cell,
.total-cell,
.user-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-cell i {
  color: #667eea;
  font-size: 0.875rem;
}

.product-name {
  font-weight: 600;
  color: #1f2937;
}

.quantity-badge {
  background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
  color: #0277bd;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid #81d4fa;
}

.total-amount {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  color: #2e7d32;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.875rem;
  border: 1px solid #a5d6a7;
}

.user-cell i {
  color: #9ca3af;
  font-size: 0.875rem;
}

.table-footer {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 1.5rem 2rem;
  border-top: 2px solid #e0f2fe;
}

.summary-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  padding: 0.75rem 1.25rem;
  border-radius: 16px;
  border: 1px solid #b3e5fc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #455a64;
}

.summary-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1565c0;
}

/* Notificaciones */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  color: white;
  font-weight: 600;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideIn 0.3s ease;
  backdrop-filter: blur(10px);
}

.notification.success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.notification.error {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
}

.notification.warning {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Decoración de fondo */
.reports-background-decor {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

/* Scrollbars personalizados */
.reports-page::-webkit-scrollbar,
.table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.reports-page::-webkit-scrollbar-track,
.table-wrapper::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.reports-page::-webkit-scrollbar-thumb,
.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

.reports-page::-webkit-scrollbar-thumb:hover,
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.table-wrapper::-webkit-scrollbar-corner {
  background: #f1f5f9;
}

/* RESPONSIVE DESIGN */

/* Breakpoint intermedio para tablets grandes */
@media (max-width: 1200px) {
  .header-stats {
    gap: 1.5rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .date-filters {
    flex-wrap: wrap;
  }
}

/* Tablets (768px - 1024px) */
@media (max-width: 1024px) {
  .reports-page {
    padding: min(2rem, 3vw) min(1rem, 2vw) min(5rem, 6vw) min(1rem, 2vw);
  }
  
  .reports-header {
    padding: 2rem;
    margin-bottom: 1.5rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }
  
  .header-left {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-text h1 {
    font-size: 2rem;
  }
  
  .header-stats {
    justify-content: center;
    gap: 1.5rem;
  }
  
  .header-actions {
    align-self: center;
  }
  
  .filters-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .date-filters {
    min-width: auto;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .export-controls {
    justify-content: center;
  }
  
  .export-buttons {
    gap: 0.75rem;
  }
  
  .table-header {
    padding: 1.25rem 1.5rem;
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 450px);
  }
  
  .summary-stats {
    justify-content: center;
    flex-wrap: wrap;
  }
}

/* Móviles (hasta 768px) */
@media (max-width: 768px) {
  .reports-page {
    padding: min(1.5rem, 3vw) min(0.75rem, 2vw) min(4rem, 6vw) min(0.75rem, 2vw);
  }
  
  .reports-header {
    padding: 1.5rem;
    border-radius: 20px;
  }
  
  .header-icon {
    padding: 1rem;
    font-size: 1.5rem;
  }
  
  .header-text h1 {
    font-size: 1.75rem;
  }
  
  .header-subtitle {
    font-size: 1rem;
  }
  
  .header-stats {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
  }
  
  .btn-generate-report {
    padding: 0.875rem 1.25rem;
    font-size: 0.95rem;
    width: 100%;
    justify-content: center;
  }
  
  .filters-section {
    gap: 1rem;
  }
  
  .date-filters {
    width: 100%;
  }
  
  .export-controls {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
    width: 100%;
  }
  
  .export-buttons {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .export-btn {
    flex: 1;
    min-width: 80px;
    padding: 0.625rem 0.75rem;
    font-size: 0.8rem;
  }
  
  .export-btn span {
    display: none;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 500px);
    border-radius: 16px;
  }
  
  .reports-table {
    min-width: 600px;
  }
  
  .reports-table th,
  .reports-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .table-header {
    padding: 1rem 1.5rem;
  }
  
  .table-header h3 {
    font-size: 1.1rem;
  }
  
  .date-cell,
  .product-cell,
  .quantity-cell,
  .total-cell,
  .user-cell {
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
  }
  
  .quantity-badge,
  .total-amount {
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .summary-item {
    padding: 0.625rem 1rem;
    width: 100%;
  }
  
  .notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
    padding: 0.875rem 1rem;
    font-size: 0.9rem;
  }
  
  .no-reports-msg {
    padding: 2rem 1rem;
    margin: 1rem 0;
  }
  
  .no-reports-msg i {
    font-size: 2.5rem;
  }
  
  .no-reports-msg p {
    font-size: 1.1rem;
  }
}

/* Móviles pequeños (hasta 480px) */
@media (max-width: 480px) {
  .reports-page {
    padding: min(1rem, 2vw) min(0.5rem, 1vw) min(3rem, 5vw) min(0.5rem, 1vw);
  }
  
  .reports-header {
    padding: 1.25rem;
    border-radius: 16px;
  }
  
  .header-icon {
    padding: 0.875rem;
    font-size: 1.25rem;
  }
  
  .header-text h1 {
    font-size: 1.5rem;
  }
  
  .header-subtitle {
    font-size: 0.9rem;
  }
  
  .header-stats {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
  
  .stat-item {
    align-items: center;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
  
  .stat-label {
    font-size: 0.75rem;
  }
  
  .btn-generate-report {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
  
  .date-input {
    font-size: 16px; /* Evita zoom en iOS */
    padding: 0.75rem 1rem 0.75rem 2.5rem;
  }
  
  .date-label {
    font-size: 0.7rem;
  }
  
  .export-btn {
    min-width: 70px;
    padding: 0.5rem 0.625rem;
    font-size: 0.75rem;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 550px);
    border-radius: 12px;
  }
  
  .reports-table {
    min-width: 500px;
  }
  
  .reports-table th,
  .reports-table td {
    padding: 0.625rem 0.375rem;
    font-size: 0.8rem;
  }
  
  .table-header {
    padding: 0.875rem 1rem;
  }
  
  .table-header h3 {
    font-size: 1rem;
  }
  
  .table-summary {
    font-size: 0.8rem;
    padding: 0.375rem 0.75rem;
  }
  
  .summary-item {
    flex-direction: column;
    text-align: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
  }
  
  .summary-label {
    font-size: 0.8rem;
  }
  
  .summary-value {
    font-size: 1rem;
  }
  
  .notification {
    padding: 0.75rem 0.875rem;
    font-size: 0.85rem;
  }
  
  .no-reports-msg {
    padding: 1.5rem 0.75rem;
  }
  
  .no-reports-msg i {
    font-size: 2rem;
  }
  
  .no-reports-msg p {
    font-size: 1rem;
  }
  
  .no-reports-msg small {
    font-size: 0.85rem;
  }
}

/* Dispositivos muy pequeños (hasta 360px) */
@media (max-width: 360px) {
  .reports-page {
    padding: min(0.75rem, 1.5vw) min(0.25rem, 0.5vw) min(2.5rem, 4vw) min(0.25rem, 0.5vw);
  }
  
  .reports-header {
    padding: 1rem 0.75rem;
    border-radius: 12px;
  }
  
  .header-icon {
    padding: 0.75rem;
    font-size: 1rem;
  }
  
  .header-text h1 {
    font-size: 1.25rem;
  }
  
  .header-subtitle {
    font-size: 0.85rem;
  }
  
  .stat-number {
    font-size: 1.125rem;
  }
  
  .stat-label {
    font-size: 0.7rem;
  }
  
  .btn-generate-report {
    padding: 0.625rem 0.875rem;
    font-size: 0.8rem;
  }
  
  .date-input {
    padding: 0.625rem 0.875rem 0.625rem 2.25rem;
    font-size: 16px;
  }
  
  .export-btn {
    min-width: 60px;
    padding: 0.375rem 0.5rem;
    font-size: 0.7rem;
  }
  
  .reports-table {
    min-width: 450px;
  }
  
  .reports-table th,
  .reports-table td {
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
  }
  
  .table-header {
    padding: 0.75rem 0.875rem;
  }
  
  .table-header h3 {
    font-size: 0.9rem;
  }
  
  .notification {
    padding: 0.625rem 0.75rem;
    font-size: 0.8rem;
  }
}

/* Breakpoint intermedio para scrolling */
@media (max-width: 640px) {
  .reports-table {
    min-width: 600px;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 500px);
    border-radius: 16px;
  }
  
  .reports-table th,
  .reports-table td {
    white-space: nowrap;
    padding: 0.75rem 0.5rem;
  }
  
  .date-cell i,
  .product-cell i,
  .quantity-cell i,
  .total-cell i,
  .user-cell i {
    display: none;
  }
}

/* Modo landscape en móviles mejorado */
@media (max-height: 500px) and (orientation: landscape) {
  .reports-page {
    padding: min(1rem, 2vw) min(1rem, 2vw) min(2rem, 4vw) min(1rem, 2vw);
  }
  
  .reports-header {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .header-content {
    gap: 1rem;
  }
  
  .header-left {
    flex-direction: row;
    text-align: left;
  }
  
  .header-text h1 {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
  
  .header-subtitle {
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
  }
  
  .header-stats {
    flex-direction: row;
    gap: 1rem;
    justify-content: flex-start;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
  
  .filters-section {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .date-filters {
    flex-direction: row;
    gap: 0.5rem;
    min-width: 400px;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 200px);
  }
}

/* Modo landscape específico para tablets */
@media (min-width: 768px) and (max-height: 600px) and (orientation: landscape) {
  .header-content {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .header-left {
    flex-direction: row;
    gap: 2rem;
  }
  
  .filters-section {
    flex-direction: row;
    gap: 1rem;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 250px);
  }
}

/* Soporte para dispositivos plegables */
@media (min-width: 280px) and (max-width: 653px) {
  .reports-page {
    padding: min(0.5rem, 1vw) min(0.25rem, 0.5vw) min(2rem, 3vw) min(0.25rem, 0.5vw);
  }
  
  .reports-header {
    padding: 0.875rem 0.5rem;
  }
  
  .header-text h1 {
    font-size: 1.125rem;
  }
  
  .filters-section {
    gap: 0.5rem;
  }
  
  .export-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .export-btn {
    width: 100%;
    justify-content: center;
  }
}

/* Ajustes para dispositivos con notch o island */
@supports (padding-top: env(safe-area-inset-top)) {
  .reports-page {
    padding-top: calc(min(2.5rem, 4vw) + env(safe-area-inset-top));
    padding-left: calc(min(1.5rem, 3vw) + env(safe-area-inset-left));
    padding-right: calc(min(1.5rem, 3vw) + env(safe-area-inset-right));
    padding-bottom: calc(min(6rem, 8vw) + env(safe-area-inset-bottom));
  }
  
  .notification {
    top: calc(20px + env(safe-area-inset-top));
    right: calc(20px + env(safe-area-inset-right));
    left: calc(20px + env(safe-area-inset-left));
  }
}

/* Pantallas grandes (1440px+) */
@media (min-width: 1440px) {
  .reports-page {
    padding: min(3rem, 2vw) min(2rem, 1.5vw) min(8rem, 10vw) min(2rem, 1.5vw);
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .reports-header {
    padding: 3rem;
  }
  
  .header-text h1 {
    font-size: 3rem;
  }
  
  .header-subtitle {
    font-size: 1.25rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 300px);
  }
}

/* Ajustes dinámicos para muchos datos */
@media (min-height: 800px) {
  .table-wrapper {
    max-height: calc(100vh - 350px);
  }
}

@media (min-height: 1000px) {
  .table-wrapper {
    max-height: calc(100vh - 400px);
  }
}

@media (min-height: 1200px) {
  .table-wrapper {
    max-height: calc(100vh - 300px);
  }
}

/* Optimización para pantallas muy anchas con muchos datos */
@media (min-width: 1600px) {
  .reports-page {
    max-width: 1600px;
    margin: 0 auto;
  }
  
  .reports-table {
    min-width: 1000px;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 250px);
  }
  
  .header-text h1 {
    font-size: 3.5rem;
  }
  
  .header-subtitle {
    font-size: 1.5rem;
  }
}

/* Optimización para pantallas ultrawide */
@media (min-width: 1920px) {
  .reports-page {
    max-width: 1800px;
  }
  
  .reports-header {
    padding: 4rem;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 200px);
  }
}

/* Breakpoints específicos de altura para mejor experiencia */
@media (max-height: 600px) {
  .reports-header {
    padding: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 300px);
  }
  
  .header-stats {
    gap: 1rem;
  }
}

@media (max-height: 700px) {
  .table-wrapper {
    max-height: calc(100vh - 320px);
  }
}

/* Para dispositivos con scroll horizontal limitado */
@media (max-width: 640px) {
  .reports-table {
    min-width: 600px;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 500px);
    border-radius: 16px;
  }
  
  .reports-table th,
  .reports-table td {
    white-space: nowrap;
    padding: 0.75rem 0.5rem;
  }
}

/* Animaciones y transiciones mejoradas */
.reports-table-container {
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Accesibilidad mejorada */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .reports-table-container {
    animation: none;
  }
}

/* Mejoras para dispositivos táctiles */
@media (pointer: coarse) {
  .btn-generate-report,
  .export-btn {
    min-height: 44px;
    padding: 0.875rem 1.25rem;
  }
  
  .date-input {
    min-height: 44px;
    padding: 0.875rem 1rem 0.875rem 2.75rem;
  }
  
  .reports-table th,
  .reports-table td {
    padding: 1rem 0.75rem;
  }
  
  .notification {
    padding: 1rem 1.25rem;
    min-height: 44px;
  }
}

/* Optimización para pantallas de alta densidad */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .header-icon {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
  
  .reports-table th,
  .reports-table td {
    border-width: 0.5px;
  }
}

/* Mejoras para modo de alto contraste */
@media (prefers-contrast: high) {
  .reports-header {
    border: 2px solid #000;
  }
  
  .reports-table-container {
    border: 2px solid #000;
  }
  
  .reports-table th {
    border-bottom: 2px solid #000;
  }
  
  .reports-table tbody tr {
    border-bottom: 1px solid #000;
  }
  
  .btn-generate-report,
  .export-btn {
    border: 2px solid currentColor;
  }
}

/* Dark mode support (opcional para futuro) */
@media (prefers-color-scheme: dark) {
  .reports-page {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }
  
  .reports-table-container {
    background: #2d3748;
    border-color: #4a5568;
  }
  
  .reports-table tbody tr:hover {
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  }
}
</style>