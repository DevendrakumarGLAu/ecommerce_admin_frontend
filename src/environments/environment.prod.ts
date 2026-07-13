import { Environment } from './environment';

export const environment: Environment = {
  production: true,
  environmentName: 'production',
  // Replace with the deployed FastAPI backend's base URL before shipping.
  // apiBaseUrl: 'https://api.firozabadbangles.com/api/v1',
  apiBaseUrl:'https://ecommerce-admin-backend-d3gh.onrender.com/api/v1',
  appName: 'Firozabad Bangles'
};
