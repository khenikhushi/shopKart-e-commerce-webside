const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const baseUrl = (process.env.BASE_URL || 'http://localhost:5000')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/$/, '');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ShopKart-e-commerce-webside Backend API',
      version: '1.0.0',
      description: `
# ShopKart-e-commerce-webside Backend API Documentation

Complete REST API documentation for the ShopKart-e-commerce-webside platform. This API provides endpoints for user authentication, product browsing, cart management, order processing, and administrative operations.

## Features
- **User Authentication**: JWT-based authentication with secure token management
- **Product Catalog**: Browse categories, subcategories, filters, and products
- **Shopping Cart**: Add, update, and manage cart items
- **Order Management**: Place orders, track status, and cancel orders
- **Admin Panel**: Manage categories, products, users, and orders
- **Seller Dashboard**: Product listing, inventory, and order fulfillment

## API Base URL
\`http://localhost:5000\`

## Authentication
All protected endpoints require a JWT token in the Authorization header:
\`Authorization: Bearer YOUR_JWT_TOKEN\`

## Response Format

### Success Response
All successful API responses follow this format:
\`\`\`json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
\`\`\`

### Paginated Response
List endpoints return paginated results:
\`\`\`json
{
  "success": true,
  "message": "Records retrieved successfully",
  "data": { "items": [] },
  "pagination": {
    "totalItems": 100,
    "totalPages": 5,
    "currentPage": 1,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
\`\`\`

### Error Response
Errors include appropriate status codes and error details:
\`\`\`json
{
  "success": false,
  "message": "Error message",
  "errors": null
}
\`\`\`

## Error Handling
Errors are returned with appropriate HTTP status codes and error messages.

## Rate Limiting
API requests are rate limited to prevent abuse. Check headers for rate limit information.

## Support
For API support and issues, please contact the development team.
      `,
      contact: {
        name: 'API Support',
        email: 'support@shopkart-e-commerce-webside.com',
        url: 'https://shopkart-e-commerce-webside.com/support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      termsOfService: 'https://shopkart-e-commerce-webside.com/terms',
      'x-logo': {
        url: 'https://shopkart-e-commerce-webside.com/logo.png',
        altText: 'ShopKart-e-commerce-webside API Logo',
      },
    },
    externalDocs: {
      description: 'Find more info about ShopKart-e-commerce-webside API',
      url: 'https://docs.shopkart-e-commerce-webside.com',
    },
    servers: [
      {
        url: baseUrl,
        description: 'Development Server',
        variables: {
          protocol: {
            enum: ['http', 'https'],
            default: 'http',
          },
          host: {
            default: 'localhost:5000',
          },
        },
      },
      {
        url: 'https://api.shopkart-e-commerce-webside.com',
        description: 'Production Server',
      },
      {
        url: 'https://staging-api.shopkart-e-commerce-webside.com',
        description: 'Staging Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token for authentication. Obtain from /auth/login endpoint.',
        },
      },
      responses: {
        SuccessResponse: {
          description: 'Request completed successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Success',
              },
              example: {
                success: true,
                message: 'Operation successful',
                data: {},
              },
            },
          },
        },
        CreatedResponse: {
          description: 'Resource created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Success',
              },
              example: {
                success: true,
                message: 'Resource created successfully',
                data: {},
              },
            },
          },
        },
        AuthResponse: {
          description: 'Authentication successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Authentication successful' },
                  data: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                      token: {
                        type: 'string',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                      },
                    },
                  },
                },
              },
              example: {
                success: true,
                message: 'Authentication successful',
                data: {
                  user: {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    name: 'John Doe',
                    email: 'john@example.com',
                    slug: 'john-doe',
                    role: 'user',
                    isActive: true,
                    createdAt: '2026-05-12T10:00:00.000Z',
                  },
                  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
              },
            },
          },
        },
        PaginatedResponse: {
          description: 'Paginated list retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Records retrieved successfully' },
                  data: {
                    type: 'object',
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      totalItems: { type: 'integer', example: 54 },
                      totalPages: { type: 'integer', example: 3 },
                      currentPage: { type: 'integer', example: 1 },
                      limit: { type: 'integer', example: 20 },
                      hasNextPage: { type: 'boolean', example: true },
                      hasPrevPage: { type: 'boolean', example: false },
                    },
                  },
                },
              },
              example: {
                success: true,
                message: 'Records retrieved successfully',
                data: {},
                pagination: {
                  totalItems: 0,
                  totalPages: 0,
                  currentPage: 1,
                  limit: 20,
                  hasNextPage: false,
                  hasPrevPage: false,
                },
              },
            },
          },
        },
        ErrorResponse: {
          description: 'Unexpected server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'An error occurred',
                errors: null,
              },
            },
          },
        },
        BadRequestResponse: {
          description: 'Invalid request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Invalid request',
                errors: null,
              },
            },
          },
        },
        ValidationErrorResponse: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Validation failed',
                errors: {
                  email: ['Email is required'],
                },
              },
            },
          },
        },
        UnauthorizedResponse: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Unauthorized',
                errors: null,
              },
            },
          },
        },
        ForbiddenResponse: {
          description: 'Access denied',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Forbidden',
                errors: null,
              },
            },
          },
        },
        NotFoundResponse: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Resource not found',
                errors: null,
              },
            },
          },
        },
        ConflictResponse: {
          description: 'Request conflict',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Conflict',
                errors: null,
              },
            },
          },
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'An error occurred',
            },
            errors: {
              type: 'object',
              nullable: true,
              example: null,
            },
          },
          required: ['success', 'message'],
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
              nullable: true,
            },
          },
          required: ['success', 'message'],
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            slug: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['user', 'seller', 'admin'],
            },
            isActive: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            slug: {
              type: 'string',
            },
            price: {
              type: 'number',
              format: 'decimal',
            },
            description: {
              type: 'string',
            },
            category: {
              type: 'string',
            },
            brand: {
              type: 'string',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            slug: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            },
            total: {
              type: 'number',
              format: 'decimal',
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
  },
  apis: [
    // Authentication
    path.join(__dirname, '../routes/auth.routes.js'),
    
    // User Routes
    path.join(__dirname, '../routes/user/index.js'),
    path.join(__dirname, '../routes/user/product.routes.js'),
    path.join(__dirname, '../routes/user/cart.routes.js'),
    path.join(__dirname, '../routes/user/order.routes.js'),
    
    // Admin Routes
    path.join(__dirname, '../routes/admin/index.js'),
    path.join(__dirname, '../routes/admin/dashboard.routes.js'),
    path.join(__dirname, '../routes/admin/category.routes.js'),
    path.join(__dirname, '../routes/admin/subCategory.routes.js'),
    path.join(__dirname, '../routes/admin/filter.routes.js'),
    path.join(__dirname, '../routes/admin/product.routes.js'),
    path.join(__dirname, '../routes/admin/order.routes.js'),
    path.join(__dirname, '../routes/admin/user.routes.js'),
    
    // Seller Routes
    path.join(__dirname, '../routes/seller/index.js'),
    path.join(__dirname, '../routes/seller/product.routes.js'),
    path.join(__dirname, '../routes/seller/order.routes.js'),
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
