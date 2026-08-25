export interface User {
  id: string;
  name: string;
  email: string;
  role: 'FARMER' | 'BUYER' | 'TRANSPORT' | 'INDUSTRY' | 'ADMIN';
  avatar?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface Crop {
  id: string;
  name: string;
  variety: string;
  quantity: number;
  price: number;
  status: 'available' | 'sold' | 'in_transit';
}

export interface Contract {
  id: string;
  farmerId: string;
  buyerId: string;
  cropId: string;
  price: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Listing {
  id: string;
  farmerId: string;
  cropName: string;
  qualityGrade?: string;
  pricePerUnit: number;
  unit: string;
  quantity: number;
  sellingMode?: string;
  status: string;
  images?: string[];
  organicCertified?: boolean;
  views?: number;
  [key: string]: any;
}
