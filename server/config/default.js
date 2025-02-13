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
        username: 'marketing@autentic.com.co',
        password: 'Aut3ntic#2024'
      }
    },
    apiCertifirma:{
      baseUrl: 'https://datareport-certifirma.autenticsign.com',
      credentials: {
        username: 'test@test.com',
        password: '123456'
      }
    }
  };