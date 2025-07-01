<template>
  <div class="dynamic-content products-page">
    <!-- Cabecera mejorada para Products.vue -->
    <div class="products-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <i class="fas fa-boxes"></i>
          </div>
          <div class="header-text">
            <h1>Gestión de Productos</h1>
            <p class="header-subtitle">Control completo de tu inventario y catálogo de productos</p>
            <div class="header-stats">
              <div class="stat-item">
                <span class="stat-number">{{ products.length }}</span>
                <span class="stat-label">Total</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ products.filter(p => p.low_stock).length }}</span>
                <span class="stat-label">Stock Bajo</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ categories.length }}</span>
                <span class="stat-label">Categorías</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button class="btn-new-product" @click="openProductModal()">
            <i class="fas fa-plus"></i>
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>
      
      <div class="filters-section">
        <div class="search-container">
          <div class="search-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Buscar productos por nombre..."
              class="search-input"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="filter-container">
          <div class="filter-wrapper">
            <i class="fas fa-filter filter-icon"></i>
            <select v-model="selectedCategory" class="category-select">
              <option value="">Todas las categorías</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
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
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
            title="Vista de tabla"
          >
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Loader animado -->
    <div v-if="loading" class="loader"></div>

    <!-- Mensaje si no hay productos -->
    <div v-else-if="filteredProducts.length === 0" class="no-products-msg">
      <i class="fas fa-box-open"></i>
      <p>No hay productos para mostrar.</p>
    </div>

    <!-- Vista de productos en tarjetas mejorada -->
    <div v-else-if="viewMode === 'cards'" class="products-grid">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-card"
        :class="{ 'low-stock': product.low_stock }"
      >
        <div class="product-card-header">
          <div class="product-image-container">
            <img
              :src="product.image || defaultProductImg"
              alt="Imagen del producto"
              class="product-image"
            />
            <div class="product-overlay">
              <button @click="editProduct(product)" class="overlay-btn edit" title="Editar producto">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteProduct(product.id)" class="overlay-btn delete" title="Eliminar producto">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="product-status" v-if="product.low_stock">
            <span class="status-badge low-stock">
              <i class="fas fa-exclamation-triangle"></i>
              Stock Bajo
            </span>
          </div>
          <div class="product-status" v-else-if="product.activo === 0">
            <span class="status-badge inactive">
              <i class="fas fa-pause-circle"></i>
              Suspendido
            </span>
          </div>
        </div>
        
        <div class="product-card-body">
          <div class="product-category-badge">{{ product.category }}</div>
          <h3 class="product-title">{{ product.name }}</h3>
          <p class="product-description">{{ product.description }}</p>
          
          <div class="product-details">
            <div class="product-brand" v-if="product.marca">
              <i class="fas fa-industry"></i>
              {{ product.marca }}
            </div>
            <div class="product-unit" v-if="product.unidad_medida">
              <i class="fas fa-balance-scale"></i>
              {{ product.unidad_medida }}
            </div>
          </div>
          
          <div class="product-pricing">
            <div class="price-row">
              <span class="price-label">Venta:</span>
              <span class="price-value sale">S/{{ product.price }}</span>
            </div>
            <div class="price-row">
              <span class="price-label">Compra:</span>
              <span class="price-value purchase">S/{{ product.purchase_price || 0 }}</span>
            </div>
          </div>
          
          <div class="product-stock-info">
            <div class="stock-row">
              <span class="stock-label">Stock actual:</span>
              <span class="stock-value" :class="{ 'low': product.low_stock }">
                {{ product.stock }}
              </span>
            </div>
            <div class="stock-limits">
              <span class="stock-min">Mín: {{ product.stock_min || 0 }}</span>
              <span class="stock-max">Máx: {{ product.stock_max || '∞' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista de productos en tabla -->
    <div v-else class="products-table">
      <table>
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>Stock Mín</th>
            <th>Stock Máx</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in filteredProducts"
            :key="product.id"
            :class="{ 'low-stock': product.low_stock }"
          >
            <td>
              <img :src="product.image || defaultProductImg" alt="Imagen" class="table-product-image" />
            </td>
            <td>{{ product.name }}</td>
            <td>{{ product.description }}</td>
            <td>S/{{ product.price }}</td>
            <td>{{ product.category }}</td>
            <td>
              {{ product.stock }}
              <span v-if="product.low_stock" class="stock-alert" title="Stock bajo">⚠️ Bajo stock</span>
            </td>
            <td>{{ product.stock_min }}</td>
            <td>{{ product.stock_max }}</td>
            <td>
              <button @click="editProduct(product)" class="edit-btn" title="Editar">
                <i class="fas fa-pen"></i>
              </button>
              <button @click="deleteProduct(product.id)" class="delete-btn" title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal mejorado para agregar/editar producto -->
    <transition name="modal" appear>
      <div v-if="showProductModal" class="modal-overlay" @click.self="closeProductModal">
        <div class="modal-container">
          <div class="modal-header">
            <div class="modal-title-section">
              <div class="modal-icon">
                <i class="fas fa-cube"></i>
              </div>
              <div>
                <h2>{{ editingProduct ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
                <p class="modal-subtitle">
                  {{ editingProduct ? 'Modifica la información del producto' : 'Completa los datos del nuevo producto' }}
                </p>
              </div>
            </div>
            <button class="modal-close-btn" @click="closeProductModal" aria-label="Cerrar modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="saveProduct" class="product-form">
              <div class="form-sections">
                <!-- Sección: Información Básica -->
                <div class="form-section">
                  <div class="section-header">
                    <h3><i class="fas fa-info-circle"></i> Información Básica</h3>
                  </div>
                  <div class="section-content">
                    <div class="form-group">
                      <label>Nombre del producto</label>
                      <div class="input-wrapper">
                        <i class="fas fa-tag input-icon"></i>
                        <input 
                          v-model="form.name" 
                          type="text"
                          placeholder="Ej: iPhone 14 Pro Max"
                          class="form-input"
                          required
                        />
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label>Descripción</label>
                      <div class="input-wrapper">
                        <i class="fas fa-align-left input-icon"></i>
                        <textarea 
                          v-model="form.description" 
                          placeholder="Descripción detallada del producto..."
                          class="form-textarea"
                          rows="3"
                        ></textarea>
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label>Categoría</label>
                      <div class="input-wrapper">
                        <i class="fas fa-folder input-icon"></i>
                        <input 
                          v-model="form.category"
                          type="text"
                          placeholder="Ej: Electrónicos, Ropa, Hogar..."
                          class="form-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sección: Precios y Marca -->
                <div class="form-section">
                  <div class="section-header">
                    <h3><i class="fas fa-dollar-sign"></i> Precios y Marca</h3>
                  </div>
                  <div class="section-content">
                    <div class="form-row">
                      <div class="form-group">
                        <label>Precio de venta</label>
                        <div class="input-wrapper">
                          <i class="fas fa-money-bill-wave input-icon"></i>
                          <input 
                            v-model.number="form.price" 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            placeholder="0.00"
                            class="form-input"
                            required
                          />
                          <span class="input-suffix">S/</span>
                        </div>
                      </div>
                      
                      <div class="form-group">
                        <label>Precio de compra</label>
                        <div class="input-wrapper">
                          <i class="fas fa-shopping-cart input-icon"></i>
                          <input 
                            v-model.number="form.purchasePrice" 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            placeholder="0.00"
                            class="form-input"
                            required
                          />
                          <span class="input-suffix">S/</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="form-row">
                      <div class="form-group">
                        <label>Marca</label>
                        <div class="input-wrapper">
                          <i class="fas fa-industry input-icon"></i>
                          <input 
                            v-model="form.marca" 
                            type="text"
                            placeholder="Ej: Apple, Samsung, Nike..."
                            class="form-input"
                          />
                        </div>
                      </div>
                      
                      <div class="form-group">
                        <label>Unidad de medida</label>
                        <div class="input-wrapper">
                          <i class="fas fa-balance-scale input-icon"></i>
                          <select v-model="form.unidad_medida" class="form-select">
                            <option value="">Seleccionar unidad</option>
                            <option value="unidad">Unidad (und)</option>
                            <option value="kg">Kilogramo (kg)</option>
                            <option value="g">Gramo (g)</option>
                            <option value="lb">Libra (lb)</option>
                            <option value="oz">Onza (oz)</option>
                            <option value="lt">Litro (lt)</option>
                            <option value="ml">Mililitro (ml)</option>
                            <option value="gal">Galón (gal)</option>
                            <option value="m">Metro (m)</option>
                            <option value="cm">Centímetro (cm)</option>
                            <option value="mm">Milímetro (mm)</option>
                            <option value="in">Pulgada (in)</option>
                            <option value="ft">Pie (ft)</option>
                            <option value="m2">Metro cuadrado (m²)</option>
                            <option value="m3">Metro cúbico (m³)</option>
                            <option value="pza">Pieza (pza)</option>
                            <option value="par">Par</option>
                            <option value="docena">Docena</option>
                            <option value="caja">Caja</option>
                            <option value="paquete">Paquete</option>
                            <option value="bolsa">Bolsa</option>
                            <option value="rollo">Rollo</option>
                            <option value="hoja">Hoja</option>
                            <option value="kit">Kit</option>
                            <option value="set">Set/Conjunto</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sección: Inventario -->
                <div class="form-section">
                  <div class="section-header">
                    <h3><i class="fas fa-warehouse"></i> Control de Inventario</h3>
                  </div>
                  <div class="section-content">
                    <div class="form-group">
                      <label>Stock actual</label>
                      <div class="input-wrapper">
                        <i class="fas fa-boxes input-icon"></i>
                        <input 
                          v-model.number="form.stock" 
                          type="number" 
                          min="0" 
                          placeholder="Cantidad actual en inventario"
                          class="form-input"
                          required
                        />
                        <span class="input-suffix">{{ form.unidad_medida || 'und' }}</span>
                      </div>
                    </div>
                    
                    <div class="form-row">
                      <div class="form-group">
                        <label>Stock mínimo</label>
                        <div class="input-wrapper">
                          <i class="fas fa-arrow-down input-icon text-warning"></i>
                          <input 
                            v-model.number="form.stockMin" 
                            type="number" 
                            min="0" 
                            placeholder="Alerta de stock bajo"
                            class="form-input"
                          />
                        </div>
                      </div>
                      
                      <div class="form-group">
                        <label>Stock máximo</label>
                        <div class="input-wrapper">
                          <i class="fas fa-arrow-up input-icon text-success"></i>
                          <input 
                            v-model.number="form.stockMax" 
                            type="number" 
                            min="0" 
                            placeholder="Capacidad máxima"
                            class="form-input"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label>Estado del producto</label>
                      <div class="input-wrapper">
                        <i class="fas fa-toggle-on input-icon"></i>
                        <select v-model="form.activo" class="form-select">
                          <option :value="1">✅ Activo - Disponible para venta</option>
                          <option :value="0">❌ Suspendido - No disponible</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sección: Imagen -->
                <div class="form-section">
                  <div class="section-header">
                    <h3><i class="fas fa-camera"></i> Imagen del Producto</h3>
                  </div>
                  <div class="section-content">
                    <div class="image-upload-area">
                      <div class="upload-zone" :class="{ 'has-image': form.imagePreview || (editingProduct && editingProduct.image) }">
                        <input 
                          type="file" 
                          @change="onImageChange" 
                          accept="image/*" 
                          class="file-input"
                          id="imageUpload"
                        />
                        <label for="imageUpload" class="upload-label">
                          <div v-if="!form.imagePreview && !(editingProduct && editingProduct.image)" class="upload-placeholder">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <span>Hacer clic para subir imagen</span>
                            <small>JPG, PNG o GIF (máx. 2MB)</small>
                          </div>
                          <div v-else class="image-preview-wrapper">
                            <img
                              v-if="form.imagePreview"
                              :src="form.imagePreview"
                              alt="Previsualización"
                              class="image-preview"
                            />
                            <img
                              v-else-if="editingProduct && editingProduct.image"
                              :src="editingProduct.image"
                              alt="Imagen actual"
                              class="image-preview"
                            />
                            <div class="image-overlay">
                              <i class="fas fa-edit"></i>
                              <span>Cambiar imagen</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Botones de acción -->
              <div class="modal-footer">
                <button type="button" @click="closeProductModal" class="btn-secondary">
                  <i class="fas fa-times"></i>
                  Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  <i class="fas fa-save"></i>
                  {{ editingProduct ? 'Actualizar' : 'Crear' }} Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <div class="products-background-decor"></div>
  </div>
</template>

<script>
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import defaultProductImg from '@/assets/images/default-product.png';

export default {
  data() {
    return {
      // Buscador de productos
      searchQuery: '',
      // Categoría seleccionada para filtrar
      selectedCategory: '',
      // Lista de categorías únicas
      categories: [],
      // Controla si el modal está abierto
      isModalOpen: false,
      // Lista de productos obtenidos de la base de datos
      products: [],
      // Datos del producto nuevo o en edición
      newProduct: {
        name: '',
        description: '',
        price: '',
        purchasePrice: '',
        category: '',
        marca: '',           // <-- nuevo campo
        unidad_medida: '',   // <-- nuevo campo
        stock: '',
        stockMin: '',
        stockMax: '',
        imageFile: null,
        imagePreview: null,
      },
      // Estado de edición
      isEditing: false,
      editingProductId: null,
      // Modo de vista: 'cards' o 'list'
      viewMode: 'cards',
      defaultProductImg, // <-- agrega aquí
      // Estado de carga
      loading: false,
      // Controla la visibilidad del modal de producto
      showProductModal: false,
      editingProduct: null, // <--- AGREGA ESTA LÍNEA
      // Datos del formulario del producto
      form: {
        name: '',
        description: '',
        price: null,
        purchasePrice: null,
        category: '',
        marca: '',
        unidad_medida: '',
        stock: null,
        stockMin: null,
        stockMax: null,
        imageFile: null,
        imagePreview: null,
      },
    };
  },
  computed: {
    // Filtra productos según búsqueda y categoría
    filteredProducts() {
      return this.products.filter((product) => {
        const matchesSearchQuery = product.name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
        const matchesCategory =
          this.selectedCategory === '' || product.category === this.selectedCategory;
        return matchesSearchQuery && matchesCategory;
      });
    },
  },
  methods: {
    // Obtiene los productos desde la API
    async fetchProducts() {
      this.loading = true;
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        this.products = response.data.map((product) => ({
          ...product,
          image: product.image
            ? (product.image.startsWith('/uploads/')
                ? `${import.meta.env.VITE_API_URL}${product.image}`
                : product.image)
            : defaultProductImg,
        }));
        this.categories = [...new Set(response.data.map((product) => product.category))];
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      } finally {
        this.loading = false;
      }
    },
    // Abre el modal para agregar producto
    openAddProductModal() {
      this.isModalOpen = true;
      this.showProductModal = true;
      this.resetForm();
    },
    // Cierra el modal y resetea el formulario
    closeAddProductModal() {
      this.isModalOpen = false;
      this.showProductModal = false;
      this.isEditing = false;
      this.editingProductId = null;
      this.editingProduct = null;
      this.resetNewProduct();
    },
    // Maneja la carga y compresión de la imagen
    async handleImageUpload(event) {
      const file = event.target.files[0];
      const maxSize = 2 * 1024 * 1024; // 2 MB

      if (file) {
        if (file.size > maxSize) {
          alert('La imagen es demasiado pesada. El tamaño máximo permitido es de 2 MB.');
          return;
        }

        try {
          const options = {
            maxSizeMB: 1, // Tamaño máximo en MB después de la compresión
            maxWidthOrHeight: 800, // Dimensiones máximas
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);

          // Asigna un nombre con extensión al archivo comprimido
          const ext = file.name.split('.').pop();
          const newFile = new File(
            [compressedFile],
            `compressed.${ext}`,
            { type: compressedFile.type }
          );
          this.newProduct.imageFile = newFile;

          // Crear una vista previa de la imagen
          const reader = new FileReader();
          reader.onload = (e) => {
            this.newProduct.imagePreview = e.target.result; // Vista previa
          };
          reader.readAsDataURL(compressedFile);
        } catch (error) {
          console.error('Error al comprimir la imagen:', error);
        }
      }
    },
    // Agrega un nuevo producto usando FormData
    async addProduct() {
      try {
        // Validar campos obligatorios
        if (
          !this.newProduct.name ||
          !this.newProduct.description ||
          !this.newProduct.price ||
          !this.newProduct.purchasePrice ||
          !this.newProduct.category ||
          !this.newProduct.marca ||
          !this.newProduct.unidad_medida ||
          !this.newProduct.stock ||
          !this.newProduct.stockMin
        ) {
          alert('Por favor, completa todos los campos obligatorios.');
          return;
        }

        const formData = new FormData();
        formData.append('name', this.newProduct.name);
        formData.append('description', this.newProduct.description);
        formData.append('price', this.newProduct.price ? Number(this.newProduct.price) : 0);
        formData.append('purchase_price', this.newProduct.purchasePrice ? Number(this.newProduct.purchasePrice) : 0);
        formData.append('category', this.newProduct.category);
        formData.append('marca', this.newProduct.marca); // nuevo
        formData.append('unidad_medida', this.newProduct.unidad_medida); // nuevo
        formData.append('stock', this.newProduct.stock ? Number(this.newProduct.stock) : 0);
        formData.append('stock_min', this.newProduct.stockMin ? Number(this.newProduct.stockMin) : 0);
        formData.append('stock_max', this.newProduct.stockMax ? Number(this.newProduct.stockMax) : 0);

        // Si hay una imagen seleccionada, agregarla al FormData
        if (this.newProduct.imageFile) {
          formData.append('image', this.newProduct.imageFile);
        }

        // Enviar los datos al backend
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
        });

        // Agregar el producto a la lista local
        const product = response.data;
        product.image = product.image && product.image.startsWith('/uploads/')
          ? `${import.meta.env.VITE_API_URL}${product.image}`
          : (product.image || defaultProductImg);
        this.products.push(product);
        this.closeAddProductModal();
      } catch (error) {
        console.error('Error al agregar el producto:', error.response?.data || error.message);
      }
    },
    // Actualiza un producto existente
    async updateProduct() {
      try {
        const formData = new FormData();
        formData.append('name', this.newProduct.name);
        formData.append('description', this.newProduct.description);
        formData.append('price', this.newProduct.price ? Number(this.newProduct.price) : 0);
        formData.append('purchase_price', this.newProduct.purchasePrice ? Number(this.newProduct.purchasePrice) : 0);
        formData.append('category', this.newProduct.category);
        formData.append('marca', this.newProduct.marca); // nuevo
        formData.append('unidad_medida', this.newProduct.unidad_medida); // nuevo
        formData.append('stock', this.newProduct.stock ? Number(this.newProduct.stock) : 0);
        formData.append('stock_min', this.newProduct.stockMin ? Number(this.newProduct.stockMin) : 0);
        formData.append('stock_max', this.newProduct.stockMax ? Number(this.newProduct.stockMax) : 0);
        if (this.newProduct.imageFile) {
          formData.append('image', this.newProduct.imageFile);
        }
        const token = localStorage.getItem('authToken');
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/products/${this.editingProductId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          }
        );
        this.fetchProducts();
        this.closeAddProductModal();
      } catch (error) {
        console.error('Error al actualizar el producto:', error.response?.data || error.message);
      }
    },
    // Reinicia los campos del formulario de producto
    resetNewProduct() {
      this.newProduct = {
        name: '',
        description: '',
        price: '',
        purchasePrice: '',
        category: '',
        marca: '',           // <-- nuevo campo
        unidad_medida: '',   // <-- nuevo campo
        stock: '',
        stockMin: '',
        stockMax: '',
        imageFile: null,
        imagePreview: null,
      };
    },
    // Abre el modal para editar un producto existente
    editProduct(product) {
      this.editingProduct = product;
      this.form = { ...product };
      this.showProductModal = true;
    },
    // Elimina un producto por ID
    async deleteProduct(productId) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.fetchProducts();
      } catch (error) {
        console.error('Error al eliminar el producto:', error);
      }
    },
    // Valida y formatea campos decimales (por ejemplo, precio de compra)
    validateDecimal(field) {
      // Reemplaza comas por puntos para manejar decimales
      this.newProduct[field] = this.newProduct[field]
        .replace(',', '.')
        .replace(/[^0-9.]/g, ''); // Permite solo números y puntos
    },
    // Cierra el modal de producto
    closeProductModal() {
      this.showProductModal = false;
      this.isModalOpen = false;
      this.editingProduct = null;
      this.resetForm();
      this.resetNewProduct();
    },
    // Abre el modal de producto (agregar o editar)
    openProductModal(product = null) {
      if (product) {
        this.editingProduct = product;
        this.form = { ...product, imageFile: null, imagePreview: null };
      } else {
        this.editingProduct = null;
        this.resetForm(); // Limpia el formulario
        this.resetNewProduct(); // Limpia también el newProduct
      }
      this.showProductModal = true;
      this.isModalOpen = true;
    },
    // Reinicia los campos del formulario
    resetForm() {
      this.form = {
        name: '',
        description: '',
        price: null,
        purchasePrice: null,
        category: '',
        marca: '',
        unidad_medida: '',
        stock: null,
        stockMin: null,
        stockMax: null,
        imageFile: null,
        imagePreview: null,
      };
    },
    // Guarda el producto (nuevo o editado)
    async saveProduct() {
      try {
        const token = localStorage.getItem('authToken');
        const formData = new FormData();
        formData.append('name', this.form.name);
        formData.append('description', this.form.description);
        formData.append('price', this.form.price ? Number(this.form.price) : 0);
        formData.append('purchase_price', this.form.purchasePrice ? Number(this.form.purchasePrice) : 0);
        formData.append('category', this.form.category);
        formData.append('marca', this.form.marca);
        formData.append('unidad_medida', this.form.unidad_medida);
        formData.append('stock', this.form.stock ? Number(this.form.stock) : 0);
        formData.append('stock_min', this.form.stockMin ? Number(this.form.stockMin) : 0);
        formData.append('stock_max', this.form.stockMax ? Number(this.form.stockMax) : 0);
        formData.append('activo', this.form.activo ?? 1);

        // Adjunta la imagen si fue seleccionada
        if (this.form.imageFile) {
          formData.append('image', this.form.imageFile);
        }

        if (this.editingProduct && this.editingProduct.id) {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/api/products/${this.editingProduct.id}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
              }
            }
          );
        } else {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/products`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
              }
            }
          );
        }
        this.showProductModal = false;
        this.fetchProducts();
      } catch (err) {
        console.error('Error al guardar el producto:', err.response?.data || err);
      }
    },
    // Agregar producto
    async agregarProducto() {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/products', this.form, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },

    // Editar producto
    async editarProducto() {
      const token = localStorage.getItem('authToken');
      await axios.put(`/api/products/${this.editingProduct.id}`, this.form, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.form.imageFile = file;
        
        // Crear previsualización de la imagen
        const reader = new FileReader();
        reader.onload = (e) => {
          this.form.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
  },
  mounted() {
    // Al montar, obtiene productos y verifica si hay que editar alguno por query
    this.fetchProducts().then(() => {
      const editId = this.$route.query.edit;
      if (editId) {
        const product = this.products.find(p => p.id == editId);
        if (product) {
          this.editProduct(product);
        }
      }
    });
  },
};
</script>

<style scoped>
/* Fondo y contenedor principal */
.products-page {
  padding: min(2.5rem, 4vw) min(1.5rem, 3vw) min(6rem, 8vw) min(1.5rem, 3vw);
  font-family: 'Inter', Arial, sans-serif;
  background: #f6f7fb;
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Cabecera mejorada */
.products-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.products-header::before {
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

.btn-new-product {
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

.btn-new-product:hover {
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
  min-width: 200px;
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

.category-select {
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
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1.25em 1.25em;
  padding-right: 3rem;
}

.category-select:focus {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.category-select option {
  background: #667eea;
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
  color: #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Lista de productos mejorada */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  max-height: calc(100vh - 400px);
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.5rem;
}

/* Tarjeta de producto mejorada */
.product-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f1f5f9;
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: #e2e8f0;
}

.product-card.low-stock {
  border-left: 4px solid #f59e0b;
}

.product-card-header {
  position: relative;
  overflow: hidden;
}

.product-image-container {
  position: relative;
  height: 140px;
  overflow: hidden;
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

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.overlay-btn {
  background: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

.product-status {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}

.status-badge {
  background: rgba(255, 255, 255, 0.95);
  color: #374151;
  padding: 0.25rem 0.625rem;
  border-radius: 16px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-badge.low-stock {
  background: rgba(245, 158, 11, 0.9);
  color: white;
}

.status-badge.inactive {
  background: rgba(107, 114, 128, 0.9);
  color: white;
}

.product-card-body {
  padding: 1rem;
}

.product-category-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.product-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.375rem 0;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description {
  color: #6b7280;
  font-size: 0.75rem;
  line-height: 1.3;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-details {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.product-brand,
.product-unit {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  color: #6b7280;
  background: #f9fafb;
  padding: 0.15rem 0.375rem;
  border-radius: 6px;
  font-weight: 500;
}

.product-brand i,
.product-unit i {
  color: #9ca3af;
  font-size: 0.625rem;
}

.product-pricing {
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #e5e7eb;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.price-row:last-child {
  margin-bottom: 0;
}

.price-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.price-value {
  font-weight: 700;
  font-size: 0.85rem;
}

.price-value.sale {
  color: #059669;
}

.price-value.purchase {
  color: #dc2626;
}

.product-stock-info {
  background: #f0f9ff;
  border: 1px solid #e0f2fe;
  border-radius: 8px;
  padding: 0.5rem;
}

.stock-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.stock-label {
  font-size: 0.8rem;
  color: #0369a1;
  font-weight: 600;
}

.stock-value {
  font-weight: 700;
  color: #0c4a6e;
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
  font-size: 0.7rem;
  color: #6b7280;
}

.stock-min,
.stock-max {
  background: rgba(255, 255, 255, 0.8);
  padding: 0.15rem 0.375rem;
  border-radius: 4px;
  font-weight: 500;
}

/* Loader y mensaje igual que dashboard */
.loader {
  width: 48px;
  height: 48px;
  border: 5px solid #ececec;
  border-top: 5px solid #4f8cff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 2rem auto;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.no-products-msg {
  color: #8a94a6;
  text-align: center;
  font-size: 1.01rem;
  margin-bottom: 1.3rem;
}

/* --- ESTILOS PARA LA TABLA DE PRODUCTOS --- */
.products-table {
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
.products-table table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: transparent;
}
.products-table th, .products-table td {
  padding: 1rem 0.7rem;
  text-align: center;
  font-size: 1.05rem;
}
.products-table th {
  background: #f6f7fb;
  color: #3b4a5a;
  font-weight: 700;
  border-bottom: 2px solid #ececec;
}
.products-table tbody tr {
  border-bottom: 1px solid #ececec;
  transition: background 0.13s;
}
.products-table tbody tr:hover {
  background: #f8fafc;
}
.products-table td {
  color: #23272f;
  vertical-align: middle;
}
.table-product-image {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #ececec;
  background: #f8fafc;
  display: block;
  margin: 0 auto;
}
.products-table .edit-btn, .products-table .delete-btn {
  background: #f6f7fb;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  font-size: 1.1rem;
  color: #4f8cff;
  margin: 0 0.2rem;
  transition: background 0.13s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.products-table .edit-btn:hover {
  background: #e0e7ff;
}
.products-table .delete-btn {
  color: #ff6961;
}
.products-table .delete-btn:hover {
  background: #ffe0e0;
}
.products-table .stock-alert {
  color: #ff6961;
  font-weight: 700;
  margin-left: 0.5rem;
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
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.product-form {
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
  &:nth-child(3), &:nth-child(4) {
    border-top: 1px solid #e2e8f0;
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
  color: #667eea;
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

.input-suffix {
  position: absolute;
  right: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  pointer-events: none;
}

.form-input,
.form-textarea,
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
.form-textarea:focus,
.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1.25em 1.25em;
  padding-right: 3rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.text-warning {
  color: #f59e0b !important;
}

.text-success {
  color: #10b981 !important;
}

/* Sección de imagen */
.form-section:nth-child(4) {
  grid-column: span 2;
  border-right: none;
}

.image-upload-area {
  width: 100%;
}

.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  background: #fafafa;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.upload-zone:hover {
  border-color: #667eea;
  background: #f8fafc;
}

.upload-zone.has-image {
  border: 2px solid #e5e7eb;
  background: white;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.upload-label {
  display: block;
  cursor: pointer;
}

.upload-placeholder {
  padding: 3rem 2rem;
  text-align: center;
  color: #6b7280;
}

.upload-placeholder i {
  font-size: 3rem;
  color: #9ca3af;
  margin-bottom: 1rem;
  display: block;
}

.upload-placeholder span {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.upload-placeholder small {
  font-size: 0.875rem;
  color: #9ca3af;
}

.image-preview-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.image-preview {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 0.95rem;
  font-weight: 500;
}

.image-preview-wrapper:hover .image-overlay {
  opacity: 1;
}

.image-overlay i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.modal-footer {
  background: #f8fafc;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 140px;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
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

/* Estilos personalizados para scrollbar */
.products-page::-webkit-scrollbar,
.products-grid::-webkit-scrollbar,
.products-table::-webkit-scrollbar {
  width: 8px;
}

.products-page::-webkit-scrollbar-track,
.products-grid::-webkit-scrollbar-track,
.products-table::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.products-page::-webkit-scrollbar-thumb,
.products-grid::-webkit-scrollbar-thumb,
.products-table::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  transition: background 0.3s ease;
}

.products-page::-webkit-scrollbar-thumb:hover,
.products-grid::-webkit-scrollbar-thumb:hover,
.products-table::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

/* Para Firefox */
.products-page,
.products-grid,
.products-table {
  scrollbar-width: thin;
  scrollbar-color: #667eea #f1f5f9;
}

/* Responsive */
@media (max-width: 1024px) {
  .form-sections {
    grid-template-columns: 1fr;
  }
  
  .form-section {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .form-section:nth-child(4) {
    grid-column: span 1;
    border-bottom: none;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
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
  
  .section-content {
    padding: 1.5rem;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    flex-direction: column-reverse;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    min-width: 0;
  }
}
/* Responsive mejorado */
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  
  .header-stats {
    gap: 1.5rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .products-page {
    padding: 1rem 1rem 4rem 1rem;
  }
  
  .products-header {
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
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .product-card-body {
    padding: 1rem;
  }
  
  .product-details {
    justify-content: space-between;
  }
  
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
  
  .section-content {
    padding: 1.5rem;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    flex-direction: column-reverse;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    min-width: 0;
  }
  
  .products-table {
    padding: 1rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .products-table th,
  .products-table td {
    padding: 0.5rem 0.25rem;
    font-size: 0.8rem;
  }
  
  .table-product-image {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .products-page {
    padding: 1rem 0.5rem 3.5rem 0.5rem;
  }
  
  .products-header {
    padding: 1.5rem 1rem;
  }
  
  .header-text h1 {
    font-size: 1.75rem;
  }
  
  .header-subtitle {
    font-size: 1rem;
  }
  
  .btn-new-product {
    padding: 0.875rem 1.25rem;
    font-size: 0.9rem;
  }
  
  .search-input,
  .category-select {
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    font-size: 0.9rem;
  }
  
  .product-image-container {
    height: 160px;
  }
  
  .product-title {
    font-size: 1.1rem;
  }
  
  .modal-container {
    width: 95vw;
    margin: 0.5rem;
  }
  
  .section-header {
    padding: 1rem 1.5rem;
  }
  
  .section-content {
    padding: 1rem;
  }
}

/* Dispositivos muy pequeños */
@media (max-width: 360px) {
  .products-page {
    padding: 0.75rem 0.25rem 3rem 0.25rem;
  }
  
  .products-header {
    padding: 1rem 0.75rem;
  }
}
</style>
