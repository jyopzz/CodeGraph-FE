import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AgentKeyService {

  private readonly DB_NAME = 'codegraph-agent';
  private readonly STORE_NAME = 'keys';
  private readonly KEY_ID = 'agent-key-pair';

  private keyPair: CryptoKeyPair | null = null;

  async generateKeyPair(): Promise<void> {
    this.keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      false,
      ['sign', 'verify']
    );

    await this.saveKeyPair(this.keyPair);
  }

  async loadKeyPair(): Promise<boolean> {
    if (this.keyPair) {
      return true;
    }

    try {
      const stored = await this.readKeyPair();

      if (!stored) {
        return false;
      }

      this.keyPair = stored;
      return true;
    } catch (error) {
      console.error('Failed to load Agent key pair:', error);
      return false;
    }
  }

  async getPublicKeyJwk(): Promise<JsonWebKey> {
    if (!this.keyPair) {
      throw new Error('Agent key pair has not been loaded');
    }

    return crypto.subtle.exportKey(
      'jwk',
      this.keyPair.publicKey
    );
  }

  async sign(challenge: string): Promise<string> {
    if (!this.keyPair) {
      throw new Error('Agent key pair has not been loaded');
    }

    const data = new TextEncoder().encode(challenge);

    const signature = await crypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: 'SHA-256',
      },
      this.keyPair.privateKey,
      data
    );

    return this.arrayBufferToBase64Url(signature);
  }

  hasKeyPair(): boolean {
    return this.keyPair !== null;
  }

  async clear(): Promise<void> {
    this.keyPair = null;
    await this.deleteKeyPair();
  }

  private async saveKeyPair(
    keyPair: CryptoKeyPair
  ): Promise<void> {

    const db = await this.openDatabase();

    return new Promise((resolve, reject) => {

      const transaction =
        db.transaction(this.STORE_NAME, 'readwrite');

      transaction.objectStore(this.STORE_NAME)
        .put(keyPair, this.KEY_ID);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private async readKeyPair(): Promise<CryptoKeyPair | null> {

    const db = await this.openDatabase();

    return new Promise((resolve, reject) => {

      const transaction =
        db.transaction(this.STORE_NAME, 'readonly');

      const request =
        transaction.objectStore(this.STORE_NAME)
          .get(this.KEY_ID);

      request.onsuccess = () => {
        resolve(request.result ?? null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private async deleteKeyPair(): Promise<void> {

    const db = await this.openDatabase();

    return new Promise((resolve, reject) => {

      const transaction =
        db.transaction(this.STORE_NAME, 'readwrite');

      transaction.objectStore(this.STORE_NAME)
        .delete(this.KEY_ID);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private openDatabase(): Promise<IDBDatabase> {

    return new Promise((resolve, reject) => {

      const request =
        indexedDB.open(this.DB_NAME, 1);

      request.onupgradeneeded = () => {

        const db = request.result;

        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private arrayBufferToBase64Url(
    buffer: ArrayBuffer
  ): string {

    const bytes = new Uint8Array(buffer);

    let binary = '';

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}