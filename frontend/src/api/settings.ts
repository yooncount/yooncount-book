import apiClient from './client';

export interface FinnhubKeyStatus {
  configured: boolean;
}

export const settingsApi = {
  getFinnhubKeyStatus: (): Promise<FinnhubKeyStatus> =>
    apiClient.get('/settings/finnhub-api-key'),

  setFinnhubApiKey: (apiKey: string): Promise<void> =>
    apiClient.put('/settings/finnhub-api-key', { apiKey }),

  deleteFinnhubApiKey: (): Promise<void> =>
    apiClient.delete('/settings/finnhub-api-key'),
};
