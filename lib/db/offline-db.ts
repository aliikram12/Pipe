import Dexie, { Table } from 'dexie';

export interface OfflineSyncQueueItem {
  id?: number;
  localId?: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'SHIPMENT' | 'INSPECTION' | 'GPS' | 'PROOF' | 'ORDER';
  payload: any;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  errorMessage?: string;
  retryCount?: number;
  timestamp?: string;
  createdAt?: string;
  syncedAt?: string;
  userId?: string;
  deviceId?: string;
}

export interface OfflineDeliveryProof {
  id?: number;
  shipmentId: string;
  shipmentNumber: string;
  receiverName: string;
  signatureBase64: string;
  notes?: string;
  timestamp: string;
  synced: boolean;
}

export interface OfflineInspection {
  id?: number;
  batchId: string;
  batchNumber: string;
  grade: string;
  temperature: number;
  humidity: number;
  moisture: number;
  appearance: string;
  contamination: boolean;
  notes?: string;
  rejectionReason?: string;
  tempViolationExplanation?: string;
  status: string;
  timestamp: string;
  synced: boolean;
}

export class AgriOfflineDatabase extends Dexie {
  syncQueue!: Table<OfflineSyncQueueItem, number>;
  deliveryProofs!: Table<OfflineDeliveryProof, number>;
  inspections!: Table<OfflineInspection, number>;
  cachedShipments!: Table<any, string>;

  constructor() {
    super('AgriSupplyOfflineDB');
    this.version(1).stores({
      syncQueue: '++id, localId, entity, status, timestamp',
      deliveryProofs: '++id, shipmentId, synced, timestamp',
      inspections: '++id, batchId, synced, timestamp',
      cachedShipments: 'id, shipmentNumber, status',
    });
  }
}

export const offlineDb = typeof window !== 'undefined' ? new AgriOfflineDatabase() : null;

export async function addOperationToSyncQueue(
  entity: 'SHIPMENT' | 'INSPECTION' | 'GPS' | 'PROOF' | 'ORDER',
  operation: 'CREATE' | 'UPDATE' | 'DELETE',
  payload: any
): Promise<string> {
  if (!offlineDb) return '';
  const localId = `loc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  await offlineDb.syncQueue.add({
    localId,
    operation,
    entity,
    payload,
    status: 'PENDING',
    retryCount: 0,
    timestamp: new Date().toISOString(),
  });
  return localId;
}

export async function getPendingSyncCount(): Promise<number> {
  if (!offlineDb) return 0;
  return offlineDb.syncQueue.where('status').equals('PENDING').count();
}

export async function getAllPendingQueueItems(): Promise<OfflineSyncQueueItem[]> {
  if (!offlineDb) return [];
  return offlineDb.syncQueue.where('status').anyOf('PENDING', 'FAILED').toArray();
}
