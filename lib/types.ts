// AgriSupply Chain & Smart Cold-Chain Logistics Platform - Type Definitions

export type UserRole =
  | 'SUPER_ADMIN'
  | 'FARMER'
  | 'TRANSPORTER'
  | 'WAREHOUSE_ADMIN'
  | 'RETAILER';

export type SupplyStage =
  | 'HARVESTED'
  | 'QUALITY_CHECK'
  | 'READY_FOR_TRANSPORT'
  | 'IN_TRANSIT'
  | 'COLD_STORAGE'
  | 'DISTRIBUTION'
  | 'DELIVERED';

export type QualityGrade = 'Grade A' | 'Grade B' | 'Grade C' | 'Rejected';
export type QualityStatus = 'PENDING' | 'APPROVED' | 'CONDITIONAL' | 'REJECTED';

export type ShipmentStatus =
  | 'PLANNED'
  | 'IN_TRANSIT'
  | 'NEAR_DESTINATION'
  | 'ARRIVED'
  | 'DELIVERED'
  | 'DELAYED';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export type NotificationPriority = 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
export type NotificationType =
  | 'SHIPMENT'
  | 'GPS'
  | 'GEOFENCE'
  | 'IOT'
  | 'TEMPERATURE'
  | 'ORDER'
  | 'PAYMENT'
  | 'QUALITY'
  | 'SYSTEM'
  | 'SYNC';

export interface UserSession {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatar?: string | null;
  tenantName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: UserSession;
}

export interface GeofenceDefinition {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  status: string;
}

export interface SensorTelemetry {
  sensorId: string;
  sensorCode: string;
  coldStorageId: string;
  coldStorageName: string;
  warehouseName: string;
  temperature: number;
  humidity: number;
  isAlert: boolean;
  alertReason?: string | null;
  timestamp: string;
}

export interface GPSBreadcrumb {
  id?: string;
  shipmentId?: string;
  vehicleId: string;
  vehicleNumber?: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
}

export interface SyncItem {
  id: string;
  userId: string;
  deviceId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'SHIPMENT' | 'INSPECTION' | 'GPS' | 'PROOF';
  payload: any;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  error?: string;
  createdAt: string;
  syncedAt?: string;
}

export interface ServerPaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
  status?: string;
  stage?: string;
  type?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface RealtimeMessage {
  type:
    | 'iot:reading'
    | 'iot:alert'
    | 'vehicle:location'
    | 'vehicle:geofence-enter'
    | 'vehicle:geofence-exit'
    | 'shipment:status'
    | 'notification:new'
    | 'sync:completed';
  payload: any;
  timestamp: string;
}
