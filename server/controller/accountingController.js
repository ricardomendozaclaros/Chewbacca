import { redisService } from '../lib/redis.js';
import { apiService } from '../services/apiServices.js';

class AccountingController {
  async getAccountingMovements(req, res) {
    const { startDate, endDate, concept, forceRefresh } = req.query;
   
    try {
      // Generar la clave del caché
      const cacheKey = `accounting:${startDate}:${endDate}:${concept}`;
      let data;

      // Intentar obtener datos del caché
      const cachedData = await redisService.get(cacheKey);
      if (cachedData && !forceRefresh) {
        console.log('✅ Usando datos de movimientos contables del caché');
        data = JSON.parse(cachedData);
      } else {
        // Si no hay caché o es forceRefresh, obtener datos de la API
        console.log('🔄 Obteniendo datos frescos de la API');
        data = await apiService.fetchAccountingMovements(startDate, endDate, concept);
       
        // Guardar en caché por 24 horas (86400 segundos)
        await redisService.setEx(cacheKey, 86400, JSON.stringify(data));
        console.log('💾 Datos de movimientos guardados en caché');
      }

      res.json(data);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const accountingController = new AccountingController();