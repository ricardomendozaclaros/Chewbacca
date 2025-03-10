import express from "express";
import cors from "cors";
import process from "process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config/default.js";
import { redisService } from "./lib/redis.js";
import enterpriseRoutes from "./routes/enterprise.js";

import signatureRoutes from "./routes/signatures.js";
import accountingRoutes from "./routes/accounting.js";
import customerAccountRoutes from "./routes/customerAccount.js";
import userRoutes from "./routes/user.js";
import bodyParser from "body-parser";
import compression from 'compression';

// Función helper para intentar limpiar memoria si está disponible
const tryGarbageCollection = () => {
  try {
    if (typeof globalThis.gc === 'function') {
      globalThis.gc();
    }
  } catch (e) {
    console.log('Garbage collection no disponible');
  }
};

// Configurar __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const { port, host } = config.server;
const CONFIGS_DIR = path.join(__dirname, "configs");

// Configuraciones para manejar volúmenes masivos de datos
const TIMEOUT = 600000; // 10 minutos
const MAX_PAYLOAD = '500mb'; // Aumentado a 500MB
const MAX_PARAMETER_LIMIT = 1000000; // Aumentado para manejar más parámetros

// Configuraciones de memoria para Node.js
process.env.NODE_OPTIONS = '--max-old-space-size=8192'; // 8GB de memoria heap

// Configurar body parser con límites muy altos
app.use(bodyParser.json({ 
  limit: MAX_PAYLOAD,
  extended: true,
  parameterLimit: MAX_PARAMETER_LIMIT,
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch(e) {
      console.error('Error parsing JSON:', e);
    }
  }
}));

app.use(bodyParser.urlencoded({ 
  limit: MAX_PAYLOAD, 
  extended: true,
  parameterLimit: MAX_PARAMETER_LIMIT
}));

// Configurar compresión para reducir el tamaño de las respuestas
// app.use(compression({
//   level: 6, // Nivel de compresión (1-9)
//   threshold: 100 * 1024 // Comprimir respuestas mayores a 100KB
// }));

// Configurar timeouts extendidos para las peticiones
app.use((req, res, next) => {
  req.setTimeout(TIMEOUT);
  res.setTimeout(TIMEOUT);
  next();
});

// Middleware CORS con timeouts extendidos
app.use(cors({
  maxAge: TIMEOUT,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Total-Count']
}));

app.use(express.json({ 
  limit: MAX_PAYLOAD,
  strict: false // Más permisivo con JSON malformado
}));

// Configurar streaming para grandes conjuntos de datos
// app.use((req, res, next) => {
//   res.setHeader('X-Content-Type-Options', 'nosniff');
//   res.setHeader('Transfer-Encoding', 'chunked');
//   next();
// });

// Crear directorio de configs si no existe
if (!fs.existsSync(CONFIGS_DIR)) {
  fs.mkdirSync(CONFIGS_DIR, { recursive: true });
}

// Ruta para obtener configuración de una página
app.get("/api/config/:page", async (req, res) => {
  const { page } = req.params;
  const filePath = path.join(CONFIGS_DIR, `${page}.json`);
  
  try {
    if (!fs.existsSync(filePath)) {
      const defaultConfig = { layout: [] };
      await fs.promises.writeFile(filePath, JSON.stringify(defaultConfig, null, 2), "utf-8");
      console.log(`Archivo creado: ${filePath}`);
      return res.json(defaultConfig);
    }
    
    const data = await fs.promises.readFile(filePath, "utf-8");
    return res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error al leer/escribir configuración:", error);
    return res.status(500).json({ error: "Error al procesar la configuración" });
  }
});

// Ruta para guardar configuración de una página
app.post("/api/config/:page", async (req, res) => {
  const { page } = req.params;
  const layoutData = req.body;
  const filePath = path.join(CONFIGS_DIR, `${page}.json`);
  
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(layoutData, null, 2), "utf-8");
    console.log(`Archivo actualizado: ${filePath}`);
    return res.json({ message: "Configuración actualizada exitosamente." });
  } catch (error) {
    console.error("Error al guardar configuración:", error);
    return res.status(500).json({ error: "Error al guardar la configuración" });
  }
});

// Rutas de la API
app.use("/api", signatureRoutes);
app.use("/api", userRoutes);
app.use("/api", enterpriseRoutes);
app.use("/api", accountingRoutes);
app.use("/api", customerAccountRoutes);

// Manejador global de errores mejorado
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  tryGarbageCollection();
  res.status(500).json({ error: "Error interno del servidor" });
});

// Manejador para cerrar Redis al terminar
process.on("SIGTERM", async () => {
  console.log("🔄 Cerrando servidor...");
  await redisService.quit();
  tryGarbageCollection();
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
  tryGarbageCollection();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rechazo no manejado en:', promise, 'razón:', reason);
});

// Inicializar servidor con configuraciones optimizadas
const startServer = async () => {
  try {
    await redisService.connect();
    
    const server = app.listen(port, host, () => {
      console.log(`Servidor corriendo en http://${host}:${port}`);
      console.log(`Configurado para manejar payloads de hasta ${MAX_PAYLOAD}`);
      console.log(`Timeout configurado a ${TIMEOUT/1000} segundos`);
    });

    // Configurar timeouts extendidos del servidor
    server.timeout = TIMEOUT;
    server.keepAliveTimeout = TIMEOUT;
    server.headersTimeout = TIMEOUT + 1000;
    server.maxHeadersCount = 0; // Sin límite
    
    // Configurar límites de conexión
    server.maxConnections = 1000;
    
    // Habilitar keep-alive
    server.keepAliveTimeout = 120000; // 2 minutos
    server.headersTimeout = 120000; // 2 minutos

    // Manejar errores del servidor
    server.on('error', (error) => {
      console.error('Error en el servidor:', error);
    });

  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();