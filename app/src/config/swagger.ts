import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StarPets API',
      version: '1.0.0',
      description: 'API для управления балансом пользователей',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/interfaces/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options); 