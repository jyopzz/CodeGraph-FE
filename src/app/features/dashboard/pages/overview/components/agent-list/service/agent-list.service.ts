import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../../../../../environments/environment';

export interface AgentConfiguration {
  agentId?: string;
  name?: string;
  host?: string;
  protocol?: string;
  port?: number;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface AgentConfigurationResponse {
  data: AgentConfiguration[];
  message: string;
  businessValidation: unknown;
  successful: boolean;
  responseCode: number;
}

@Injectable({
  providedIn: 'root',
})
export class AgentListService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  getAgentConfigurations(): Observable<AgentConfigurationResponse> {
    return this.http.get<AgentConfigurationResponse>(
      `${this.apiUrl}/agent-configurations`,
    );
  }
}