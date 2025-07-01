<template>
  <div v-if="visible" class="notification-modal-bg" @click.self="close">
    <div class="notification-modal">
      <h3>Alertas de Bajo Stock</h3>
      <ul v-if="lowStockProducts.length">
        <li v-for="prod in lowStockProducts" :key="prod.id">
          <button class="low-stock-btn improved" @click="goToEditProduct(prod.id)">
            <span class="low-stock-icon">⚠️</span>
            <span>
              <strong>{{ prod.name }}</strong>
              <span class="low-stock-details">
                — Stock: {{ prod.stock }} <span class="min">(mínimo: {{ prod.stock_min }})</span>
              </span>
            </span>
          </button>
        </li>
      </ul>
      <div v-else>
        No hay productos con bajo stock.
      </div>
      <button class="btn-primary" @click="close">Cerrar</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    lowStockProducts: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'edit'],
  methods: {
    close() {
      this.$emit('close');
    },
    goToEditProduct(productId) {
      this.$emit('edit', productId);
    }
  }
};
</script>

<style scoped>
.notification-modal-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(30, 41, 59, 0.55); /* azul oscuro translúcido */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  animation: fadeInBg 0.3s;
}

@keyframes fadeInBg {
  from { opacity: 0; }
  to { opacity: 1; }
}

.notification-modal {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
  padding: 2.5rem 2rem 1.5rem 2rem;
  min-width: 340px;
  max-width: 95vw;
  animation: popIn 0.35s cubic-bezier(.68,-0.55,.27,1.55);
  border: 1.5px solid #e0e7ef;
}

@keyframes popIn {
  0% { transform: scale(0.85); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.notification-modal h3 {
  margin-top: 0;
  margin-bottom: 1.2rem;
  font-size: 1.35rem;
  color: #2563eb;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-align: center;
}

.notification-modal ul {
  list-style: none;
  padding: 0;
  margin: 0 0 1.2rem 0;
}

.low-stock-btn.improved {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
  background: linear-gradient(90deg, #fbbf24 0%, #f87171 100%);
  color: #1e293b;
  border: none;
  border-radius: 12px;
  padding: 0.7rem 1rem;
  margin-bottom: 0.7rem;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.10);
  cursor: pointer;
  transition: transform 0.13s, box-shadow 0.13s, background 0.2s;
}
.low-stock-btn.improved:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 4px 16px rgba(248, 113, 113, 0.18);
  background: linear-gradient(90deg, #f87171 0%, #fbbf24 100%);
}

.low-stock-icon {
  font-size: 1.5rem;
  margin-right: 0.2rem;
  filter: drop-shadow(0 1px 2px #fbbf24cc);
}

.low-stock-details {
  font-size: 0.98rem;
  color: #64748b;
  margin-left: 0.2rem;
}
.min {
  color: #ef4444;
  font-weight: 600;
}

.btn-primary {
  display: block;
  margin: 1.2rem auto 0 auto;
  background: linear-gradient(90deg, #2563eb 0%, #38bdf8 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 2.2rem;
  font-size: 1.08rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.10);
  cursor: pointer;
  transition: background 0.2s, transform 0.13s;
}
.btn-primary:hover {
  background: linear-gradient(90deg, #38bdf8 0%, #2563eb 100%);
  transform: scale(1.04);
}

.notification-modal div {
  text-align: center;
  color: #64748b;
  font-size: 1.05rem;
  margin-top: 1rem;
}
</style>