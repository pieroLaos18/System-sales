// Composable para manejo de productos
import { ref, computed } from 'vue'
import axios from 'axios'

export function useProducts() {
  const products = ref([])
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  const defaultProductImg = '/src/assets/images/default-product.png'

  // Computed properties
  const lowStockProducts = computed(() => 
    products.value.filter(p => p.low_stock)
  )

  const activeProducts = computed(() => 
    products.value.filter(p => p.activo === 1)
  )

  // Methods
  const fetchProducts = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`)
      
      products.value = response.data.map((product) => ({
        ...product,
        image: product.image
          ? (product.image.startsWith('/uploads/')
              ? `${import.meta.env.VITE_API_URL}${product.image}`
              : product.image)
          : defaultProductImg,
      }))
      
      categories.value = [...new Set(response.data.map((product) => product.category))]
    } catch (err) {
      error.value = 'Error al cargar productos'
      console.error('Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (productData) => {
    const token = localStorage.getItem('authToken')
    const formData = new FormData()
    
    // Append all product data to FormData
    Object.keys(productData).forEach(key => {
      if (key === 'imageFile' && productData[key]) {
        formData.append('image', productData[key])
      } else if (productData[key] !== null && productData[key] !== undefined) {
        formData.append(key, productData[key])
      }
    })

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/products`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      }
    )

    await fetchProducts() // Refresh products list
    return response.data
  }

  const updateProduct = async (id, productData) => {
    const token = localStorage.getItem('authToken')
    const formData = new FormData()
    
    Object.keys(productData).forEach(key => {
      if (key === 'imageFile' && productData[key]) {
        formData.append('image', productData[key])
      } else if (productData[key] !== null && productData[key] !== undefined) {
        formData.append(key, productData[key])
      }
    })

    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/products/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      }
    )

    await fetchProducts() // Refresh products list
    return response.data
  }

  const deleteProduct = async (id) => {
    const token = localStorage.getItem('authToken')
    
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/products/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    await fetchProducts() // Refresh products list
  }

  return {
    products,
    categories,
    loading,
    error,
    lowStockProducts,
    activeProducts,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  }
}
