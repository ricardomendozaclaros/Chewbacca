import express from 'express';
import cors from 'cors';
import process from 'process';
import { config } from './config/default.js';
import { redisService } from './lib/redis.js';
import signatureRoutes from './routes/signatures.js';
import userRoutes from './routes/users.js';

const app = express();
const { port, host } = config.server;

// Middleware
app.use(cors());

// Rutas
app.use('/api/apicerticamara', signatureRoutes);
app.use('/api/apicerticamara' , userRoutes)
// Manejador para cerrar Redis al terminar
process.on('SIGTERM', async () => {
  await redisService.quit();
  process.exit(0);
});

// Inicializar servidor
const startServer = async () => {
  try {
    await redisService.connect();
    
    app.listen(port, host, () => {
      console.log(`Servidor de caché corriendo en http://${host}:${port}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();