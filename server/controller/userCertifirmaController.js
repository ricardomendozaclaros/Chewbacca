import { redisService } from '../lib/redis.js';
import { apiServiceCertifirma } from '../services/apiServiceCertifirma.js';

class UserCertifirmaController {
  async getUsersCertifirmaByDateRange(req, res) {
    const { startDate, endDate, forceRefresh } = req.query;
   
    try {
      // Validar fechas
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Se requieren fechas de inicio y fin' });
      }

      // Usar directamente las fechas proporcionadas para la clave de caché
      const cacheKey = `usersCertifirma:${startDate}:${endDate}`;
      let data;
     
      // Intentar obtener datos del caché
      const cachedData = await redisService.get(cacheKey);
      if (cachedData && !forceRefresh) {
        console.log('✅ Usando datos de usuarios del caché');
        data = JSON.parse(cachedData);
      } else {
        // Si no hay caché o es forceRefresh, obtener datos de la API
        console.log('🔄 Obteniendo datos frescos de la API de usuarios');
        console.log(`🔄 Request URL: ${apiServiceCertifirma.BASE_URL}/User/DataRange?startDate=${startDate}&endDate=${endDate}`);
        
        data = await apiServiceCertifirma.fetchUsersByDateRange(startDate, endDate);
       
        // Guardar en caché por 24 horas (86400 segundos)
        await redisService.setEx(cacheKey, 86400, JSON.stringify(data));
        console.log('💾 Datos de usuarios guardados en caché');
      }
     
      // Ya no necesitamos filtrar porque obtenemos exactamente el rango solicitado
      res.json(data);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Método para limpiar cachés antiguos (ahora por rango de fecha)
  async cleanOldCaches() {
    try {
      const keys = await redisService.keys('usersCertifirma:*');
      const currentDate = new Date();
     
      for (const key of keys) {
        const [, startDate] = key.split(':');
        const cacheDate = new Date(startDate);
       
        // Mantener solo los últimos 3 meses de caché
        const monthsDiff = (currentDate.getMonth() + 12 * currentDate.getFullYear()) - 
                         (cacheDate.getMonth() + 12 * cacheDate.getFullYear());
        
        if (monthsDiff > 3) {
          await redisService.del(key);
          console.log(`🗑️ Caché antiguo eliminado: ${key}`);
        }
      }
    } catch (error) {
      console.error('Error limpiando cachés antiguos:', error);
    }
  }
}

export const userCertifirmaController = new UserCertifirmaController();