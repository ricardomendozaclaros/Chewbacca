import {redisService} from '../lib/redis.js'
import { apiService } from '../services/apiServices.js'

class UserController{
    async getUserByDateRange(req,res){
        const {startDate , endDate} = req.query;
        const cacheKey = `users:${startDate}:${endDate}:`

        try {
            const cachedData = await redisService.get(cacheKey);
            if(cacheKey){
                console.log('✅ Usando datos de usuarios del caché');
                return res.json(JSON.parse(cachedData));
            }

            //Si no hay en reddis entonces a la api
            const data = await apiService.fetchUsersByDateRange(startDate,endDate);
            await redisService.setEx(cacheKey , JSON.stringify(data));

            res.json();


        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export const userController  = new UserController();