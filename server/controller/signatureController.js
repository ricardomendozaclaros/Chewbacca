import { redisService } from '../lib/redis.js';
import { apiService } from '../services/apiService.js';

class SignatureController {
  async getSignaturesByDateRange(req, res) {
    const { startDate, endDate } = req.query;
    const cacheKey = `signatures:${startDate}:${endDate}`;

    try {
      // Intentar obtener del caché
      const cachedData = await redisService.get(cacheKey);
      if (cachedData) {
        console.log('✅ Usando datos del caché');
        return res.json(JSON.parse(cachedData));
      }

      // Si no hay caché, hacer la petición a la API
      const data = await apiService.fetchSignatureProcesses(startDate, endDate);
      
      // Guardar en caché
      await redisService.setEx(cacheKey, JSON.stringify(data));
      console.log('💾 Datos guardados en caché');
      
      res.json(data);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const signatureController = new SignatureController();