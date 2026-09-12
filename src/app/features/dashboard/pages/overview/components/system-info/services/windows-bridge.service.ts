import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

export interface CodeGraphInfo {
  installed: boolean;
  version: string | null;
  binaryPath: string | null;
  cliStatus: 'ready' | 'busy' | 'not_found';
}

export interface WindowsAgentStatus {
  connected: boolean;
  serviceName: string;
  agentVersion: string;
  port: number;
  latencyMs: number;
  pid: number | null;
  codeGraph: CodeGraphInfo;
  lastChecked: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WindowsBridgeService {
  // Default loopback endpoint exposed by your Windows agent
  private readonly AGENT_BASE_URL = 'http://127.0.0.1:9870';

  private statusSubject = new BehaviorSubject<WindowsAgentStatus>({
    connected: false,
    serviceName: 'CodeGraph.BridgeDaemon.exe',
    agentVersion: 'Unknown',
    port: 9870,
    latencyMs: 0,
    pid: null,
    codeGraph: {
      installed: false,
      version: null,
      binaryPath: null,
      cliStatus: 'not_found'
    },
    lastChecked: new Date()
  });

  public status$: Observable<WindowsAgentStatus> = this.statusSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Starts periodic polling (e.g., every 5 seconds) to maintain live health status
   */
  public startHealthCheck(intervalMs: number = 5000): Observable<WindowsAgentStatus> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.pingAgent())
    );
  }

  /**
   * Pings the local agent and queries the host environment
   */
  public pingAgent(): Observable<WindowsAgentStatus> {
    const startTime = performance.now();

    return this.http.get<any>(`${this.AGENT_BASE_URL}/api/v1/telemetry`).pipe(
      map((res) => {
        const latency = Math.round(performance.now() - startTime);
        const updatedStatus: WindowsAgentStatus = {
          connected: true,
          serviceName: res.serviceName || 'CodeGraph.BridgeDaemon.exe',
          agentVersion: res.agentVersion || 'v1.0.0',
          port: 9870,
          latencyMs: latency,
          pid: res.pid || null,
          codeGraph: {
            installed: res.codeGraph?.installed ?? false,
            version: res.codeGraph?.version ?? 'N/A',
            binaryPath: res.codeGraph?.path ?? null,
            cliStatus: res.codeGraph?.status ?? 'ready'
          },
          lastChecked: new Date()
        };
        this.statusSubject.next(updatedStatus);
        return updatedStatus;
      }),
      catchError(() => {
        const disconnectedState: WindowsAgentStatus = {
          ...this.statusSubject.value,
          connected: false,
          latencyMs: 0,
          pid: null,
          codeGraph: {
            installed: false,
            version: null,
            binaryPath: null,
            cliStatus: 'not_found'
          },
          lastChecked: new Date()
        };
        this.statusSubject.next(disconnectedState);
        return of(disconnectedState);
      })
    );
  }

  /**
   * Execute an automated script through the local Windows application
   */
  public executeCodeGraphCommand(command: string, args: string[] = []): Observable<any> {
    return this.http.post(`${this.AGENT_BASE_URL}/api/v1/run-script`, {
      command,
      args
    });
  }
}