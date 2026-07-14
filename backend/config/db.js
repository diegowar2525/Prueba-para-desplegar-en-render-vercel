const dns = require('node:dns');
const mongoose = require('mongoose');

// Node resolverá el registro SRV de Atlas usando DNS públicos.
// Debe ejecutarse antes de mongoose.connect().
dns.setServers([
  '1.1.1.1',
  '8.8.8.8'
]);

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('La variable MONGODB_URI no está definida');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      family: 4,
      serverSelectionTimeoutMS: 15000
    });

    console.log(
      `MongoDB conectado: ${conn.connection.host}/${conn.connection.name}`
    );

    return conn;
  } catch (error) {
    console.error('Error de conexión a MongoDB:', {
      name: error.name,
      message: error.message,
      code: error.code,
      hostname: error.hostname,
      syscall: error.syscall
    });

    throw error;
  }
};

module.exports = connectDB;