import express from "express";
import cors from "cors";
import process from "process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Import necesario para __dirname en ES Modules
import { config } from "./config/default.js";
import { redisService } from "./lib/redis.js";
import signatureRoutes from "./routes/signatures.js";
import userRoutes from "./routes/user.js";
import bodyParser from "body-parser";

// Configurar __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const { port, host } = config.server;

const CONFIGS_DIR = path.join(__dirname, "configs");

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// Middleware
app.use(cors());
app.use(express.json()); // Para manejar cuerpos JSON en las solicitudes

// Ruta para obtener configuración de una página
app.get("/api/config/:page", (req, res) => {
  const { page } = req.params;
  const filePath = path.join(CONFIGS_DIR, `${page}.json`);

  if (!fs.existsSync(filePath)) {
    const defaultConfig = { layout: [] };
    fs.writeFileSync(filePath, JSON.stringify(defaultConfig, null, 2), "utf-8");
    console.log(`Archivo creado: ${filePath}`);
    return res.json(defaultConfig);
  }

  const data = fs.readFileSync(filePath, "utf-8");
  return res.json(JSON.parse(data));
});

// Ruta para guardar configuración de una página
app.post("/api/config/:page", (req, res) => {
  const { page } = req.params;
  const layoutData = req.body;

  const filePath = path.join(CONFIGS_DIR, `${page}.json`);
  fs.writeFileSync(filePath, JSON.stringify(layoutData, null, 2), "utf-8");
  console.log(`Archivo actualizado: ${filePath}`);
  return res.json({ message: "Configuración actualizada exitosamente." });
});


// Rutas existentes
app.use("/api", signatureRoutes);
app.use("/api", userRoutes);

// Manejador para cerrar Redis al terminar
process.on("SIGTERM", async () => {
  await redisService.quit();
  process.exit(0);
});

// Inicializar servidor
const startServer = async () => {
  try {
    await redisService.connect();

    app.listen(port, host, () => {
      console.log(`Servidor corriendo en http://${host}:${port}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();
