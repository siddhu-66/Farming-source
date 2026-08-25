// ============================================
// AGRIASSIST — SHARED TYPE DEFINITIONS
// ============================================

// ---- USER ROLES ----
export type UserRole = 'farmer' | 'buyer' | 'transport' | 'industry' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  address?: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street?: string;
  village?: string;
  district?: string;
  state: string;
  pincode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// ---- AUTH TYPES ----
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  address?: Address;
}

export interface OTPRequest {
  phone: string;
  otp: string;
}

// ---- FARM & CROP ----
export interface Farm {
  _id: string;
  farmerId: string;
  name: string;
  totalArea: number; // in acres
  irrigationType: 'drip' | 'sprinkler' | 'flood' | 'rainfed';
  soilType: string;
  address: Address;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Land {
  _id: string;
  farmId: string;
  farmerId: string;
  plotNumber: string;
  area: number;
  soilType: string;
  lastCrop?: string;
  coordinates?: GeoCoordinate[];
  createdAt: string;
}

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export type CropStatus = 'planted' | 'growing' | 'ready' | 'harvested' | 'listed';

export interface Crop {
  _id: string;
  farmId: string;
  farmerId: string;
  name: string;
  variety: string;
  quantity: number; // in kg
  unit: 'kg' | 'quintal' | 'ton';
  expectedHarvestDate: string;
  plantingDate: string;
  status: CropStatus;
  images: string[];
  estimatedPrice: number;
  organicCertified: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CropWaste {
  _id: string;
  farmId: string;
  farmerId: string;
  cropName: string;
  wasteType: 'straw' | 'husk' | 'leaves' | 'stem' | 'other';
  quantity: number;
  unit: 'kg' | 'ton';
  availableFrom: string;
  pricePerUnit: number;
  images: string[];
  status: 'available' | 'listed' | 'sold';
  createdAt: string;
}

// ---- MARKETPLACE ----
export type ListingStatus = 'draft' | 'active' | 'in_negotiation' | 'contracted' | 'harvested' | 'sold' | 'cancelled';
export type ListingType = 'crop' | 'waste';

export interface Listing {
  _id: string;
  type: ListingType;
  farmerId: string;
  farmer?: User;
  cropId?: string;
  wasteId?: string;
  title: string;
  description: string;
  quantity: number;
  unit: 'kg' | 'quintal' | 'ton';
  pricePerUnit: number;
  minOrderQuantity: number;
  status: ListingStatus;
  images: string[];
  tags: string[];
  address: Address;
  availableFrom: string;
  availableTill: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'counter' | 'expired' | 'withdrawn';

export interface Offer {
  _id: string;
  listingId: string;
  listing?: Listing;
  buyerId?: string;
  industryId?: string;
  buyer?: User;
  offeredPrice: number;
  quantity: number;
  message?: string;
  status: OfferStatus;
  counterPrice?: number;
  counterMessage?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export type ContractStatus = 'draft' | 'signed' | 'active' | 'completed' | 'disputed' | 'cancelled';

export interface Contract {
  _id: string;
  offerId: string;
  listingId: string;
  farmerId: string;
  buyerId?: string;
  industryId?: string;
  farmer?: User;
  buyer?: User;
  title: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  deliveryDate: string;
  deliveryAddress: Address;
  status: ContractStatus;
  terms: string;
  pdfUrl?: string;
  signatures: {
    farmer?: { signedAt: string };
    buyer?: { signedAt: string };
    industry?: { signedAt: string };
  };
  createdAt: string;
  updatedAt: string;
}

// ---- ORDERS ----
export type OrderStatus =
  | 'contract_signed'
  | 'harvesting'
  | 'quality_check'
  | 'transport_booked'
  | 'vehicle_assigned'
  | 'pickup'
  | 'in_transit'
  | 'delivered'
  | 'payment_pending'
  | 'payment_done'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export interface Order {
  _id: string;
  contractId: string;
  farmerId: string;
  buyerId?: string;
  industryId?: string;
  transportId?: string;
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
  paymentStatus: 'pending' | 'partial' | 'completed';
  totalAmount: number;
  paidAmount: number;
  invoiceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  timestamp: string;
  note?: string;
  actor: string;
}

// ---- PAYMENT ----
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  _id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  receiptUrl?: string;
  note?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Invoice {
  _id: string;
  orderId: string;
  contractId: string;
  invoiceNumber: string;
  farmerId: string;
  buyerId?: string;
  industryId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

// ---- TRANSPORT ----
export type VehicleType = 'truck' | 'mini_truck' | 'tractor' | 'tempo' | 'container';
export type VehicleStatus = 'available' | 'on_trip' | 'maintenance' | 'inactive';

export interface Vehicle {
  _id: string;
  transporterId: string;
  registrationNumber: string;
  type: VehicleType;
  capacity: number;
  capacityUnit: 'kg' | 'ton';
  model: string;
  year: number;
  status: VehicleStatus;
  driverId?: string;
  images: string[];
  documents: string[];
  currentLocation?: GeoCoordinate;
  createdAt: string;
}

export interface Driver {
  _id: string;
  transporterId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  avatar?: string;
  isVerified: boolean;
  vehicleId?: string;
  rating: number;
  totalTrips: number;
  createdAt: string;
}

export type BookingStatus = 'requested' | 'accepted' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

export interface TransportBooking {
  _id: string;
  orderId: string;
  farmerId: string;
  transporterId?: string;
  vehicleId?: string;
  driverId?: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  pickupDate: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  cargo: string;
  weight: number;
  status: BookingStatus;
  fare?: number;
  distance?: number;
  route?: GeoCoordinate[];
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  _id: string;
  bookingId: string;
  vehicleId: string;
  driverId: string;
  startTime: string;
  endTime?: string;
  distanceCovered: number;
  currentLocation?: GeoCoordinate;
  checkpoints: TripCheckpoint[];
  status: 'active' | 'completed' | 'cancelled';
}

export interface TripCheckpoint {
  location: GeoCoordinate;
  timestamp: string;
  note?: string;
}

// ---- INDUSTRY ----
export interface Factory {
  _id: string;
  industryId: string;
  name: string;
  type: string;
  address: Address;
  capacity: number;
  specializations: string[];
  images: string[];
  isVerified: boolean;
  createdAt: string;
}

export interface Procurement {
  _id: string;
  industryId: string;
  factoryId: string;
  listingId: string;
  farmerId: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  qualityGrade?: 'A' | 'B' | 'C';
  notes?: string;
  createdAt: string;
}

export interface InventoryItem {
  _id: string;
  factoryId: string;
  industryId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  warehouseId: string;
  expiryDate?: string;
  batchNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  _id: string;
  factoryId: string;
  industryId: string;
  name: string;
  address: Address;
  capacity: number;
  usedCapacity: number;
  type: 'cold_storage' | 'dry' | 'silos' | 'general';
  createdAt: string;
}

// ---- NOTIFICATIONS ----
export type NotificationType =
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'contract_signed'
  | 'order_status'
  | 'transport_assigned'
  | 'payment_received'
  | 'weather_alert'
  | 'system'
  | 'chat';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ---- CHAT ----
export interface ChatMessage {
  _id: string;
  roomId: string;
  senderId: string;
  sender?: Pick<User, '_id' | 'name' | 'avatar' | 'role'>;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice';
  fileUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatRoom {
  _id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  relatedOrder?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- WEATHER ----
export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  pressure: number;
  visibility: number;
  uvIndex?: number;
  sunrise: number;
  sunset: number;
  lat: number;
  lon: number;
  city: string;
  country: string;
  timestamp: number;
}

export interface WeatherForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  rainChance: number;
}

// ---- AI ----
export interface AIMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface AIChatSession {
  _id: string;
  userId: string;
  messages: AIMessage[];
  context?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CropRecommendation {
  cropName: string;
  variety: string;
  confidence: number;
  reason: string;
  expectedYield: string;
  marketPrice: string;
  growingPeriod: string;
}

export interface DiseaseDetectionResult {
  disease: string;
  confidence: number;
  description: string;
  treatment: string[];
  prevention: string[];
  severity: 'low' | 'medium' | 'high';
}

// ---- GOVERNMENT SCHEMES ----
export interface GovernmentScheme {
  _id: string;
  title: string;
  description: string;
  ministry: string;
  eligibility: string;
  benefits: string;
  applicationUrl: string;
  deadline?: string;
  targetRoles: UserRole[];
  state?: string;
  isActive: boolean;
  createdAt: string;
}

// ---- AUDIT LOGS ----
export interface AuditLog {
  _id: string;
  userId: string;
  user?: Pick<User, '_id' | 'name' | 'role'>;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

// ---- ANALYTICS ----
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeListings: number;
  pendingOffers: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

// ---- API RESPONSE ----
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ---- SOCKET.IO EVENTS ----
export interface ServerToClientEvents {
  'new_message': (message: ChatMessage) => void;
  'notification': (notification: Notification) => void;
  'order_update': (data: { orderId: string; status: OrderStatus }) => void;
  'location_update': (data: { bookingId: string; location: GeoCoordinate }) => void;
  'offer_update': (data: { offerId: string; status: OfferStatus }) => void;
  'user_online': (userId: string) => void;
  'user_offline': (userId: string) => void;
  'typing': (data: { roomId: string; userId: string }) => void;
  'stop_typing': (data: { roomId: string; userId: string }) => void;
}

export interface ClientToServerEvents {
  'join_room': (roomId: string) => void;
  'leave_room': (roomId: string) => void;
  'send_message': (data: { roomId: string; content: string; type?: string }) => void;
  'typing': (roomId: string) => void;
  'stop_typing': (roomId: string) => void;
  'send_location': (data: { bookingId: string; location: GeoCoordinate }) => void;
  'mark_read': (data: { roomId: string; messageId: string }) => void;
}
