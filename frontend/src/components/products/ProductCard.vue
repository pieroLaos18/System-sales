<template>
  <div class="product-card" :class="{ 'low-stock': product.low_stock }">
    <div class="card-header">
      <div class="image-container">
        <img
          :src="product.image || defaultImage"
          :alt="product.name"
          class="product-image"
          @error="handleImageError"
        />
        <div class="image-overlay">
          <button @click="$emit('view', product)" class="overlay-btn view">
            <i class="fas fa-eye"></i>
          </button>
          <button @click="$emit('edit', product)" class="overlay-btn edit">
            <i class="fas fa-edit"></i>
          </button>
          <button @click="$emit('delete', product)" class="overlay-btn delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div class="status-badges">
        <span v-if="product.low_stock" class="badge warning">
          <i class="fas fa-exclamation-triangle"></i>
          Stock Bajo
        </span>
        <span v-if="product.activo === 0" class="badge inactive">
          <i class="fas fa-pause-circle"></i>
          Inactivo
        </span>
      </div>
    </div>
    
    <div class="card-body">
      <div class="category-badge">{{ product.category }}</div>
      
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-description">{{ product.description }}</p>
      
      <div class="product-meta">
        <div v-if="product.marca" class="meta-item">
          <i class="fas fa-industry"></i>
          <span>{{ product.marca }}</span>
        </div>
        <div v-if="product.unidad_medida" class="meta-item">
          <i class="fas fa-balance-scale"></i>
          <span>{{ product.unidad_medida }}</span>
        </div>
      </div>
      
      <div class="pricing-section">
        <div class="price-row">
          <span class="price-label">Venta:</span>
          <span class="price-value sale">S/{{ formatPrice(product.price) }}</span>
        </div>
        <div class="price-row">
          <span class="price-label">Compra:</span>
          <span class="price-value purchase">S/{{ formatPrice(product.purchase_price || 0) }}</span>
        </div>
      </div>
      
      <div class="stock-section">
        <div class="stock-info">
          <span class="stock-label">Stock:</span>
          <span class="stock-value" :class="{ 'low': product.low_stock }">
            {{ product.stock }} {{ product.unidad_medida || 'und' }}
          </span>
        </div>
        <div class="stock-limits">
          <span class="limit">Mín: {{ product.stock_min || 0 }}</span>
          <span class="limit">Máx: {{ product.stock_max || '∞' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductCard',
  
  props: {
    product: {
      type: Object,
      required: true
    },
    defaultImage: {
      type: String,
      default: '/src/assets/images/default-product.png'
    }
  },
  
  emits: ['edit', 'delete', 'view'],
  
  methods: {
    formatPrice(price) {
      return Number(price).toFixed(2)
    },
    
    handleImageError(event) {
      event.target.src = this.defaultImage
    }
  }
}
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f1f5f9;
  position: relative;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.product-card.low-stock {
  border-left: 4px solid #f59e0b;
}

.card-header {
  position: relative;
  overflow: hidden;
}

.image-container {
  position: relative;
  height: 200px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .image-overlay {
  opacity: 1;
}

.overlay-btn {
  background: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.overlay-btn.view {
  color: #3b82f6;
}

.overlay-btn.view:hover {
  background: #3b82f6;
  color: white;
  transform: scale(1.1);
}

.overlay-btn.edit {
  color: #667eea;
}

.overlay-btn.edit:hover {
  background: #667eea;
  color: white;
  transform: scale(1.1);
}

.overlay-btn.delete {
  color: #ef4444;
}

.overlay-btn.delete:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1);
}

.status-badges {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.badge {
  background: rgba(255, 255, 255, 0.95);
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.badge.warning {
  background: rgba(245, 158, 11, 0.9);
  color: white;
}

.badge.inactive {
  background: rgba(107, 114, 128, 0.9);
  color: white;
}

.card-body {
  padding: 1.5rem;
}

.category-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.product-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #6b7280;
  background: #f9fafb;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-weight: 500;
}

.meta-item i {
  color: #9ca3af;
  font-size: 0.625rem;
}

.pricing-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.price-row:last-child {
  margin-bottom: 0;
}

.price-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.price-value {
  font-weight: 700;
  font-size: 1rem;
}

.price-value.sale {
  color: #059669;
}

.price-value.purchase {
  color: #dc2626;
}

.stock-section {
  background: #f0f9ff;
  border: 1px solid #e0f2fe;
  border-radius: 12px;
  padding: 1rem;
}

.stock-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stock-label {
  font-size: 0.875rem;
  color: #0369a1;
  font-weight: 600;
}

.stock-value {
  font-weight: 700;
  color: #0c4a6e;
  font-size: 0.95rem;
}

.stock-value.low {
  color: #dc2626;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.stock-limits {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
}

.limit {
  background: rgba(255, 255, 255, 0.8);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-weight: 500;
}
</style>
