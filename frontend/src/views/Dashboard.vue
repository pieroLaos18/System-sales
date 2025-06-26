<template>
  <div class="dashboard">
    <section class="dashboard-summary">
      <div class="summary-card">
        <h3>Ventas Hoy</h3>
        <p>{{ resumenVentas.hoy }}</p>
      </div>
      <div class="summary-card">
        <h3>Ventas Mes</h3>
        <p>{{ resumenVentas.mes }}</p>
      </div>
      <div class="summary-card">
        <h3>Usuarios Activos</h3>
        <p>{{ resumenUsuarios.activos }}</p>
      </div>
    </section>

    <section class="dashboard-charts">
      <h3>Métodos de Pago</h3>
      <div class="chart-wrapper" v-if="chartDataMetodosPago.datasets[0].data.length">
        <Pie :data="chartDataMetodosPago" />
      </div>
      <p v-else>No hay datos de métodos de pago</p>

      <h3>Ventas por Día</h3>
      <div class="chart-wrapper" v-if="chartDataVentasPorDia.datasets[0].data.length">
        <Bar :data="chartDataVentasPorDia" />
      </div>
      <p v-else>No hay datos de ventas por día</p>
    </section>
  </div>
</template>

<script>
import api from '@/services/api';
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

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

export default {
  name: 'Dashboard',
  components: { Pie, Bar },
  data() {
    return {
      resumenVentas: { hoy: 0, mes: 0 },
      resumenUsuarios: { activos: 0 },
      metodosPago: [],
      ventasPorDia: []
    };
  },
  computed: {
    chartDataMetodosPago() {
      return {
        labels: this.metodosPago.map(m => m.metodo_pago || 'Otro'),
        datasets: [{
          data: this.metodosPago.map(m => Number(m.total)),
          backgroundColor: ['#4f8cff', '#ffb347', '#ff6961', '#77dd77', '#f49ac2', '#a890fe', '#ffd700']
        }]
      };
    },
    chartDataVentasPorDia() {
      return {
        labels: this.ventasPorDia.map(v => v.dia),
        datasets: [{
          label: 'Total Ventas',
          data: this.ventasPorDia.map(v => v.total),
          backgroundColor: '#4f8cff',
          borderRadius: 6
        }]
      };
    }
  },
  async mounted() {
    try {
      const [resumen, usuarios, metodos, ventasDia] = await Promise.all([
        api.get('/sales/resumen'),
        api.get('/users/activos'),
        api.get('/sales/metodos-pago'),
        api.get('/sales/ventas-por-dia')
      ]);
      this.resumenVentas = resumen.data;
      this.resumenUsuarios = usuarios.data;
      this.metodosPago = metodos.data;
      this.ventasPorDia = ventasDia.data;
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    }
  }
};
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.dashboard-summary {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: #f0f4ff;
  padding: 1rem;
  flex: 1;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.chart-wrapper {
  max-width: 600px;
  margin: 2rem auto;
}
</style>
