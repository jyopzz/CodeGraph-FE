import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgentKeyService } from './agent-key.service';

interface AgentStatusResponse {
  pairingRequired: boolean;
  pairingCodeExpiresAt?: string;
}

interface PairResponse {
  challengeId: string;
  challenge: string;
  expiresAt: string;
}

interface VerifyResponse {
  success: boolean;
  sessionToken: string;
  expiresInSeconds: number;
}

@Injectable({
  providedIn: 'root',
})
export class AgentAuthService {
  private readonly http = inject(HttpClient);
  private readonly keyService = inject(AgentKeyService);

  private readonly apiUrl = `${environment.agentUrl}/auth`;

  private readonly sessionTokenSubject = new BehaviorSubject<string | null>(
    null,
  );

  readonly sessionToken$ = this.sessionTokenSubject.asObservable();

  async initialize(): Promise<void> {
    const hasKey = await this.keyService.loadKeyPair();

    if (!hasKey) {
      return;
    }

    try {
      await this.reconnect();
    } catch (error) {
      console.warn('Automatic Agent reconnect failed:', error);

      this.sessionTokenSubject.next(null);
    }
  }

  async unpair(): Promise<void> {
    const token = this.getSessionToken();

    if (!token) {
      throw new Error('Agent is not authenticated');
    }

    await firstValueFrom(this.http.post(`${this.apiUrl}/unpair`, {}));

    this.sessionTokenSubject.next(null);
    this.keyService.clear();
  }

  async getStatus(): Promise<AgentStatusResponse> {
    return firstValueFrom(
      this.http.get<AgentStatusResponse>(`${this.apiUrl}/status`),
    );
  }

  async pair(code: string): Promise<PairResponse> {
    if (!this.keyService.hasKeyPair()) {
      await this.keyService.generateKeyPair();
    }

    const publicKey = await this.keyService.getPublicKeyJwk();

    return firstValueFrom(
      this.http.post<PairResponse>(`${this.apiUrl}/pair`, {
        code,
        publicKey: JSON.stringify(publicKey),
      }),
    );
  }

  async verify(
    challengeId: string,
    challenge: string,
  ): Promise<VerifyResponse> {
    const signature = await this.keyService.sign(challenge);

    const response = await firstValueFrom(
      this.http.post<VerifyResponse>(`${this.apiUrl}/verify`, {
        challengeId,
        signature,
      }),
    );

    this.sessionTokenSubject.next(response.sessionToken);

    return response;
  }

  async connect(code: string): Promise<VerifyResponse> {
    const pairResponse = await this.pair(code);

    return this.verify(pairResponse.challengeId, pairResponse.challenge);
  }

  async reconnect(): Promise<VerifyResponse> {
    const publicKey = await this.keyService.getPublicKeyJwk();

    const challenge = await firstValueFrom(
      this.http.post<PairResponse>(`${this.apiUrl}/reconnect`, {
        publicKey: JSON.stringify(publicKey),
      }),
    );

    return this.verify(challenge.challengeId, challenge.challenge);
  }

  getSessionToken(): string | null {
    return this.sessionTokenSubject.value;
  }

  isAuthenticated(): boolean {
    return this.getSessionToken() !== null;
  }

  async disconnect(): Promise<void> {
    this.sessionTokenSubject.next(null);

    await this.keyService.clear();
  }
}
