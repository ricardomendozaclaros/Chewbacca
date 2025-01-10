// server/controller/signatureController.js
import { redisService } from '../lib/redis.js';
import { apiService } from '../services/apiServices.js';

class SignatureController {
  async getSignaturesByDateRange(req, res) {
    const { startDate, endDate, forceRefresh } = req.query;
    
    try {
      // Generar la clave del caché anual
      const yearStart = new Date(startDate);
      yearStart.setFullYear(yearStart.getFullYear());
      const yearEnd = new Date(yearStart);
      yearEnd.setFullYear(yearStart.getFullYear() + 1);
      
      const annualCacheKey = `signatures:${yearStart.toISOString().split('T')[0]}:${yearEnd.toISOString().split('T')[0]}`;

      let data;
      // Intentar obtener datos del caché anual
      const cachedData = await redisService.get(annualCacheKey);

      if (cachedData && !forceRefresh) {
        console.log('✅ Usando datos del caché trimestral');
        data = JSON.parse(cachedData);
      } else {
        // Si no hay caché o es forceRefresh, obtener datos de la API
        console.log('🔄 Obteniendo datos frescos de la API');
        data = await apiService.fetchSignatureProcesses(
          yearStart.toISOString().split('T')[0], 
          yearEnd.toISOString().split('T')[0]
        );
        
        // Guardar en caché por 24 horas (86400 segundos)
        const dataString = JSON.stringify(data);
        await redisService.setEx(annualCacheKey,86400, dataString);
        console.log('💾 Datos Trimestrales guardados en caché');
      }

      // Filtrar los datos para el rango solicitado
      const filteredData = data.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
      });

      res.json(filteredData);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Método para limpiar cachés antiguos
  async cleanOldCaches() {
    try {
      const keys = await redisService.keys('signatures:*');
      const currentDate = new Date();
      
      for (const key of keys) {
        const [, startDate] = key.split(':');
        const cacheDate = new Date(startDate);
        
        // Si el caché es de un año anterior, eliminarlo
        if (cacheDate.getFullYear() < currentDate.getFullYear()) {
          await redisService.del(key);
          console.log(`🗑️ Caché antiguo eliminado: ${key}`);
        }
      }
    } catch (error) {
      console.error('Error limpiando cachés antiguos:', error);
    }
  }
}

export const signatureController = new SignatureController();