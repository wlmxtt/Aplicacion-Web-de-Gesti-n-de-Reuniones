import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const schools = [
  'Escuela de Ingeniería',
  'Escuela de FACES (Administración y Contaduría)',
  'Escuela de Derecho',
  'Escuela de Psicología',
];

const DEFAULT_PASSWORD = 'admin123456';

async function main() {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // ────────────────────────────────────
  // 1. ESCUELAS
  // ────────────────────────────────────
  console.log('🏫 Seeding schools...');
  const createdSchools: Record<string, string> = {};
  for (const name of schools) {
    const school = await prisma.school.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    createdSchools[name] = school.id;
  }

  // ────────────────────────────────────
  // 2. USUARIOS
  // ────────────────────────────────────
  console.log('👤 Seeding users...');

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ugma.edu.ve' },
    update: { firstName: 'Soporte', lastName: 'Técnico UGMA', role: 'ADMIN' },
    create: {
      email: 'admin@ugma.edu.ve',
      password: hashedPassword,
      firstName: 'Soporte',
      lastName: 'Técnico UGMA',
      role: 'ADMIN',
    },
  });

  // Director UGMA
  const directorUgma = await prisma.user.upsert({
    where: { email: 'rector.herrera@ugma.edu.ve' },
    update: {},
    create: {
      email: 'rector.herrera@ugma.edu.ve',
      password: hashedPassword,
      firstName: 'Dr. Sebastian',
      lastName: 'Herrera',
      role: 'DIRECTOR_UGMA',
    },
  });

  // Directores de Escuela
  const dirIng = await prisma.user.upsert({
    where: { email: 'director.ing@ugma.edu.ve' },
    update: {},
    create: {
      email: 'director.ing@ugma.edu.ve',
      password: hashedPassword,
      firstName: 'Ing. María',
      lastName: 'Rodríguez',
      role: 'DIRECTOR_ESCUELA',
      schoolId: createdSchools['Escuela de Ingeniería'],
    },
  });

  const dirFaces = await prisma.user.upsert({
    where: { email: 'director.faces@ugma.edu.ve' },
    update: {},
    create: {
      email: 'director.faces@ugma.edu.ve',
      password: hashedPassword,
      firstName: 'Lic. Carlos',
      lastName: 'Mendoza',
      role: 'DIRECTOR_ESCUELA',
      schoolId: createdSchools['Escuela de FACES (Administración y Contaduría)'],
    },
  });

  const dirDer = await prisma.user.upsert({
    where: { email: 'director.der@ugma.edu.ve' },
    update: {},
    create: {
      email: 'director.der@ugma.edu.ve',
      password: hashedPassword,
      firstName: 'Dra. Alicia',
      lastName: 'Flores',
      role: 'DIRECTOR_ESCUELA',
      schoolId: createdSchools['Escuela de Derecho'],
    },
  });

  const dirPsi = await prisma.user.upsert({
    where: { email: 'director.psi@ugma.edu.ve' },
    update: {},
    create: {
      email: 'director.psi@ugma.edu.ve',
      password: hashedPassword,
      firstName: 'Dr. Juan',
      lastName: 'Pérez',
      role: 'DIRECTOR_ESCUELA',
      schoolId: createdSchools['Escuela de Psicología'],
    },
  });

  // Coordinadores
  const coordIng = await prisma.user.upsert({
    where: { email: 'coord.ing@ugma.edu.ve' },
    update: {},
    create: {
      email: 'coord.ing@ugma.edu.ve',
      password: hashedPassword,
      firstName: 'Prof. Alejandro',
      lastName: 'Silva',
      role: 'COORDINADOR',
      schoolId: createdSchools['Escuela de Ingeniería'],
    },
  });

  const coordFaces = await prisma.user.upsert({
    where: { email: 'coord.faces@ugma.edu.ve' },
    update: {},
    create: {
      email: 'coord.faces@ugma.edu.ve',
      password: hashedPassword,
      firstName: 'Prof. Laura',
      lastName: 'Rojas',
      role: 'COORDINADOR',
      schoolId: createdSchools['Escuela de FACES (Administración y Contaduría)'],
    },
  });

  // Invitados
  const invDer = await prisma.user.upsert({
    where: { email: 'invitado.der@ugma.edu.ve' },
    update: {},
    create: {
      email: 'invitado.der@ugma.edu.ve',
      password: hashedPassword,
      firstName: 'Dr. Roberto',
      lastName: 'Gómez',
      role: 'INVITADO',
      schoolId: createdSchools['Escuela de Derecho'],
    },
  });

  const invPsi = await prisma.user.upsert({
    where: { email: 'invitado.psi@ugma.edu.ve' },
    update: {},
    create: {
      email: 'invitado.psi@ugma.edu.ve',
      password: hashedPassword,
      firstName: 'Dra. Elena',
      lastName: 'Rivas',
      role: 'INVITADO',
      schoolId: createdSchools['Escuela de Psicología'],
    },
  });

  // ────────────────────────────────────
  // 3. REUNIONES
  // ────────────────────────────────────
  console.log('📋 Seeding meetings...');

  // Meeting 1: Programada
  const meet1 = await prisma.meeting.create({
    data: {
      title: 'Acreditación de Carreras de Ingeniería',
      description: 'Puntos a tratar:\n1. Revisión de carpetas de profesores.\n2. Estatus de laboratorios de computación y red.\n3. Preparación del cronograma de visitas de pares evaluadores.',
      date: new Date('2026-05-24'),
      time: '09:00',
      location: 'Auditorio de Ingeniería - Módulo A',
      status: 'PROGRAMADA',
      creatorId: dirIng.id,
      guests: {
        create: [
          { userId: directorUgma.id, attendanceStatus: 'PENDIENTE' },
          {
            userId: coordIng.id,
            attendanceStatus: 'CONFIRMADA',
            proposedAgenda: 'Propuesta de incluir actualización de servidores del datacenter en el punto 2.',
          },
        ],
      },
    },
  });

  // Meeting 2: Ejecutada
  const meet2 = await prisma.meeting.create({
    data: {
      title: 'Planificación de Carga Académica FACES',
      description: 'Agenda:\n1. Distribución de secciones para el próximo semestre académico.\n2. Contratación y asignación de profesores adjuntos.\n3. Oferta de electivas profesionales.',
      date: new Date('2026-05-15'),
      time: '14:30',
      location: 'Sala de Juntas FACES - Rectorado Piso 2',
      status: 'EJECUTADA',
      creatorId: dirFaces.id,
      conclusions: 'Se aprobó el 100% de la distribución horaria y secciones de Administración de Empresas. Queda pendiente por validar dos secciones de Contaduría Pública debido a disponibilidad de aulas en el módulo B. Se autorizó la renovación de 4 profesores adjuntos.',
      guests: {
        create: [
          { userId: coordFaces.id, attendanceStatus: 'ASISTIO' },
          { userId: directorUgma.id, attendanceStatus: 'NO_ASISTIO' },
        ],
      },
    },
  });

  // Meeting 3: Programada
  const meet3 = await prisma.meeting.create({
    data: {
      title: 'Reforma Curricular de Derecho',
      description: 'Agenda:\n1. Modificaciones al plan de estudios de Derecho Constitucional.\n2. Inserción de clínicas jurídicas digitales en el pensum.\n3. Convenio con tribunales locales.',
      date: new Date('2026-05-28'),
      time: '11:00',
      location: 'Sala de Conferencias B - Escuela de Derecho',
      status: 'PROGRAMADA',
      creatorId: dirDer.id,
      guests: {
        create: [
          { userId: invDer.id, attendanceStatus: 'CONFIRMADA' },
          {
            userId: directorUgma.id,
            attendanceStatus: 'PENDIENTE',
            proposedAgenda: 'Revisar la viabilidad legal del convenio de clínicas jurídicas digitales.',
          },
        ],
      },
    },
  });

  // Meeting 4: Ejecutada
  const meet4 = await prisma.meeting.create({
    data: {
      title: 'Consejo Extraordinario de Directores UGMA',
      description: 'Agenda:\n1. Análisis presupuestario del ejercicio fiscal 2026.\n2. Reportes de matrícula estudiantil en las 4 escuelas.\n3. Campaña institucional de becas académicas.',
      date: new Date('2026-05-10'),
      time: '08:30',
      location: 'Rectorado - Sala de Consejo Central',
      status: 'EJECUTADA',
      creatorId: directorUgma.id,
      conclusions: 'Se autorizó formalmente el fondo especial de mantenimiento para los laboratorios de Ingeniería y el gabinete psicológico. Se acordó intensificar la promoción en redes sociales. El Rector solicita a cada escuela consignar reportes consolidados el 30 de cada mes.',
      guests: {
        create: [
          { userId: dirIng.id, attendanceStatus: 'ASISTIO' },
          { userId: dirFaces.id, attendanceStatus: 'ASISTIO' },
          { userId: dirDer.id, attendanceStatus: 'ASISTIO' },
          { userId: dirPsi.id, attendanceStatus: 'ASISTIO' },
        ],
      },
    },
  });

  // ────────────────────────────────────
  // 4. NOTIFICACIONES
  // ────────────────────────────────────
  console.log('🔔 Seeding notifications...');

  await prisma.notification.createMany({
    data: [
      {
        title: 'Nueva Reunión Convocada',
        message: `Ing. María Rodríguez ha convocado a la reunión "Acreditación de Carreras de Ingeniería" para el 24 de mayo.`,
        type: 'INFO',
        read: false,
        userId: directorUgma.id,
      },
      {
        title: 'Asistencia Confirmada',
        message: `Prof. Alejandro Silva confirmó su asistencia para "Acreditación de Carreras de Ingeniería".`,
        type: 'SUCCESS',
        read: true,
        userId: dirIng.id,
      },
      {
        title: 'Minutas de Reunión Publicadas',
        message: `Lic. Carlos Mendoza publicó los acuerdos de la reunión "Planificación de Carga Académica FACES".`,
        type: 'SUCCESS',
        read: false,
        userId: null,  // global notification
      },
    ],
  });

  // ────────────────────────────────────
  // 5. AUDIT LOGS
  // ────────────────────────────────────
  console.log('📝 Seeding audit logs...');

  await prisma.auditLog.createMany({
    data: [
      { action: 'INICIO DE SESIÓN EXITOSO (ADMIN)', userEmail: 'admin@ugma.edu.ve', ip: '192.168.1.104' },
      { action: 'REGISTRO DE NUEVO PERSONAL: Dra. Valentina Gómez', userEmail: 'admin@ugma.edu.ve', ip: '192.168.1.104' },
      { action: 'CONVOCATORIA DE REUNIÓN: Acreditación de Carreras', userEmail: 'director.ing@ugma.edu.ve', ip: '192.168.1.115' },
      { action: 'FIRMA DIGITAL DE ACTA [UGMA-HASH-9E2B4]', userEmail: 'rector.herrera@ugma.edu.ve', ip: '192.168.1.120' },
    ],
  });

  console.log('✅ Seeding completed successfully!');
  console.log('');
  console.log('📌 Credenciales de acceso:');
  console.log('   Todos los usuarios usan la contraseña: admin123456');
  console.log('   Admin:           admin@ugma.edu.ve');
  console.log('   Director UGMA:   rector.herrera@ugma.edu.ve');
  console.log('   Dir. Ingeniería: director.ing@ugma.edu.ve');
  console.log('   Dir. FACES:      director.faces@ugma.edu.ve');
  console.log('   Dir. Derecho:    director.der@ugma.edu.ve');
  console.log('   Dir. Psicología: director.psi@ugma.edu.ve');
  console.log('   Coord. Ing.:     coord.ing@ugma.edu.ve');
  console.log('   Coord. FACES:    coord.faces@ugma.edu.ve');
  console.log('   Invitado Der.:   invitado.der@ugma.edu.ve');
  console.log('   Invitada Psi.:   invitado.psi@ugma.edu.ve');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
