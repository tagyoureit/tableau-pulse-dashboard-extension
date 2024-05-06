export interface TokenEntry {
  expirationTime: number; 
  token: string;
  userId: string
}

class TokenManager {
  private tokenMap: Record<string, TokenEntry> = {};

  constructor() {}

  addToken(caClientId: string, caSecretId: string, userId: string, expirationTime: number, token: string): void {
      const key = this.generateKey(caClientId, caSecretId);
      this.tokenMap[key] = { userId, expirationTime, token };
  }

  getToken(caClientId: string, caSecretId: string): {userId: string, token:string} | null {
    this.deleteExpiredTokens();
    const key = this.generateKey(caClientId, caSecretId);
    const tokenEntry = this.tokenMap[key];

    // Check if token entry exists and is not expired
    if (tokenEntry && tokenEntry.expirationTime > Math.floor(new Date().getTime() / 1000)) {
        return {userId:tokenEntry.userId, token:tokenEntry.token};
    } else {

        return null;
    }
}
 deleteExpiredTokens(): void {
  // Iterate through all entries in the map
  for (const [key, entry] of Object.entries(this.tokenMap)) {
      // Check if the entry's expiration time is less than the current time
      if (entry.expirationTime < Math.floor(new Date().getTime() / 1000)) {
          // If expired, delete the entry from the map
          delete this.tokenMap[key];
      }
  }
}

  removeToken(caClientId: string, caSecretId: string): void {
      const key = this.generateKey(caClientId, caSecretId);
      delete this.tokenMap[key];
  }

  private generateKey(caClientId: string, caSecretId: string): string {
      return `${caClientId}:${caSecretId}`;
  }
}

export const tokenManager = new TokenManager();