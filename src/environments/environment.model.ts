export interface Environment {
  production: boolean;
  environmentName: 'development' | 'production';
  apiBaseUrl: string;
  appName: string;
}
