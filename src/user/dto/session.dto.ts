export interface UserSession {
  step: UserSessionStep;
  enableVoice?: boolean;
  apiKey?: string;
}

export type UserSessionStep = 'ENABLE_VOICE' | 'API_KEY';
