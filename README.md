# Proyecto Full-Stack: CRUD de Usuarios y Autenticación JWT / Google OAuth

Este proyecto consiste en un sistema completo de administración de usuarios y autenticación, desarrollado con Node.js/Express para el backend y React (Vite) para el frontend.

## Características principales
* **Autenticación robusta**: Inicio de sesión y registro local con contraseñas encriptadas (`bcryptjs`) y tokens (`jsonwebtoken`).
* **OAuth 2.0 con Google**: Autenticación integrada a través de cuentas de Google usando `passport-google-oauth20` (sin sesiones, integrado de forma nativa con el flujo JWT).
* **Operaciones CRUD**: Panel administrativo que permite listar, agregar, editar y eliminar usuarios.
* **Seguridad avanzada**: Rutas protegidas mediante un middleware JWT (`Authorization: Bearer <token>`).
* **Diseño Glassmorphic**: Interfaz premium de temática oscura, reactiva, con micro-animaciones y soporte responsivo para móviles y ordenadores.

---

## Estructura del Proyecto

```text
Practica/
├── backend/
│   ├── config/             # Configuración de base de datos y Passport
│   ├── middleware/         # Middleware de protección de rutas (JWT)
│   ├── models/             # Esquemas de Mongoose (User)
│   ├── routes/             # Endpoints de API (auth, users)
│   ├── .env.example        # Variables de entorno de muestra
│   ├── server.js           # Archivo de inicio del servidor
│   └── package.json        # Dependencias del backend
├── frontend/
│   ├── src/                # Archivos fuente de React
│   │   ├── App.jsx         # Componente principal y vistas del Portal
│   │   ├── index.css       # Estilos globales y Glassmorphism
│   │   └── main.jsx        # Inicialización de React
│   ├── index.html          # HTML principal con tipografía Outfit
│   ├── .env.example        # Variables de entorno de muestra
│   └── package.json        # Dependencias del frontend
└── README.md               # Instrucciones de instalación y uso
```

---

## Requisitos Previos

Asegúrate de tener instalado:
1. **Node.js** (v16.0 o superior)
2. **MongoDB** corriendo de forma local (`mongodb://localhost:27017`) o una cuenta en **MongoDB Atlas**.
3. **Credenciales de Google OAuth** (si deseas probar el login con Gmail):
   * Ve a [Google Cloud Console](https://console.cloud.google.com/).
   * Crea un proyecto.
   * Crea credenciales para un **ID de cliente de OAuth**.
   * Añade el callback URI: `http://localhost:5000/api/auth/google/callback`

---

## Configuración e Instalación

### 1. Clonar o descargar el repositorio
Asegúrate de estar en el directorio raíz del proyecto.

### 2. Configurar el Backend

1. Entra al directorio `backend`:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` basado en `.env.example`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/practica
   JWT_SECRET=tu_clave_secreta_para_jwt
   GOOGLE_CLIENT_ID=tu_client_id_de_google
   GOOGLE_CLIENT_SECRET=tu_client_secret_de_google
   FRONTEND_URL=http://localhost:5173
   ```

### 3. Configurar el Frontend

1. Desde el directorio raíz, navega al directorio `frontend`:
   ```bash
   cd ../frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` basado en `.env.example`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

---

## Ejecución en Local

### Levantar el Backend
1. Navega a `backend`:
   ```bash
   cd backend
   ```
2. Ejecuta el servidor en modo desarrollo (usa `nodemon` para reinicios automáticos):
   ```bash
   npm run dev
   ```
El backend estará disponible en `http://localhost:5000`.

### Levantar el Frontend
1. Navega a `frontend`:
   ```bash
   cd frontend
   ```
2. Ejecuta el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
El frontend se levantará en `http://localhost:5173`. Abre esta URL en tu navegador.

---

## API Endpoints

### Autenticación (Públicos)
| Método | Endpoint | Descripción | Body / Parámetros |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Registra un usuario local | `{ name, email, password }` |
| **POST** | `/api/auth/login` | Inicia sesión localmente (obtiene JWT) | `{ email, password }` |
| **GET** | `/api/auth/google` | Inicia redirección hacia Google OAuth | - |
| **GET** | `/api/auth/google/callback` | Callback de Google, redirige al frontend con token | - |
| **GET** | `/api/auth/me` | Obtiene el perfil del usuario autenticado | **Headers**: `Authorization: Bearer <JWT>` |

### CRUD de Usuarios (Protegidos con JWT)
*Todos estos endpoints requieren el encabezado `Authorization: Bearer <Token_JWT>`.*

| Método | Endpoint | Descripción | Body / Parámetros |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/users` | Lista todos los usuarios registrados | - |
| **GET** | `/api/users/:id` | Obtiene la información de un usuario específico | Parámetro `id` en la URL |
| **POST** | `/api/users` | Crea un usuario administrativamente | `{ name, email, password, role }` |
| **PUT** | `/api/users/:id` | Actualiza un usuario específico | `{ name, email, role }` |
| **DELETE** | `/api/users/:id` | Elimina un usuario | Parámetro `id` en la URL |

---

## Pruebas con Postman

Puedes importar la colección de Postman para probar los endpoints individualmente:
1. Abre Postman.
2. Haz clic en **Import**.
3. Selecciona el archivo [Practica_User_CRUD_API.postman_collection.json](./Practica_User_CRUD_API.postman_collection.json) que se encuentra en la raíz del proyecto.
4. Recuerda configurar el header `Authorization` con `Bearer <token>` para las rutas protegidas.

---

## Despliegue en Producción

### Frontend (Vercel)
1. Conecta tu cuenta de GitHub a Vercel.
2. Importa el proyecto y selecciona la carpeta raíz del proyecto, configurando el **Root Directory** como `frontend`.
3. Configura las variables de entorno de producción en Vercel:
   * `VITE_API_URL` -> URL del backend desplegado en Render (ej. `https://mi-backend.onrender.com/api`).
4. Vercel detectará la configuración de Vite y compilará la versión estática de manera automática.

### Backend (Render)
1. Crea un nuevo servicio Web Service en Render conectado a tu repositorio.
2. Configura los siguientes campos:
   * **Root Directory**: `backend`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
3. En el apartado **Environment Variables**, añade:
   * `MONGODB_URI` -> Tu cadena de conexión de MongoDB Atlas.
   * `JWT_SECRET` -> Clave de encriptación aleatoria segura.
   * `FRONTEND_URL` -> URL del frontend desplegado en Vercel (ej. `https://mi-frontend.vercel.app`).
   * `GOOGLE_CLIENT_ID` -> Tu ID de cliente de Google OAuth.
   * `GOOGLE_CLIENT_SECRET` -> Tu secreto de cliente de Google OAuth.
