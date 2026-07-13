export interface Environment {
  production: boolean;
  environmentName: 'development' | 'production';
  apiBaseUrl: string;
  appName: string;
}

export const environment: Environment = {
  production: false,
  environmentName: 'development',
  // apiBaseUrl: 'http://localhost:8000/api/v1',
  apiBaseUrl:'https://ecommerce-admin-backend-d3gh.onrender.com/api/v1',
  appName: 'Firozabad Bangles'
};
