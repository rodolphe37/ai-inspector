export class QuotaBlockedError extends Error {
  constructor() {
    super('Scan quota reached.');
    this.name = 'QuotaBlockedError';
  }
}

export class PlanLimitError extends Error {
  feature: string;
  constructor(message: string, feature: string) {
    super(message);
    this.name = 'PlanLimitError';
    this.feature = feature;
  }
}
