<template>
  <div class="dynamic-content sales-page">
    <!-- Cabecera mejorada para Sales.vue -->
    <div class="sales-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <i class="fas fa-cash-register"></i>
          </div>
          <div class="header-text">
            <h1>Gestión de Ventas</h1>
            <p class="header-subtitle">Control completo de todas las transacciones de tu supermercado</p>
            <div class="header-stats">
              <div class="stat-item">
                <span class="stat-number">{{ ventas.length }}</span>
                <span class="stat-label">Total Ventas</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ ventasHoy }}</span>
                <span class="stat-label">Hoy</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">S/ {{ totalVentas }}</span>
                <span class="stat-label">Total Facturado</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button class="btn-new-sale" @click="modalNuevaVenta = true">
            <i class="fas fa-plus"></i>
            <span>Nueva Venta</span>
          </button>
        </div>
      </div>
      
      <div class="filters-section">
        <div class="search-container">
          <div class="search-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="busqueda"
              placeholder="Buscar por cliente, producto o número de venta..."
              class="search-input"
            />
            <button v-if="busqueda" @click="busqueda = ''" class="clear-search">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="filter-container">
          <div class="filter-wrapper">
            <i class="fas fa-calendar filter-icon"></i>
            <input 
              type="date" 
              v-model="filtroFecha" 
              class="date-filter"
              title="Filtrar por fecha"
            />
          </div>
        </div>
        
        <div class="filter-container">
          <div class="filter-wrapper">
            <i class="fas fa-credit-card filter-icon"></i>
            <select v-model="filtroMetodoPago" class="method-select">
              <option value="">Todos los métodos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
            </select>
          </div>
        </div>
        
        <div class="view-controls">
          <button
            class="view-toggle"
            :class="{ active: viewMode === 'cards' }"
            @click="viewMode = 'cards'"
            title="Vista de tarjetas"
          >
            <i class="fas fa-th-large"></i>
          </button>
          <button
            class="view-toggle"
            :class="{ active: viewMode === 'table' }"
            @click="viewMode = 'table'"
            title="Vista de tabla"
          >
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Loader animado -->
    <div v-if="!resumenVentas" class="loader"></div>

    <!-- Mensaje si no hay ventas -->
    <div v-else-if="ventasFiltradas.length === 0" class="no-sales-msg">
      <i class="fas fa-receipt"></i>
      <p>No hay ventas para mostrar.</p>
    </div>

    <!-- Vista de ventas en tarjetas mejorada -->
    <div v-else-if="viewMode === 'cards'" class="sales-grid">
      <div
        v-for="venta in ventasFiltradas"
        :key="venta.id"
        class="sale-card"
        :class="{ 'sale-anulada': venta.anulada }"
      >
        <div class="sale-card-header">
          <div class="sale-number">#{{ venta.id }}</div>
          <div class="sale-status" v-if="venta.anulada">
            <span class="status-badge anulada">
              <i class="fas fa-ban"></i>
              Anulada
            </span>
          </div>
          <div class="sale-status" v-else>
            <span class="status-badge active">
              <i class="fas fa-check-circle"></i>
              Completada
            </span>
          </div>
        </div>
        
        <div class="sale-card-body">
          <div class="sale-info">
            <div class="info-row">
              <i class="fas fa-calendar-alt"></i>
              <span>{{ formatearFecha(venta.fecha) }}</span>
            </div>
            <div class="info-row">
              <i class="fas fa-user"></i>
              <span>{{ venta.cliente }}</span>
            </div>
            <div class="info-row" v-if="venta.metodo_pago">
              <i class="fas fa-credit-card"></i>
              <span>{{ formatearMetodoPago(venta.metodo_pago) }}</span>
            </div>
          </div>
          
          <div class="sale-products">
            <div class="products-count">
              <i class="fas fa-shopping-cart"></i>
              {{ contarProductos(venta.productos) }} producto(s)
            </div>
          </div>
          
          <div class="sale-total">
            <span class="total-label">Total:</span>
            <span class="total-amount">S/ {{ venta.total }}</span>
          </div>
          
          <div class="sale-actions">
            <button @click="abrirDetalle(venta)" class="action-btn view" title="Ver detalle">
              <i class="fas fa-eye"></i>
            </button>
            <button
              v-if="!venta.anulada"
              @click="abrirModalAnulacion(venta)"
              class="action-btn cancel"
              title="Anular venta"
            >
              <i class="fas fa-ban"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista de ventas en tabla modernizada -->
    <div v-else class="sales-table">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Método Pago</th>
            <th>Productos</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="venta in ventasFiltradas"
            :key="venta.id"
            :class="{ 'sale-anulada': venta.anulada }"
          >
            <td>
              <span class="sale-id">#{{ venta.id }}</span>
            </td>
            <td>{{ formatearFecha(venta.fecha) }}</td>
            <td>
              <div class="client-info">
                <i class="fas fa-user"></i>
                {{ venta.cliente }}
              </div>
            </td>
            <td>
              <span class="payment-method">
                <i :class="getPaymentIcon(venta.metodo_pago)"></i>
                {{ formatearMetodoPago(venta.metodo_pago) }}
              </span>
            </td>
            <td>
              <span class="product-count">{{ contarProductos(venta.productos) }}</span>
            </td>
            <td>
              <span class="table-total">S/ {{ venta.total }}</span>
            </td>
            <td>
              <span v-if="venta.anulada" class="table-status anulada">
                <i class="fas fa-ban"></i>
                Anulada
              </span>
              <span v-else class="table-status active">
                <i class="fas fa-check-circle"></i>
                Completada
              </span>
            </td>
            <td>
              <div class="table-actions">
                <button @click="abrirDetalle(venta)" class="table-btn view" title="Ver detalle">
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  v-if="!venta.anulada"
                  @click="abrirModalAnulacion(venta)"
                  class="table-btn cancel"
                  title="Anular venta"
                >
                  <i class="fas fa-ban"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="ventasFiltradas.length === 0">
            <td colspan="8" class="no-data">No hay ventas registradas.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Nueva Venta Modernizado -->
    <transition name="modal" appear>
      <div v-if="modalNuevaVenta" class="modal-overlay" @click.self="modalNuevaVenta = false">
        <div class="modal-container">
          <div class="modal-header">
            <div class="modal-title-section">
              <div class="modal-icon">
                <i class="fas fa-cash-register"></i>
              </div>
              <div>
                <h2>Nueva Venta</h2>
                <p class="modal-subtitle">Registra una nueva transacción en el sistema</p>
              </div>
            </div>
            <button class="modal-close-btn" @click="modalNuevaVenta = false" aria-label="Cerrar modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="registrarVenta" class="sale-form">
              <div class="form-sections">
                <!-- Sección: Información del Cliente -->
                <div class="form-section">
                  <div class="section-header">
                    <h3><i class="fas fa-user"></i> Información del Cliente</h3>
                  </div>
                  <div class="section-content">
                    <div class="form-group">
                      <label>Nombre del cliente</label>
                      <div class="input-wrapper">
                        <i class="fas fa-user input-icon"></i>
                        <input 
                          v-model="nueva.cliente" 
                          type="text"
                          placeholder="Nombre del cliente"
                          class="form-input"
                          required
                        />
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label>Método de pago</label>
                      <div class="input-wrapper">
                        <i class="fas fa-credit-card input-icon"></i>
                        <select v-model="nueva.metodo_pago" class="form-select" required>
                          <option value="" disabled>Selecciona un método</option>
                          <option value="efectivo">💵 Efectivo</option>
                          <option value="tarjeta">💳 Tarjeta</option>
                          <option value="transferencia">🏦 Transferencia</option>
                          <option value="yape">📱 Yape</option>
                          <option value="plin">📲 Plin</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sección: Selección de Productos -->
                <div class="form-section">
                  <div class="section-header">
                    <h3><i class="fas fa-shopping-cart"></i> Productos</h3>
                  </div>
                  <div class="section-content">
                    <div class="form-group">
                      <label>Seleccionar producto</label>
                      <div class="product-selector">
                        <div class="input-wrapper">
                          <i class="fas fa-search input-icon"></i>
                          <select v-model="productoSeleccionado" class="form-select">
                            <option disabled value="">Buscar producto...</option>
                            <option v-for="p in productosDisponibles" :key="p.id" :value="p">
                              {{ p.name }} - S/ {{ p.price }} (Stock: {{ p.stock }})
                            </option>
                          </select>
                        </div>
                        <div class="quantity-input">
                          <label>Cantidad</label>
                          <input 
                            v-model.number="productoTemp.cantidad" 
                            type="number" 
                            min="1" 
                            class="form-input quantity"
                            placeholder="1"
                          />
                        </div>
                        <button type="button" class="add-product-btn" @click="agregarProducto">
                          <i class="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                    
                    <!-- Lista de productos agregados -->
                    <div class="products-list" v-if="nueva.productos.length > 0">
                      <h4>Productos agregados:</h4>
                      <div class="product-items">
                        <div v-for="(prod, idx) in nueva.productos" :key="idx" class="product-item">
                          <div class="product-info">
                            <span class="product-name">
                              {{ productosDisponibles.find(p => p.id === prod.id)?.name || 'Producto' }}
                            </span>
                            <span class="product-details">
                              {{ prod.cantidad }} x S/ {{ prod.precio }}
                            </span>
                          </div>
                          <div class="product-controls">
                            <input 
                              type="number" 
                              v-model.number="prod.cantidad" 
                              min="1" 
                              class="quantity-control"
                            />
                            <span class="product-subtotal">
                              S/ {{ (prod.cantidad * prod.precio).toFixed(2) }}
                            </span>
                            <button type="button" @click="eliminarProducto(idx)" class="remove-btn">
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Resumen de totales -->
              <div class="sale-summary">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <span>S/ {{ subtotal.toFixed(2) }}</span>
                </div>
                <div class="summary-row">
                  <span>IGV ({{ impuestoPorcentaje }}%):</span>
                  <span>S/ {{ impuesto }}</span>
                </div>
                <div class="summary-row total">
                  <span>Total:</span>
                  <span>S/ {{ totalConImpuesto }}</span>
                </div>
              </div>
              
              <!-- Botones de acción -->
              <div class="modal-footer">
                <button type="button" @click="modalNuevaVenta = false" class="btn-secondary">
                  <i class="fas fa-times"></i>
                  Cancelar
                </button>
                <button type="submit" class="btn-primary" :disabled="nueva.productos.length === 0">
                  <i class="fas fa-cash-register"></i>
                  Registrar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Detalle Venta Modernizado -->
    <transition name="modal" appear>
      <div v-if="modalDetalle" class="modal-overlay" @click.self="modalDetalle = false">
        <div class="modal-container detail-modal">
          <div class="modal-header">
            <div class="modal-title-section">
              <div class="modal-icon receipt-icon">
                <i class="fas fa-receipt"></i>
              </div>
              <div>
                <h2>Detalle de Venta</h2>
                <p class="modal-subtitle">Boleta Electrónica N° {{ detalleVenta.id }}</p>
              </div>
            </div>
            <div class="modal-header-actions">
              <button v-if="!detalleVenta.anulada" class="icon-btn print-btn" @click="imprimirBoleta" title="Imprimir boleta">
                <i class="fas fa-print"></i>
              </button>
              <button v-if="!detalleVenta.anulada" class="icon-btn pdf-btn" @click="descargarBoletaPDF" title="Descargar PDF">
                <i class="fas fa-file-pdf"></i>
              </button>
              <button class="modal-close-btn" @click="modalDetalle = false" aria-label="Cerrar modal">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="modal-body">
            <div id="boleta-contenido">
              <!-- Información de la venta -->
              <div class="sale-detail-header">
                <div class="detail-card">
                  <div class="detail-row">
                    <span class="detail-label">
                      <i class="fas fa-calendar"></i>
                      Fecha de Venta:
                    </span>
                    <span class="detail-value">{{ formatearFecha(detalleVenta.fecha) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">
                      <i class="fas fa-user"></i>
                      Cliente:
                    </span>
                    <span class="detail-value">{{ detalleVenta.cliente || 'Cliente no especificado' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">
                      <i class="fas fa-credit-card"></i>
                      Método de Pago:
                    </span>
                    <span class="detail-value">{{ formatearMetodoPago(detalleVenta.metodo_pago) }}</span>
                  </div>
                  <div v-if="detalleVenta.anulada" class="detail-row">
                    <span class="detail-label">
                      <i class="fas fa-ban"></i>
                      Estado:
                    </span>
                    <span class="detail-value status-anulada">ANULADA</span>
                  </div>
                  <div v-if="detalleVenta.anulada && detalleVenta.motivo_anulacion" class="detail-row">
                    <span class="detail-label">
                      <i class="fas fa-comment"></i>
                      Motivo de Anulación:
                    </span>
                    <span class="detail-value">{{ detalleVenta.motivo_anulacion }}</span>
                  </div>
                </div>
              </div>

              <!-- Lista de productos -->
              <div class="products-section">
                <h3 class="section-title">
                  <i class="fas fa-shopping-cart"></i>
                  Productos Vendidos
                </h3>
                <div class="products-table-container">
                  <table class="products-detail-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio Unit.</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="prod in detalleVenta.productos" :key="prod.id">
                        <td class="product-name">
                          <div class="product-info">
                            <span class="name">{{ prod.name }}</span>
                            <span v-if="prod.codigo" class="code">Código: {{ prod.codigo }}</span>
                          </div>
                        </td>
                        <td class="price">S/ {{ (prod.precio || 0).toFixed(2) }}</td>
                        <td class="quantity">
                          <span class="quantity-badge">{{ prod.cantidad }}</span>
                        </td>
                        <td class="subtotal">S/ {{ (prod.cantidad * (prod.precio || 0)).toFixed(2) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Resumen de totales -->
              <div class="total-section">
                <div class="total-breakdown">
                  <div class="total-row">
                    <span>Subtotal:</span>
                    <span>S/ {{ calcularSubtotal(detalleVenta.productos) }}</span>
                  </div>
                  <div class="total-row">
                    <span>IGV (18%):</span>
                    <span>S/ {{ calcularIGV(detalleVenta.productos) }}</span>
                  </div>
                  <div class="total-row final-total">
                    <span>Total:</span>
                    <span>S/ {{ detalleVenta.total }}</span>
                  </div>
                </div>
              </div>

              <!-- Mensaje de agradecimiento -->
              <div v-if="!detalleVenta.anulada" class="thank-you-message">
                <i class="fas fa-heart"></i>
                ¡Gracias por su compra!
              </div>
            </div>
          </div>

          <div class="modal-footer no-print">
            <small v-if="!detalleVenta.anulada" class="print-hint">
              <i class="fas fa-info-circle"></i>
              Utiliza Ctrl+P para imprimir o guarda como boleta-venta-{{ detalleVenta.id }}.pdf
            </small>
            <div class="footer-actions">
              <button v-if="!detalleVenta.anulada" @click="imprimirBoleta" class="btn-secondary">
                <i class="fas fa-print"></i>
                Imprimir
              </button>
              <button v-if="!detalleVenta.anulada" @click="descargarBoletaPDF" class="btn-secondary">
                <i class="fas fa-file-pdf"></i>
                Descargar PDF
              </button>
              <button @click="modalDetalle = false" class="btn-primary">
                <i class="fas fa-check"></i>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Anulación Venta Modernizado -->
    <transition name="modal" appear>
      <div v-if="ventaAAnular" class="modal-overlay" @click.self="cerrarModalAnulacion">
        <div class="modal-container cancel-modal">
          <div class="modal-header">
            <div class="modal-title-section">
              <div class="modal-icon cancel-icon">
                <i class="fas fa-ban"></i>
              </div>
              <div>
                <h2>Anular Venta</h2>
                <p class="modal-subtitle">Venta N° {{ ventaAAnular.id }} - S/ {{ ventaAAnular.total }}</p>
              </div>
            </div>
            <button class="modal-close-btn" @click="cerrarModalAnulacion" aria-label="Cerrar modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="warning-section">
              <div class="warning-card">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="warning-content">
                  <h4>¿Estás seguro de anular esta venta?</h4>
                  <p>Esta acción no se puede deshacer. La venta será marcada como anulada permanentemente.</p>
                </div>
              </div>
            </div>

            <!-- Información de la venta -->
            <div class="sale-info-section">
              <h3 class="section-title">
                <i class="fas fa-info-circle"></i>
                Información de la Venta
              </h3>
              <div class="sale-summary-card">
                <div class="summary-row">
                  <span class="label">Cliente:</span>
                  <span class="value">{{ ventaAAnular.cliente }}</span>
                </div>
                <div class="summary-row">
                  <span class="label">Fecha:</span>
                  <span class="value">{{ formatearFecha(ventaAAnular.fecha) }}</span>
                </div>
                <div class="summary-row">
                  <span class="label">Productos:</span>
                  <span class="value">{{ contarProductos(ventaAAnular.productos) }} artículo(s)</span>
                </div>
                <div class="summary-row total">
                  <span class="label">Total:</span>
                  <span class="value">S/ {{ ventaAAnular.total }}</span>
                </div>
              </div>
            </div>

            <!-- Motivo de anulación -->
            <div class="reason-section">
              <h3 class="section-title">
                <i class="fas fa-comment-alt"></i>
                Motivo de Anulación
              </h3>
              <div class="form-group">
                <label for="motivoAnulacion" class="form-label">
                  Describe el motivo por el cual se anula esta venta: *
                </label>
                <textarea
                  id="motivoAnulacion"
                  v-model="motivoAnulacion"
                  class="form-textarea"
                  placeholder="Ej: Error en el producto seleccionado, cliente solicitó cancelación, problema con el pago..."
                  rows="4"
                  required
                ></textarea>
                <small class="form-help">
                  <i class="fas fa-info-circle"></i>
                  Este motivo quedará registrado en el sistema para futuras referencias.
                </small>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="cerrarModalAnulacion" class="btn-secondary">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button 
              @click="anularVenta" 
              class="btn-danger"
              :disabled="!motivoAnulacion || motivoAnulacion.trim().length < 10"
            >
              <i class="fas fa-ban"></i>
              Confirmar Anulación
            </button>
          </div>
        </div>
      </div>
    </transition>

    <p v-if="!resumenVentas" class="loading-text">Cargando ventas...</p>

    <!-- Notificación -->
    <transition name="notification">
      <div v-if="notificacion.visible" class="notification success">
        <i class="fas fa-check-circle"></i>
        {{ notificacion.mensaje }}
      </div>
    </transition>

    <div class="sales-background-decor"></div>
  </div>
</template>

<script>
// Importa servicios y librerías necesarias
import salesService from '@/services/sales';
import productsService from '@/services/products';
import { jsPDF } from "jspdf";

export default {
  data() {
    return {
      // Filtros y datos de ventas
      busqueda: "",
      ventas: [],
      modalNuevaVenta: false,
      modalDetalle: false,
      detalleVenta: {},
      nueva: {
        cliente: "",
        productos: [],
        total: null,
        metodo_pago: "",
      },
      productoTemp: {
        cantidad: 1,
      },
      productoBuscado: "",
      productosFiltrados: [],
      productoSeleccionado: null,
      notificacion: {
        visible: false,
        mensaje: "",
      },
      impuestoPorcentaje: 18, // IGV
      metodoPago: 'efectivo',
      otrosMetodoPago: '',
      ventaAAnular: null,
      motivoAnulacion: '',
      resumenVentas: null,
      nuevaVenta: {
        cliente: '',
        productos: [],
        subtotal: 0,
        impuesto: 0,
        total: 0,
        metodo_pago: '',
      },
      // Nuevos filtros y configuraciones
      filtroFecha: '',
      filtroMetodoPago: '',
      viewMode: 'cards', // 'cards' o 'table'
      productosDisponibles: [],
    };
  },
  async mounted() {
    // Carga ventas y productos al iniciar
    await this.fetchVentas();
    await this.fetchProductos();
  },
  computed: {
    // Filtra ventas por cliente, producto, fecha y método de pago
    ventasFiltradas() {
      let ventasFiltradas = [...this.ventas];
      
      // Filtro por búsqueda
      if (this.busqueda) {
        const b = this.busqueda.toLowerCase();
        ventasFiltradas = ventasFiltradas.filter(
          v =>
            v.cliente.toLowerCase().includes(b) ||
            v.id.toString().includes(b) ||
            (v.productos && v.productos.some(p => (p.name || '').toLowerCase().includes(b)))
        );
      }
      
      // Filtro por fecha
      if (this.filtroFecha) {
        ventasFiltradas = ventasFiltradas.filter(v => {
          const fechaVenta = v.fecha.split(' ')[0]; // Obtiene solo la fecha sin hora
          return fechaVenta === this.filtroFecha;
        });
      }
      
      // Filtro por método de pago
      if (this.filtroMetodoPago) {
        ventasFiltradas = ventasFiltradas.filter(v => v.metodo_pago === this.filtroMetodoPago);
      }
      
      return ventasFiltradas;
    },
    
    // Calcula subtotal de la venta actual
    subtotal() {
      return this.nueva.productos.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);
    },
    
    // Calcula el impuesto de la venta actual
    impuesto() {
      return (this.subtotal * this.impuestoPorcentaje / 100).toFixed(2);
    },
    
    // Calcula el total con impuesto
    totalConImpuesto() {
      return (parseFloat(this.subtotal) + parseFloat(this.impuesto)).toFixed(2);
    },
    
    // Total de productos en la venta actual
    totalProductos() {
      return this.nueva.productos
        .reduce((sum, p) => sum + (p.cantidad * p.precio), 0)
        .toFixed(2);
    },
    
    // Estadísticas para el header
    ventasHoy() {
      if (!this.ventas || !Array.isArray(this.ventas)) return 0;
      const hoy = new Date().toISOString().split('T')[0];
      return this.ventas.filter(v => v.fecha && v.fecha.startsWith(hoy)).length;
    },
    
    totalVentas() {
      if (!this.ventas || !Array.isArray(this.ventas)) return '0.00';
      return this.ventas
        .filter(v => !v.anulada)
        .reduce((sum, v) => sum + parseFloat(v.total || 0), 0)
        .toFixed(2);
    },
  },
  watch: {
    // Actualiza productos filtrados y seleccionados al buscar
    productoBuscado(val) {
      this.filtrarProductos();
      const prod = this.productosDisponibles.find(p => (p.name || '').toLowerCase() === (val || '').toLowerCase());
      this.productoSeleccionado = prod || null;
    }
  },
  methods: {
    // Obtiene todas las ventas desde el servicio
    async fetchVentas() {
      try {
        const res = await salesService.getAll();
        this.ventas = res.data || [];
      } catch (e) {
        alert('Error al cargar ventas');
      } finally {
        this.resumenVentas = true; // <-- Esto oculta el mensaje
      }
    },
    // Obtiene todos los productos desde el servicio
    async fetchProductos() {
      try {
        const res = await productsService.getAll();
        this.productosDisponibles = res.data;
      } catch (e) {
        alert('Error al cargar productos');
      }
    },
    // Registra una nueva venta y actualiza stock
    async registrarVenta() {
  if (!this.nueva.cliente || this.nueva.productos.length === 0) return;

  // Validar stock antes de registrar
  for (const prod of this.nueva.productos) {
    const productoOriginal = this.productosDisponibles.find(p => p.id === prod.id);
    if (productoOriginal && prod.cantidad > productoOriginal.stock) {
      this.mostrarNotificacion(`No hay suficiente stock para "${productoOriginal.name}". Disponible: ${productoOriginal.stock}`);
      return;
    }
  }

  try {
    const userId = localStorage.getItem('userId');
    const nuevaVenta = {
      cliente: this.nueva.cliente,
      productos: this.nueva.productos,
      user_id: userId,
      metodo_pago: this.nueva.metodo_pago,
      subtotal: parseFloat(this.subtotal),
      impuesto: parseFloat(this.impuesto),
      total: parseFloat(this.totalConImpuesto),
      usuario: localStorage.getItem('userName') || 'Desconocido'
    };

    await salesService.create(nuevaVenta);

    // Actualizar stock local
    for (const prod of this.nueva.productos) {
      const productoOriginal = this.productosDisponibles.find(p => p.id === prod.id);
      if (productoOriginal) {
        const nuevoStock = productoOriginal.stock - prod.cantidad;
        await productsService.update(prod.id, {
          name: productoOriginal.name,
          description: productoOriginal.description,
          price: productoOriginal.price,
          purchase_price: productoOriginal.purchase_price,
          category: productoOriginal.category,
          marca: productoOriginal.marca,
          unidad_medida: productoOriginal.unidad_medida,
          stock: nuevoStock,
          stock_min: productoOriginal.stock_min,
          stock_max: productoOriginal.stock_max,
          image: productoOriginal.image
        });
      }
    }

    this.$root.$emit('actualizarLowStock');
    await this.fetchVentas();
    await this.fetchProductos();

    // Limpiar formularios y cerrar modal
    this.nueva = { cliente: "", productos: [], total: null, metodo_pago: "" };
    this.productoTemp = { cantidad: 1 };
    this.modalNuevaVenta = false;

    this.mostrarNotificacion("Venta registrada correctamente");
  } catch (e) {
    console.error('Error real al registrar venta:', e);
    alert('Error al registrar venta');
  }
},

    // Abre el modal de detalle de venta
    async abrirDetalle(venta) {
      try {
        const res = await salesService.getById(venta.id);
        // Normaliza el campo precio para evitar NaN y errores
        this.detalleVenta = {
          ...res.data,
          productos: (res.data.productos || []).map(p => ({
            ...p,
            precio: parseFloat(p.precio || p.price || 0),
            cantidad: parseInt(p.cantidad || 0),
            name: p.name || 'Producto sin nombre'
          }))
        };
        this.modalDetalle = true;
      } catch (e) {
        console.error('Error al obtener detalle de venta:', e);
        this.mostrarNotificacion('Error al obtener detalle de la venta');
      }
    },
    // Agrega un producto a la venta actual
    agregarProducto() {
      if (this.productoSeleccionado && this.productoTemp.cantidad > 0) {
        // Busca si el producto ya está en la lista
        const idx = this.nueva.productos.findIndex(
          p => p.id === this.productoSeleccionado.id
        );
        if (idx !== -1) {
          // Si ya existe, suma la cantidad
          this.nueva.productos[idx].cantidad += Number(this.productoTemp.cantidad);
        } else {
          // Si no existe, lo agrega
          this.nueva.productos.push({
            id: this.productoSeleccionado.id,
            cantidad: Number(this.productoTemp.cantidad),
            precio: this.productoSeleccionado.price
          });
        }
        this.productoBuscado = "";
        this.productoSeleccionado = null;
        this.productoTemp = { cantidad: 1 };
      }
    },
    // Elimina un producto de la venta actual
    eliminarProducto(idx) {
      this.nueva.productos.splice(idx, 1);
    },
    // Filtra productos disponibles según búsqueda
    filtrarProductos() {
      const b = (this.productoBuscado || '').toLowerCase();
      this.productosFiltrados = this.productosDisponibles.filter(p =>
        (p.name || '').toLowerCase().includes(b)
      );
    },
    // Muestra una notificación personalizada
    mostrarNotificacion(msg) {
      this.notificacion.mensaje = msg;
      this.notificacion.visible = true;
      setTimeout(() => {
        this.notificacion.visible = false;
      }, 3500);
    },
    
    // Formatea la fecha para mostrar
    formatearFecha(fecha) {
      if (!fecha) return 'Fecha no disponible';
      try {
        const date = new Date(fecha);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleDateString('es-PE', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return 'Fecha inválida';
      }
    },
    
    // Formatea el método de pago
    formatearMetodoPago(metodo) {
      if (!metodo) return 'No especificado';
      const metodos = {
        'efectivo': 'Efectivo',
        'tarjeta': 'Tarjeta',
        'transferencia': 'Transferencia',
        'yape': 'Yape',
        'plin': 'Plin'
      };
      return metodos[metodo.toLowerCase()] || metodo;
    },
    
    // Obtiene el icono del método de pago
    getPaymentIcon(metodo) {
      if (!metodo) return 'fas fa-credit-card';
      const icons = {
        'efectivo': 'fas fa-money-bill-wave',
        'tarjeta': 'fas fa-credit-card',
        'transferencia': 'fas fa-university',
        'yape': 'fas fa-mobile-alt',
        'plin': 'fas fa-mobile-alt'
      };
      return icons[metodo.toLowerCase()] || 'fas fa-credit-card';
    },
    
    // Cuenta el número total de productos en una venta
    contarProductos(productos) {
      if (!productos || !Array.isArray(productos)) return 0;
      return productos.reduce((total, prod) => total + (prod.cantidad || 0), 0);
    },
    
    // Calcula el subtotal de los productos
    calcularSubtotal(productos) {
      if (!productos || !Array.isArray(productos)) return '0.00';
      const subtotal = productos.reduce((total, prod) => {
        const precio = parseFloat(prod.precio || prod.price || 0);
        const cantidad = parseInt(prod.cantidad || 0);
        return total + (cantidad * precio);
      }, 0);
      return subtotal.toFixed(2);
    },
    
    // Calcula el IGV (18%)
    calcularIGV(productos) {
      if (!productos || !Array.isArray(productos)) return '0.00';
      const subtotal = parseFloat(this.calcularSubtotal(productos));
      const igv = subtotal * 0.18;
      return igv.toFixed(2);
    },
    // Abre el modal para anular una venta
    abrirModalAnulacion(venta) {
      this.ventaAAnular = venta;
      this.motivoAnulacion = '';
    },
    // Cierra el modal de anulación
    cerrarModalAnulacion() {
      this.ventaAAnular = null;
      this.motivoAnulacion = '';
    },
    // Anula una venta y actualiza la lista
    async anularVenta() {
      if (!this.motivoAnulacion.trim()) {
        this.mostrarNotificacion('Debe ingresar un motivo de anulación.');
        return;
      }
      try {
        await salesService.anular(this.ventaAAnular.id, { motivo: this.motivoAnulacion });
        this.mostrarNotificacion('Venta anulada correctamente');
        await this.fetchVentas();
        this.$emit('actualizar-dashboard');
        this.cerrarModalAnulacion();
      } catch (e) {
        this.mostrarNotificacion('Error al anular venta');
      }
    },
    // Imprime la boleta de la venta
    imprimirBoleta() {
      const contenido = document.getElementById('boleta-contenido').innerHTML;
      const ventana = window.open('', '', 'width=800,height=600');
      ventana.document.write(`
        <html>
          <head>
            <title>Boleta Electrónica</title>
            <link rel="stylesheet" href="/src/assets/css/sales.css">
            <style>
              body { font-family: Arial, sans-serif; margin: 2rem; }
              table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background: #f0f0f0; }
            </style>
          </head>
          <body>
            ${contenido}
          </body>
        </html>
      `);
      ventana.document.close();
      ventana.focus();
      ventana.print();
    },
    // Descarga la boleta de la venta como PDF
    descargarBoletaPDF() {
      const doc = new jsPDF();
      const venta = this.detalleVenta;
      let y = 15;

      doc.setFontSize(18);
      doc.text("Boleta Electrónica", 105, y, { align: "center" });
      y += 10;
      doc.setFontSize(12);
      doc.text(`N° ${venta.id}`, 105, y, { align: "center" });
      y += 10;
      doc.text(`Fecha: ${venta.fecha}`, 15, y);
      y += 7;
      doc.text(`Cliente: ${venta.cliente}`, 15, y);
      y += 10;

      doc.text("Productos:", 15, y);
      y += 7;
      venta.productos.forEach((prod) => {
        doc.text(
          `- ${prod.name} (x${prod.cantidad}) - S/ ${(prod.cantidad * prod.precio).toFixed(2)}`,
          20,
          y
        );
        y += 7;
      });

      y += 5;
      doc.setFontSize(14);
      doc.text(`Total: S/ ${venta.total}`, 15, y);

      y += 15;
      doc.setFontSize(12);
      doc.text("¡Gracias por su compra!", 105, y, { align: "center" });

      // Nombre del archivo personalizado
      doc.save(`boleta-venta-${venta.id}.pdf`);
    },
  },
};
</script>

<style scoped>
/* Fondo y contenedor principal */
.sales-page {
  padding: min(2.5rem, 4vw) min(1.5rem, 3vw) min(6rem, 8vw) min(1.5rem, 3vw);
  font-family: 'Inter', Arial, sans-serif;
  background: #f6f7fb;
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
}

/* Cabecera mejorada */
.sales-header {
  background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
  border-radius: 24px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(67, 206, 162, 0.3);
}

.sales-header::before {
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

.btn-new-sale {
  background: white;
  color: #43cea2;
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

.btn-new-sale:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  background: #f8fafc;
}

.filters-section {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.search-container {
  flex: 1;
  min-width: 300px;
  width: 100%;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.7);
  z-index: 1;
}

.search-input {
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

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.clear-search:hover {
  background: rgba(255, 255, 255, 0.3);
}

.filter-container {
  min-width: 180px;
  width: auto;
}

.filter-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-icon {
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.7);
  z-index: 1;
}

.date-filter,
.method-select {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: white;
  font-size: 0.95rem;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.method-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1.25em 1.25em;
  padding-right: 3rem;
}

.date-filter:focus,
.method-select:focus {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.method-select option {
  background: #43cea2;
  color: white;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.25rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.view-toggle {
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 0.625rem;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-toggle:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.view-toggle.active {
  background: white;
  color: #43cea2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Loader y mensaje */
.loader {
  width: 48px;
  height: 48px;
  border: 5px solid #ececec;
  border-top: 5px solid #43cea2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 2rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-sales-msg {
  color: #8a94a6;
  text-align: center;
  font-size: 1.1rem;
  margin: 3rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-sales-msg i {
  font-size: 3rem;
  color: #d1d5db;
}

/* Vista de tarjetas de ventas */
.sales-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  max-height: calc(100vh - 400px);
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.5rem;
}

.sale-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f1f5f9;
  position: relative;
}

.sale-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: #e2e8f0;
}

.sale-card.sale-anulada {
  opacity: 0.7;
  border-left: 4px solid #ef4444;
}

.sale-card-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sale-number {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
}

.sale-status {
  position: relative;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.9);
  color: white;
}

.status-badge.anulada {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.sale-card-body {
  padding: 1.5rem;
}

.sale-info {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.info-row i {
  color: #43cea2;
  width: 16px;
}

.sale-products {
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.products-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #374151;
  font-weight: 500;
}

.products-count i {
  color: #43cea2;
}

.sale-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
  border-radius: 12px;
  color: white;
}

.total-label {
  font-size: 1rem;
  font-weight: 500;
}

.total-amount {
  font-size: 1.25rem;
  font-weight: 700;
}

.sale-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.action-btn.view {
  color: #43cea2;
  border-color: #43cea2;
}

.action-btn.view:hover {
  background: #43cea2;
  color: white;
  transform: scale(1.05);
}

.action-btn.cancel {
  color: #ef4444;
  border-color: #ef4444;
}

.action-btn.cancel:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.05);
}

/* Vista de tabla modernizada */
.sales-table {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(30, 41, 59, 0.07);
  padding: 2rem 1rem 2rem 1rem;
  max-width: 100%;
  margin: 0 auto 2.5rem auto;
  border: 1px solid #ececec;
  overflow-x: auto;
  max-height: calc(100vh - 400px);
  overflow-y: auto;
}

.sales-table table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: transparent;
}

.sales-table th, .sales-table td {
  padding: 1rem 0.7rem;
  text-align: left;
  font-size: 0.95rem;
}

.sales-table th {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.875rem;
}

.sales-table tbody tr {
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.sales-table tbody tr:hover {
  background: #f8fafc;
}

.sales-table tbody tr.sale-anulada {
  opacity: 0.6;
  background: #fef2f2;
}

.sales-table td {
  color: #374151;
  vertical-align: middle;
}

.sale-id {
  font-weight: 600;
  color: #43cea2;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.client-info i {
  color: #6b7280;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.payment-method i {
  color: #43cea2;
}

.product-count {
  background: #f0f9ff;
  color: #0369a1;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

.table-total {
  font-weight: 700;
  color: #059669;
  font-size: 1rem;
}

.table-status {
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: fit-content;
}

.table-status.active {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.table-status.anulada {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.table-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.table-btn.view {
  color: #43cea2;
}

.table-btn.view:hover {
  background: #ecfdf5;
  border-color: #43cea2;
}

.table-btn.cancel {
  color: #ef4444;
}

.table-btn.cancel:hover {
  background: #fef2f2;
  border-color: #ef4444;
}

.no-data {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 2rem;
}

/* --- MODAL MEJORADO --- */
.modal {
  &-enter-active, &-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  &-enter-from, &-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.modal-container {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-header {
  background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
  color: white;
  padding: 2rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-icon {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.modal-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
}

.modal-subtitle {
  font-size: 0.95rem;
  margin: 0.25rem 0 0 0;
  opacity: 0.9;
  font-weight: 400;
}

.modal-close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.1rem;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.modal-body {
  padding: 0;
  overflow-y: auto;
  max-height: calc(90vh - 200px);
}

.sale-form {
  padding: 0;
}

.form-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.form-section {
  border-right: 1px solid #e2e8f0;
  &:nth-child(even) {
    border-right: none;
  }
}

.section-header {
  background: #f8fafc;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.section-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-header h3 i {
  color: #43cea2;
  font-size: 1.1rem;
}

.section-content {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  letter-spacing: 0.025em;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
  font-size: 1rem;
  z-index: 1;
  pointer-events: none;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #111827;
  background: white;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus {
  border-color: #43cea2;
  box-shadow: 0 0 0 3px rgba(67, 206, 162, 0.1);
  transform: translateY(-1px);
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1.25em 1.25em;
  padding-right: 3rem;
}

.product-selector {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: end;
}

.quantity-input label {
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.form-input.quantity {
  padding: 0.875rem 1rem;
  width: 80px;
}

.add-product-btn {
  background: #43cea2;
  color: white;
  border: none;
  border-radius: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.add-product-btn:hover {
  background: #369870;
  transform: scale(1.05);
}

.products-list h4 {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.product-items {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.product-item:last-child {
  border-bottom: none;
}

.product-info {
  flex: 1;
}

.product-name {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.product-details {
  font-size: 0.875rem;
  color: #6b7280;
}

.product-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-control {
  width: 60px;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
  font-size: 0.875rem;
}

.product-subtotal {
  font-weight: 600;
  color: #059669;
  min-width: 80px;
  text-align: right;
}

.remove-btn {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #ef4444;
  color: white;
}

.sale-summary {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.summary-row.total {
  border-top: 1px solid #d1d5db;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #374151;
}

.modal-footer {
  background: #f8fafc;
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #43cea2 0%, #369870 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(67, 206, 162, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(67, 206, 162, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

/* Notificación */
.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  z-index: 1001;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 400px;
}

.notification.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.notification.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
}

.notification i {
  font-size: 1.2rem;
  flex-shrink: 0;
}

/* Transiciones para notificaciones */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-leave-to {
     opacity: 0;
  transform: translateX(100%) scale(0.9);
}

/* Decoración de fondo */
.sales-background-decor {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
  background: 
    radial-gradient(circle at 20% 80%, rgba(67, 206, 162, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(24, 90, 157, 0.05) 0%, transparent 50%);
}

/* Loading text */
.loading-text {
  color: #6b7280;
  text-align: center;
  font-size: 1.1rem;
  margin: 2rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.loading-text::before {
  content: '';
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #43cea2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Elementos faltantes para completar el diseño */
.detail-modal .modal-container {
  max-width: 900px;
}

.cancel-modal .modal-container {
  max-width: 600px;
}

.receipt-icon {
  background: rgba(67, 206, 162, 0.15);
}

.cancel-icon {
  background: rgba(239, 68, 68, 0.15);
}

.icon-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.print-btn:hover {
  background: rgba(59, 130, 246, 0.2);
}

.pdf-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.print-hint {
  color: #6b7280;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Estilos para elementos específicos de ventas */
.sale-detail-header {
  margin-bottom: 2rem;
}

.detail-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-label i {
  color: #43cea2;
  width: 16px;
}

.detail-value {
  font-weight: 500;
  color: #1f2937;
}

.status-anulada {
  color: #dc2626;
  font-weight: 700;
}

.products-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: #43cea2;
}

.products-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.products-detail-table {
  width: 100%;
  border-collapse: collapse;
}

.products-detail-table th {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.products-detail-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #374151;
}

.products-detail-table tbody tr:last-child td {
  border-bottom: none;
}

.product-name .name {
  font-weight: 600;
  color: #1f2937;
}

.product-name .code {
  font-size: 0.8rem;
  color: #6b7280;
  font-style: italic;
}

.price,
.quantity,
.subtotal {
  font-weight: 500;
  text-align: right;
}

.quantity-badge {
  background: #f0f9ff;
  color: #0369a1;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-block;
}

.total-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.total-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  color: #374151;
}

.total-row.final-total {
  border-top: 2px solid #e2e8f0;
  padding-top: 0.75rem;
  margin-top: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.thank-you-message {
  text-align: center;
  color: #059669;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  border-radius: 16px;
  border: 1px solid #bbf7d0;
}

.thank-you-message i {
  color: #ef4444;
  font-size: 1.25rem;
}

/* Estilos para modal de anulación */
.warning-section {
  margin-bottom: 2rem;
}

.warning-card {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.warning-card i {
  color: #dc2626;
  font-size: 2.5rem;
  flex-shrink: 0;
}

.warning-content h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #7f1d1d;
  margin: 0 0 0.5rem 0;
}

.warning-content p {
  color: #991b1b;
  margin: 0;
  line-height: 1.5;
}

.sale-info-section {
  margin-bottom: 2rem;
}

.sale-summary-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.sale-summary-card .summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.sale-summary-card .summary-row:last-child {
  border-bottom: none;
}

.sale-summary-card .summary-row.total {
  border-top: 2px solid #e2e8f0;
  padding-top: 1rem;
  margin-top: 0.5rem;
  font-weight: 700;
}

.sale-summary-card .label {
  font-weight: 600;
  color: #374151;
}

.sale-summary-card .value {
  font-weight: 500;
  color: #1f2937;
}

.reason-section {
  margin-bottom: 2rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}
</style>

<style>
/* Estilos personalizados para scrollbar */
.sales-page::-webkit-scrollbar,
.sales-grid::-webkit-scrollbar,
.sales-table::-webkit-scrollbar {
  width: 8px;
}

.sales-page::-webkit-scrollbar-track,
.sales-grid::-webkit-scrollbar-track,
.sales-table::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.sales-page::-webkit-scrollbar-thumb,
.sales-grid::-webkit-scrollbar-thumb,
.sales-table::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
  border-radius: 10px;
  transition: background 0.3s ease;
}

.sales-page::-webkit-scrollbar-thumb:hover,
.sales-grid::-webkit-scrollbar-thumb:hover,
.sales-table::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #10b981 0%, #1e40af 100%);
}

/* Para Firefox */
.sales-page,
.sales-grid,
.sales-table {
  scrollbar-width: thin;
  scrollbar-color: #43cea2 #f1f5f9;
}

/* Responsive mejorado */
@media (max-width: 1200px) {
  .sales-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .header-stats {
    gap: 1.5rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .filters-section {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .search-container {
    min-width: 250px;
  }
  
  .filter-container {
    min-width: 180px;
  }
}

@media (max-width: 768px) {
  .sales-page {
    padding: 1rem 1rem 4rem 1rem;
  }
  
  .sales-header {
    padding: 2rem 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .header-left {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    width: 100%;
  }
  
  .header-text h1 {
    font-size: 2rem;
  }
  
  .header-stats {
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .stat-item {
    min-width: 120px;
    text-align: center;
  }
  
  .filters-section {
    flex-direction: column;
    gap: 1rem;
  }
  
  .search-container,
  .filter-container {
    min-width: unset;
    width: 100%;
  }
  
  .view-controls {
    align-self: center;
  }
  
  .sales-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .sale-card {
    margin-bottom: 0;
  }
  
  .sale-card-body {
    padding: 1rem;
  }
  
  .sale-actions {
    justify-content: center;
    gap: 0.75rem;
  }
  
  .action-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  /* Modal responsivo */
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-header {
    padding: 1.5rem;
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .modal-title-section {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    min-width: 0;
  }
  
  /* Tabla responsiva */
  .sales-table {
    padding: 1rem 0.5rem;
    font-size: 0.875rem;
    overflow-x: auto;
  }
  
  .sales-table table {
    min-width: 800px;
  }
  
  .sales-table th,
  .sales-table td {
    padding: 0.5rem 0.25rem;
    font-size: 0.8rem;
  }
  
  /* Formulario de nueva venta responsivo */
  .new-sale-form {
    gap: 1rem;
  }
  
  .form-sections {
    grid-template-columns: 1fr;
  }
  
  .form-section {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .form-section:last-child {
    border-bottom: none;
  }
  
  .section-content {
    padding: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  /* Detalle de venta responsivo */
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .products-detail-table {
    font-size: 0.85rem;
  }
  
  .products-detail-table th,
  .products-detail-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .total-breakdown {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .sales-page {
    padding: 1rem 0.5rem 3.5rem 0.5rem;
  }
  
  .sales-header {
    padding: 1.5rem 1rem;
  }
  
  .header-text h1 {
    font-size: 1.75rem;
  }
  
  .header-subtitle {
    font-size: 1rem;
  }
  
  .btn-new-sale {
    padding: 0.875rem 1.25rem;
    font-size: 0.9rem;
  }
  
  .search-input,
  .date-filter,
  .method-select {
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    font-size: 0.9rem;
  }
  
  .sale-card {
    border-radius: 16px;
  }
  
  .sale-card-header {
    padding: 1rem;
  }
  
  .sale-number {
    font-size: 1rem;
  }
  
  .status-badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .info-row {
    font-size: 0.85rem;
  }
  
  .total-amount {
    font-size: 1.1rem;
  }
  
  /* Modal ultra pequeño */
  .modal-container {
    width: 95vw;
    margin: 0.5rem;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-header h2 {
    font-size: 1.5rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .section-header {
    padding: 1rem;
  }
  
  .section-content {
    padding: 1rem;
  }
  
  /* Tabla ultra pequeña */
  .products-detail-table {
    font-size: 0.8rem;
  }
  
  .products-detail-table th,
  .products-detail-table td {
    padding: 0.5rem 0.25rem;
  }
  
  /* Notificaciones responsivas */
  .notification {
    max-width: calc(100vw - 2rem);
    margin: 0 1rem;
    font-size: 0.9rem;
  }
  
  /* Botones de acción más grandes en móvil */
  .action-btn {
    width: 44px;
    height: 44px;
    font-size: 1.1rem;
  }
  
  /* Espaciado mejorado */
  .stat-item {
    min-width: 100px;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
  
  .stat-label {
    font-size: 0.75rem;
  }
}

/* Mejoras adicionales para tablets en orientación landscape */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
  .sales-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
  }
  
  .header-content {
    flex-direction: row;
  }
  
  .header-left {
    flex-direction: row;
  }
  
  .filters-section {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .search-container {
    flex: 1;
    min-width: 200px;
  }
  
  .filter-container {
    min-width: 150px;
  }
}

/* Dispositivos muy pequeños */
@media (max-width: 360px) {
  .sales-page {
    padding: 0.75rem 0.25rem 3rem 0.25rem;
  }
  
  .sales-header {
    padding: 1rem 0.75rem;
  }
}
</style>