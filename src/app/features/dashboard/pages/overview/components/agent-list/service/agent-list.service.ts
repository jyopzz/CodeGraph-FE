import { HttpClient, HttpParams } from '@angular/common/http';
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

export interface AgentConfigurationMetaData {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AgentConfigurationResponse {
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
  ): Observable<AgentConfigurationResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<AgentConfigurationResponse>(
      `${this.apiUrl}/agent-configurations`,
      { params },
    );
  }
}
