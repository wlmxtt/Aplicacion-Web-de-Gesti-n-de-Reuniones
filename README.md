# Sistema de Gestión de Reuniones Administrativas - UGMA

Este proyecto es una plataforma web integral diseñada para la Universidad Nororiental Privada Gran Mariscal de Ayacucho (UGMA). Permite la planificación, control y seguimiento de reuniones administrativas, garantizando una comunicación eficiente entre directores, coordinadores e invitados.

## 🚀 Tecnologías (PERN Stack)

### Backend
- **Node.js & Express:** Motor de ejecución y framework de API.
- **TypeScript:** Tipado robusto para mayor seguridad en el desarrollo.
- **Prisma ORM:** Gestión de base de datos y migraciones.
- **Zod:** Validación de esquemas de datos.
- **JWT & bcrypt.js:** Seguridad y manejo de sesiones.
- **Nodemailer:** Envío de notificaciones por correo electrónico.

### Frontend
- **React.js (Vite):** Interfaz de usuario dinámica y rápida.
- **Tailwind CSS:** Diseño moderno, responsivo y estético.
- **Axios:** Cliente HTTP para comunicación con la API.
- **Lucide React:** Iconografía moderna.

### Infraestructura
- **PostgreSQL:** Base de datos relacional.
- **Docker:** Contenedorización de la base de datos para un entorno consistente.

## 🛠️ Estructura del Proyecto

```text
/
├── backend/             # Lógica de negocio y API
│   ├── prisma/          # Esquemas y migraciones de DB
│   └── src/             # Código fuente (TypeScript)
├── frontend/            # Interfaz de usuario (React)
│   ├── src/             # Componentes, páginas y hooks
│   └── index.html       # Punto de entrada web
├── docker-compose.yml   # Configuración de servicios Docker
└── README.md            # Documentación del proyecto
```

## ⚙️ Configuración e Instalación

### Requisitos Previos
- Node.js (v18+)
- Docker & Docker Compose
- npm o yarn

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd "Proyecto Reuniones"
   ```

2. **Levantar la Base de Datos:**
   ```bash
   docker-compose up -d
   ```

3. **Configurar el Backend:**
   - Ve a la carpeta `backend/`.
   - Copia `.env` (si existe) o configúralo con tus credenciales.
   - Instala dependencias: `npm install`
   - Genera el cliente Prisma: `npx prisma generate`
   - Ejecuta las migraciones: `npx prisma migrate dev`
   - (Opcional) Seed de datos: `npx ts-node prisma/seed.ts`

4. **Configurar el Frontend:**
   - Ve a la carpeta `frontend/`.
   - Instala dependencias: `npm install`

## 🏃 Ejecución en Desarrollo

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 🔒 Roles y Permisos
- **Director UGMA / Director de Escuela / Coordinador:** Pueden crear, modificar y cancelar reuniones.
- **Invitado:** Puede ver reuniones, confirmar asistencia y proponer puntos de agenda.

## 📧 Notificaciones
El sistema envía correos automáticos para:
- Nuevas invitaciones.
- Cambios en fecha, hora o ubicación.
- Cancelaciones de reuniones.

---
© 2026 Universidad Nororiental Privada Gran Mariscal de Ayacucho
