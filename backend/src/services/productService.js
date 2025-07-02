const pool = require('../config/db');

// Helper function to format image URLs
const formatImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If it's already a full URL (Azure or other), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative path, convert to local URL
  if (imageUrl.startsWith('/uploads/')) {
    return `http://localhost:${process.env.PORT || 5000}${imageUrl}`;
  }
  
  // If it's just a filename, add the uploads prefix
  if (!imageUrl.startsWith('/')) {
    return `http://localhost:${process.env.PORT || 5000}/uploads/${imageUrl}`;
  }
  
  return imageUrl;
};

const getAll = async () => {
  const [products] = await pool.query('SELECT * FROM products WHERE activo = 1');
  return products.map(p => ({ 
    ...p, 
    low_stock: Number(p.stock) <= Number(p.stock_min),
    image: formatImageUrl(p.image)
  }));
};

const getDestacados = async () => {
  const [rows] = await pool.query(`
    SELECT p.id, p.name, SUM(dv.cantidad) as vendidos, p.stock
    FROM detalle_ventas dv
    JOIN products p ON dv.producto_id = p.id
    GROUP BY p.id, p.name, p.stock
    ORDER BY vendidos DESC
    LIMIT 5
  `);
  return rows;
};

const insertProduct = async (data) => {
  const [result] = await pool.query(`
    INSERT INTO products 
    (name, description, price, purchase_price, category, marca, unidad_medida, stock, stock_min, stock_max, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    Object.values(data)
  );
  return result.insertId;
};

const updateProduct = async (id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const sets = keys.map(key => `${key} = ?`).join(', ');
  values.push(id);
  await pool.query(`UPDATE products SET ${sets} WHERE id = ?`, values);
};

const softDelete = async (id) => {
  await pool.query('UPDATE products SET activo = 0 WHERE id = ?', [id]);
};

const getByFilter = async (field, value) => {
  const [rows] = await pool.query(`SELECT * FROM products WHERE ${field} = ? AND activo = 1`, [value]);
  return rows.map(p => ({
    ...p,
    image: formatImageUrl(p.image)
  }));
};

module.exports = {
  getAll,
  getDestacados,
  insertProduct,
  updateProduct,
  softDelete,
  getByFilter
};
