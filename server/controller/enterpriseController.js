import { redisService } from '../lib/redis.js';
import { apiService } from '../services/apiServices.js';

class EnterpriseController {
  async getEnterprises(req, res) {
    try {
      const cacheKey = 'enterprises';
      let data;
      
      // Intentar obtener datos del caché
      const cachedData = await redisService.get(cacheKey);
      if (cachedData) {
        console.log('✅ Usando datos de empresas del caché');
        data = JSON.parse(cachedData);
      } else {
        // Si no hay caché, obtener datos de la API
        console.log('🔄 Obteniendo datos frescos de la API de empresas');
        data = await apiService.fetchEnterprises();
       
        // Guardar en caché por 24 horas (86400 segundos)
        const dataString = JSON.stringify(data);
        await redisService.setEx(cacheKey, 86400, dataString);
        console.log('💾 Datos de empresas guardados en caché');
      }
      
      res.json(data);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const enterpriseController = new EnterpriseController();