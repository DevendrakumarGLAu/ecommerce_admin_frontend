import { User, UserRole } from '../../core/models/auth.model';

export type { User, UserRole };

export interface UserFilters {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
}
