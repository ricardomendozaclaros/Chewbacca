import { redisService } from '../lib/redis.js';
import { apiService } from '../services/apiServices.js';

class CustomerAccountController {
  async getCustomerAccounts(req, res) {
    const { limit = 4000, forceRefresh } = req.query;
   
    try {
      const cacheKey = `customer-accounts:${limit}`;
      let data;
      
      // Intentar obtener datos del caché
      const cachedData = await redisService.get(cacheKey);
      if (cachedData && !forceRefresh) {
        console.log('✅ Usando datos de cuentas de clientes del caché');
        data = JSON.parse(cachedData);
      } else {
        // Si no hay caché o es forceRefresh, obtener datos de la API
        console.log('🔄 Obteniendo datos frescos de la API');
        data = await apiService.fetchCustomerAccounts(limit);
       
        // Guardar en caché por 24 horas (86400 segundos)
        await redisService.setEx(cacheKey, 86400, JSON.stringify(data));
        console.log('💾 Datos de cuentas guardados en caché');
      }

      res.json(data);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const customerAccountController = new CustomerAccountController();