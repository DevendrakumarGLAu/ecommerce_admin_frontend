export interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  { label: 'Products', icon: 'inventory_2', route: '/products' },
  { label: 'Categories', icon: 'category', route: '/categories' },
  { label: 'Media', icon: 'perm_media', route: '/media' },
  { label: 'SEO', icon: 'travel_explore', route: '/seo' },
  { label: 'Users', icon: 'group', route: '/users', adminOnly: true },
  { label: 'Settings', icon: 'settings', route: '/settings', adminOnly: true }
];
