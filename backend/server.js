require('dotenv').config();

const express = require('express');
const cors = require('cors');
const passport = require('passport');
const connectDB = require('./config/db');

require('./config/passport');

const app = express();

const frontendUrl =
  process.env.FRONTEND_URL || 'http://localhost:5173';

const allowedOrigins = [
  frontendUrl,
  'http://localhost:5173'
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`Origen no permitido por CORS: ${origin}`)
      );
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Practica Backend API running successfully'
  });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Recurso no encontrado'
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);

  res.status(500).json({
    success: false,
    message: 'Ocurrió un error en el servidor',
    error:
      process.env.NODE_ENV === 'development'
        ? err.message
        : undefined
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `Servidor corriendo en modo ${process.env.NODE_ENV || 'development'
        } en el puerto ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      'No se pudo iniciar el servidor porque MongoDB no está disponible.'
    );

    process.exit(1);
  }
};

startServer();