import { appConfig } from '../config';
import { apiService } from './apiService';
import { mockService } from './mockService';

export const dataService = appConfig.dataSource === 'mock' ? mockService : apiService;
export const activeDataSource = appConfig.dataSource;
