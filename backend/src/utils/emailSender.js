const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✔ Función para recuperación de contraseña (ya la tienes)
const enviarCorreoRecuperacion = async (email, token) => {
  const resetUrl = `http://localhost:5174/reset-password/${token}`;
  await transporter.sendMail({
    from: `"Web Sales System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Recupera tu contraseña',
    html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
           <a href="${resetUrl}">${resetUrl}</a>
           <p>Este enlace expirará en 1 hora.</p>`
  });
};

// 🆕 Función para verificación de cuenta
const enviarCorreoVerificacion = async (email, nombre, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verificar?token=${token}`;
  await transporter.sendMail({
    from: `"Web Sales System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verifica tu cuenta',
    html: `<p>Hola ${nombre},</p>
           <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:</p>
           <a href="${verifyUrl}">${verifyUrl}</a>
           <p>Este enlace es válido por tiempo limitado.</p>`
  });
};

module.exports = {
  enviarCorreoRecuperacion,
  enviarCorreoVerificacion
};

