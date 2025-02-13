//server/controller/signatureController.js
import { redisService } from '../lib/redis.js';
import { apiServiceCertifirma } from '../services/apiServiceCertifirma.js';

class SignatureCertifirmaController {
  async getSignaturesByDateRange(req, res) {
    try {
      let { startDate, endDate } = req.query;
      
      // Si no hay fechas, usar últimas 2 semanas
      if (!startDate || !endDate) {
        const today = new Date();
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(today.getDate() - 14);
        
        startDate = twoWeeksAgo.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
      }

      // Crear clave de caché usando el rango de fechas
      const cacheKey = `signaturesCertifirma:${startDate}:${endDate}`;
      
      // Intentar obtener datos del caché
      const cachedData = await redisService.get(cacheKey);
      
      if (cachedData) {
        console.log('✅ Usando datos del caché');
        return res.json(JSON.parse(cachedData));
      }

      // Si no hay caché, obtener datos de la API
      console.log('🔄 Obteniendo datos frescos de la API');
      const freshData = await apiServiceCertifirma.fetchSignatureProcessesCertifirma(startDate, endDate);
      
      // Guardar en caché por 12 horas (43200 segundos) ya que son datos más recientes
      await redisService.setEx(cacheKey, 43200, JSON.stringify(freshData));
      console.log('💾 Datos guardados en caché');

      res.json(freshData);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Método para limpiar cachés antiguos
  async cleanOldCaches() {
    try {
      const keys = await redisService.keys('signaturesCertifirma:*');
      const today = new Date();
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(today.getDate() - 14);

      for (const key of keys) {
        const [, dateStr] = key.split(':');
        const cacheDate = new Date(dateStr);
        
        // Mantener solo cachés de las últimas 2 semanas
        if (cacheDate < twoWeeksAgo) {
          await redisService.del(key);
          console.log(`🗑️ Caché antiguo eliminado: ${key}`);
        }
      }
    } catch (error) {
      console.error('Error limpiando cachés antiguos:', error);
    }
  }
}

export const signatureCertifirmaController = new SignatureCertifirmaController();