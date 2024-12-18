export const config = {
    server: {
      port: 3001,
      host: 'localhost'
    },
    redis: {
      host: 'localhost',
      port: 6379,
      ttl: 3600 // tiempo en segundos para el caché
    },
    api: {
      baseUrl: 'http://3.13.156.101',
      credentials: {
        username: 'test@test.com',
        password: '123456'
      }
    }
  };