import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

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

export interface AgentConfigurationMetaData {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AgentConfigurationResponse {
  data: AgentConfiguration;
  metaData?: AgentConfigurationMetaData;
  message: string;
  businessValidation: unknown;
  successful: boolean;
  responseCode: number;
}

export interface AgentConfigurationListResponse {
  data: AgentConfiguration[];
  metaData: AgentConfigurationMetaData;
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

  getAgentConfigurations(
    page: number,
    size: number,
    search: string,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
  ): Observable<AgentConfigurationListResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<AgentConfigurationListResponse>(
      `${this.apiUrl}/agent-configurations`,
      { params },
    );
  }

  getAgentConfiguration(
    agentId: string,
  ): Observable<AgentConfigurationResponse> {
    return this.http.get<AgentConfigurationResponse>(
      `${this.apiUrl}/agent-configurations/${agentId}`,
    );
  }

  createAgent(
    agent: AgentConfiguration,
  ): Observable<AgentConfigurationResponse> {
    return this.http.post<AgentConfigurationResponse>(
      `${this.apiUrl}/agent-configurations`,
      agent,
    );
  }

  updateAgent(
    agentId: string,
    agent: AgentConfiguration,
  ): Observable<AgentConfigurationResponse> {
    return this.http.patch<AgentConfigurationResponse>(
      `${this.apiUrl}/agent-configurations/${agentId}`,
      agent,
    );
  }

  deleteAgent(agentId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/agent-configurations/${agentId}`,
    );
  }

  getAgents(): Observable<AgentConfiguration[]> {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '100');

    return this.http
      .get<AgentConfigurationListResponse>(
        `${this.apiUrl}/agent-configurations`,
        { params },
      )
      .pipe(
        map((response) => response?.data ?? []),
      );
  }
}

