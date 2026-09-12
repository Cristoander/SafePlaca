export type LicensePlan = 'demo' | 'pro_mensal' | 'pro_anual' | 'vitalicio';

export interface LicenseData {
  plan: LicensePlan;
  isActive: boolean;
  licenseKey: string;
  clientName: string;
  hardwareId: string;
  activatedAt: string;
  expiresAt: string; // ISO string ou 'lifetime'
  daysRemaining: number;
}
