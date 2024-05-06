"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenManager = void 0;
class TokenManager {
    tokenMap = {};
    constructor() { }
    addToken(caClientId, caSecretId, userId, expirationTime, token) {
        const key = this.generateKey(caClientId, caSecretId);
        this.tokenMap[key] = { userId, expirationTime, token };
    }
    getToken(caClientId, caSecretId) {
        this.deleteExpiredTokens();
        const key = this.generateKey(caClientId, caSecretId);
        const tokenEntry = this.tokenMap[key];
        // Check if token entry exists and is not expired
        if (tokenEntry && tokenEntry.expirationTime > Math.floor(new Date().getTime() / 1000)) {
            return { userId: tokenEntry.userId, token: tokenEntry.token };
        }
        else {
            return null;
        }
    }
    deleteExpiredTokens() {
        // Iterate through all entries in the map
        for (const [key, entry] of Object.entries(this.tokenMap)) {
            // Check if the entry's expiration time is less than the current time
            if (entry.expirationTime < Math.floor(new Date().getTime() / 1000)) {
                // If expired, delete the entry from the map
                delete this.tokenMap[key];
            }
        }
    }
    removeToken(caClientId, caSecretId) {
        const key = this.generateKey(caClientId, caSecretId);
        delete this.tokenMap[key];
    }
    generateKey(caClientId, caSecretId) {
        return `${caClientId}:${caSecretId}`;
    }
}
exports.tokenManager = new TokenManager();
//# sourceMappingURL=TokenManager.js.map