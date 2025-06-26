const reportService = require('../services/reportService');

const getSalesByDate = async (req, res) => {
  const { from, to, user } = req.query;

  try {
    const ventas = await reportService.getSalesByDate(from, to);

    const usuario =
      req.user?.nombre ||
      req.user?.correo_electronico ||
      user ||
      'Desconocido';

    const descripcion = `Reporte de ventas generado por ${usuario} (${from || 'inicio'} a ${to || 'hoy'})`;
    await reportService.logReportActivity(descripcion, usuario);

    res.status(200).json(ventas);
  } catch (error) {
    console.error('Error en reporte:', error);
    res.status(500).json({ message: 'Error al obtener el reporte de ventas' });
  }
};

module.exports = {
  getSalesByDate
};
