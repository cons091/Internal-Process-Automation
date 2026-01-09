const nodemailer = require('nodemailer');

// Configuración del transporte
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS
  }
});

const EmailService = {
  sendStatusNotification: async (toEmail, userName, requestType, newStatus, reason) => {
    try {
      const subject = `Actualización de Solicitud: ${requestType} - ${newStatus}`;
      
      const statusColor = newStatus === 'APPROVED' ? 'green' : 'red';
      const statusText = newStatus === 'APPROVED' ? 'APROBADA' : 'RECHAZADA';

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333;">Hola, ${userName}</h2>
          <p>Tu solicitud de <strong>${requestType}</strong> ha sido procesada.</p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 5px solid ${statusColor};">
            <p style="margin: 0;"><strong>Nuevo Estado:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
            <p style="margin: 10px 0 0;"><strong>Motivo:</strong> ${reason}</p>
          </div>

          <p style="font-size: 12px; color: #888;">Este es un mensaje automático del Sistema de Gestión Corporativa.</p>
        </div>
      `;

      await transporter.sendMail({
        from: `"Sistema de Gestión" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent
      });

      console.log(`📧 Correo enviado a ${toEmail}`);
      return true;

    } catch (error) {
      console.error('❌ Error enviando correo:', error);
      return false;
    }
  }
};

module.exports = EmailService;