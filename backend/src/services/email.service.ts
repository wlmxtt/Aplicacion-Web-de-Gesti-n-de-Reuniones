import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMeetingInvitation = async (email: string, meetingData: any) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Invitación: ${meetingData.title}`,
      html: `
        <h1>Invitación a Reunión Administrativa UGMA</h1>
        <p>Has sido invitado a la reunión: <strong>${meetingData.title}</strong></p>
        <p><strong>Fecha:</strong> ${new Date(meetingData.date).toLocaleDateString()}</p>
        <p><strong>Hora:</strong> ${meetingData.time}</p>
        <p><strong>Lugar:</strong> ${meetingData.location}</p>
        <p>Por favor, ingresa al sistema para confirmar tu asistencia.</p>
      `,
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendMeetingUpdate = async (email: string, meetingData: any) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `ACTUALIZACIÓN: ${meetingData.title}`,
      html: `
        <h1>Cambio en la Reunión Administrativa UGMA</h1>
        <p>Los detalles de la reunión <strong>${meetingData.title}</strong> han sido actualizados.</p>
        <p><strong>Nueva Fecha:</strong> ${new Date(meetingData.date).toLocaleDateString()}</p>
        <p><strong>Nueva Hora:</strong> ${meetingData.time}</p>
        <p><strong>Nuevo Lugar:</strong> ${meetingData.location}</p>
        <p>Por favor, verifica los cambios en el sistema.</p>
      `,
    });
  } catch (error) {
    console.error('Error sending email update:', error);
  }
};
