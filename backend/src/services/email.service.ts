import nodemailer from 'nodemailer';

// Silent mode: if SMTP credentials are not configured, just log to console
const isSilentMode = !process.env.SMTP_USER || !process.env.SMTP_PASS;

let transporter: nodemailer.Transporter | null = null;

if (!isSilentMode) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const logSilent = (type: string, email: string, subject: string) => {
  console.log(`📧 [SILENT MODE] ${type} → ${email} | Subject: ${subject}`);
};

export const sendMeetingInvitation = async (email: string, meetingData: any) => {
  const subject = `Invitación: ${meetingData.title}`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1a237e 0%, #283593 100%); color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">📋 Invitación a Reunión</h1>
        <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Universidad Gran Mariscal de Ayacucho</p>
      </div>
      <div style="padding: 24px;">
        <p>Has sido invitado/a a la siguiente reunión:</p>
        <div style="background: #f5f5f5; border-left: 4px solid #1a237e; padding: 16px; margin: 16px 0; border-radius: 4px;">
          <h2 style="margin: 0 0 8px; color: #1a237e;">${meetingData.title}</h2>
          <p style="margin: 4px 0;"><strong>📅 Fecha:</strong> ${new Date(meetingData.date).toLocaleDateString('es-VE')}</p>
          <p style="margin: 4px 0;"><strong>🕐 Hora:</strong> ${meetingData.time}</p>
          <p style="margin: 4px 0;"><strong>📍 Lugar:</strong> ${meetingData.location}</p>
        </div>
        <p>Por favor, ingresa al sistema para confirmar tu asistencia.</p>
      </div>
      <div style="background: #f5f5f5; padding: 12px; text-align: center; font-size: 12px; color: #777;">
        Sistema de Gestión de Reuniones UGMA © 2026
      </div>
    </div>
  `;

  if (isSilentMode) {
    logSilent('INVITATION', email, subject);
    return;
  }

  try {
    const info = await transporter!.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendMeetingUpdate = async (email: string, meetingData: any) => {
  const subject = `ACTUALIZACIÓN: ${meetingData.title}`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #e65100 0%, #f57c00 100%); color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">🔄 Actualización de Reunión</h1>
        <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Universidad Gran Mariscal de Ayacucho</p>
      </div>
      <div style="padding: 24px;">
        <p>Los detalles de la reunión <strong>${meetingData.title}</strong> han sido actualizados.</p>
        <div style="background: #fff3e0; border-left: 4px solid #e65100; padding: 16px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 4px 0;"><strong>📅 Fecha:</strong> ${new Date(meetingData.date).toLocaleDateString('es-VE')}</p>
          <p style="margin: 4px 0;"><strong>🕐 Hora:</strong> ${meetingData.time}</p>
          <p style="margin: 4px 0;"><strong>📍 Lugar:</strong> ${meetingData.location}</p>
        </div>
        <p>Por favor, verifica los cambios en el sistema.</p>
      </div>
      <div style="background: #f5f5f5; padding: 12px; text-align: center; font-size: 12px; color: #777;">
        Sistema de Gestión de Reuniones UGMA © 2026
      </div>
    </div>
  `;

  if (isSilentMode) {
    logSilent('UPDATE', email, subject);
    return;
  }

  try {
    await transporter!.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email update:', error);
  }
};

export const sendMeetingCancellation = async (email: string, meetingData: any) => {
  const subject = `CANCELADA: ${meetingData.title}`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #b71c1c 0%, #c62828 100%); color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">❌ Reunión Cancelada</h1>
        <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Universidad Gran Mariscal de Ayacucho</p>
      </div>
      <div style="padding: 24px;">
        <p>La reunión <strong>${meetingData.title}</strong> ha sido cancelada.</p>
        <div style="background: #ffebee; border-left: 4px solid #b71c1c; padding: 16px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 4px 0;"><strong>📅 Fecha original:</strong> ${new Date(meetingData.date).toLocaleDateString('es-VE')}</p>
          <p style="margin: 4px 0;"><strong>📍 Lugar:</strong> ${meetingData.location}</p>
        </div>
        <p>Para más información, consulta el sistema.</p>
      </div>
      <div style="background: #f5f5f5; padding: 12px; text-align: center; font-size: 12px; color: #777;">
        Sistema de Gestión de Reuniones UGMA © 2026
      </div>
    </div>
  `;

  if (isSilentMode) {
    logSilent('CANCELLATION', email, subject);
    return;
  }

  try {
    await transporter!.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending cancellation email:', error);
  }
};
