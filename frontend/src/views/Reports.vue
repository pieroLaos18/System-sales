<style src="@/assets/css/reports.css"></style>

<template>
  <div class="dynamic-content reports-modern">
    <div class="reports-background-decor"></div>
    <div class="reports-header-card glass">
      <div class="reports-header-title">
        <div class="reports-header-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <div>
          <h1 class="reports-title">Reportes</h1>
          <p class="reports-desc">Visualización y exportación de reportes de ventas.</p>
        </div>
      </div>
    </div>
    <div class="filters reports-filters-card">
      <div class="filters-row">
        <label>
          <span>Desde:</span>
          <input type="date" v-model="fromDate" />
        </label>
        <label>
          <span>Hasta:</span>
          <input type="date" v-model="toDate" />
        </label>
        <button class="btn-primary" @click="fetchReport">
          <i class="fas fa-search"></i> Generar
        </button>
      </div>
      <div class="filters-row export-row">
        <button class="btn-secondary" @click="exportCSV" :disabled="!reportData.length">
          <i class="fas fa-file-csv"></i> CSV
        </button>
        <button class="btn-success" @click="exportExcel" :disabled="!reportData.length">
          <i class="fas fa-file-excel"></i> Excel
        </button>
        <button class="btn-warning" @click="exportPDF" :disabled="!reportData.length">
          <i class="fas fa-file-pdf"></i> PDF
        </button>
      </div>
    </div>
    <div class="reports-table-section">
      <table class="reports-table" v-if="reportData.length">
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
          <tr v-for="item in reportData" :key="item.id">
            <td>{{ item.date }}</td>
            <td>{{ item.product }}</td>
            <td>{{ item.quantity }}</td>
            <td>
              <span class="total-badge">S/ {{ item.total }}</span>
            </td>
            <td>{{ item.usuario }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="no-data-text">No hay datos para mostrar.</p>
    </div>
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
      reportData: []
    }
  },
  methods: {
    // Obtiene los datos del reporte desde la API
    async fetchReport() {
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
        if (!response.ok) throw new Error('Error al obtener los datos');
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
      } catch (error) {
        alert('No se pudieron cargar los reportes.');
        this.reportData = [];
      }
    },
    // Exporta el reporte a CSV
    exportCSV() {
      const headers = ['Fecha', 'Producto', 'Cantidad', 'Total', 'Usuario'];
      const rows = this.reportData.map(item => [
        item.date, item.product, item.quantity, item.total, item.usuario
      ]);
      let csvContent = headers.join(',') + '\n' +
        rows.map(e => e.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'reporte.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    // Exporta el reporte a Excel

exportExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Reporte");

  // Encabezados
  worksheet.columns = [
    { header: 'Fecha', key: 'date', width: 20 },
    { header: 'Producto', key: 'product', width: 25 },
    { header: 'Cantidad', key: 'quantity', width: 10 },
    { header: 'Total', key: 'total', width: 15 },
    { header: 'Usuario', key: 'usuario', width: 25 },
  ];

  // Agregar los datos
  this.reportData.forEach(item => {
    worksheet.addRow({
      date: item.date,
      product: item.product,
      quantity: item.quantity,
      total: item.total,
      usuario: item.usuario
    });
  });

  // Exportar como archivo .xlsx
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  });
}

  }
}
</script>