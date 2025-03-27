export interface DocumentTypeOption {
  value: string;
  label: string;
}

export interface VerificationProgress {
  received: boolean;
  preprocessing: boolean;
  aiVerification: boolean;
  blockchainStorage: boolean;
}

export type VerificationStep = keyof VerificationProgress;

export interface BlockchainStatus {
  networkStatus: string;
  lastSync: Date;
  securityLevel: string;
}

export interface DocumentStats {
  verifiedCount: number;
  pendingFailedCount: number;
  storageUsed: number;
}
