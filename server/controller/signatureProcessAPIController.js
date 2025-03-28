import { apiService } from '../services/apiServices.js';

export const signatureProcessesController = {
  async getCountSigningCore(req, res) {
    try {
      const { clientID, startDate, endDate } = req.query;
      console.log('Received params:', { clientID, startDate, endDate });
      
      if (!clientID || !startDate || !endDate) {
        return res.status(400).json({
          error: 'Se requieren los parámetros clientID, startDate y endDate',
          received: { clientID, startDate, endDate }
        });
      }

      const result = await apiService.fetchCountSigningCore(clientID, startDate, endDate);
      console.log('API response:', result);
      res.json(result);
    } catch (error) {
      console.error('Error en getCountSigningCore:', error);
      res.status(500).json({
        error: 'Error al obtener el conteo de SigningCore',
        details: error.message
      });
    }
  },

  async getCountMPL(req, res) {
    try {
      const { clientID, startDate, endDate } = req.query;
      
      if (!clientID || !startDate || !endDate) {
        return res.status(400).json({
          error: 'Se requieren los parámetros clientID, startDate y endDate'
        });
      }

      const result = await apiService.fetchCountMPL(clientID, startDate, endDate);
      res.json(result);
    } catch (error) {
      console.error('Error en getCountMPL:', error);
      res.status(500).json({
        error: 'Error al obtener el conteo de MPL',
        details: error.message
      });
    }
  },

  async getCountPromissoryNote(req, res) {
    try {
      const { clientID, startDate, endDate } = req.query;
      
      if (!clientID || !startDate || !endDate) {
        return res.status(400).json({
          error: 'Se requieren los parámetros clientID, startDate y endDate'
        });
      }

      const result = await apiService.fetchCountPromissoryNote(clientID, startDate, endDate);
      res.json(result);
    } catch (error) {
      console.error('Error en getCountPromissoryNote:', error);
      res.status(500).json({
        error: 'Error al obtener el conteo de PromissoryNote',
        details: error.message
      });
    }
  }
};