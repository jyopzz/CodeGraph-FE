import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AgentTelemetry {
  serviceName: string;
  agentVersion: string;
  pid: number;
  codeGraph: {
    installed: boolean;
    version: string;
    path: string;
    status: string;
  };
}

export interface AgentResponse {
  success: boolean;
  output?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AgentService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.agentUrl;

  /**
   * Get CodeGraph Agent telemetry.
   *
   * The agentInterceptor automatically adds:
   *
   * Authorization: Bearer <agent-session-token>
   */
  getTelemetry(): Observable<AgentTelemetry> {

    return this.http.get<AgentTelemetry>(
      `${this.apiUrl}/telemetry`
    );
  }

  /**
   * Execute a CodeGraph Agent operation.
   *
   * NOTE:
   * The backend currently accepts arbitrary commands.
   * We will replace this with an allowlisted operation API
   * in the security-hardening step.
   */
  runScript(
    command: string,
    args: string[] = []
  ): Observable<AgentResponse> {

    return this.http.post<AgentResponse>(
      `${this.apiUrl}/run-script`,
      {
        command,
        args,
      }
    );
  }
}