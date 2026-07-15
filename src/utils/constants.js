// Centralized app constants for the mobile client.
//
// IMPORTANT: Update API_URL to point at your running backend.
//  - Android emulator -> use 10.0.2.2 instead of localhost
//    e.g. 'http://10.0.2.2:5000/api'
//  - Physical phone (Expo Go) -> use your computer's LAN IP
//    e.g. 'http://192.168.1.10:5000/api'
//  - Deployed backend -> use its public URL
//    e.g. 'https://your-backend.vercel.app/api'
export const API_URL = 'http://192.168.1.115:5000/api';

export const TOKEN_STORAGE_KEY = 'smartshopping_token';
export const USER_STORAGE_KEY = 'smartshopping_user';

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const PRODUCT_STATUS_LABELS = {
  pending_payment: 'Awaiting Payment',
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  sold: 'Sold',
};

export const PAYMENT_METHODS = [
  { value: 'easypaisa', label: 'EasyPaisa' },
  { value: 'bank_alfalah', label: 'Bank Alfalah' },
];

export const CONDITION_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'used', label: 'Used' },
  { value: 'refurbished', label: 'Refurbished' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
];

export const CURRENCY_SYMBOL = 'Rs. ';

export const MAX_IMAGE_UPLOAD_COUNT = 8;
