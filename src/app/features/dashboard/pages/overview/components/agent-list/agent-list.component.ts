import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil, tap } from 'rxjs';

import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

import { BaseComponent } from '../../../../../../core/base/base.component';
import {
  AgentConfiguration,
  AgentListService,
} from './service/agent-list.service';

@Component({
  selector: 'app-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrl: './agent-list.component.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentListComponent extends BaseComponent implements OnInit {
  override hostClass = 'app-agent-list-container';

  agents: AgentConfiguration[] = [];

  isLoading = false;
  isLoadingSearch= false;
  hasError = false;

  searchControl = new FormControl<string>('', {
    nonNullable: true,
  });

  pageIndex = 1;
  pageSize = 5;
  totalElements = 0;

  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  readonly pageSizeOptions = [5, 10, 25, 50];

  constructor(
    private readonly agentListService: AgentListService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.setupSearch();
    this.loadAgents();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        distinctUntilChanged(),

        tap(() => {
          this.isLoading = true;
          this.isLoadingSearch= true;
          this.hasError = false;
          this.pageIndex = 1;
          this.cdr.markForCheck();
        }),

        debounceTime(300),

        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.loadAgents();
      });
  }

  loadAgents(): void {
    this.isLoading = true;
    this.hasError = false;

    this.cdr.markForCheck();

    const search = this.searchControl.value.trim();

    this.agentListService
      .getAgentConfigurations(
        this.pageIndex,
        this.pageSize,
        search,
        this.sortBy,
        this.sortDirection,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.agents = response.data ?? [];
          this.totalElements = response.metaData?.totalElements ?? 0;

          this.isLoading = false;
          this.isLoadingSearch=false;
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error('Failed to load agent configurations:', error);

          this.agents = [];
          this.totalElements = 0;
          this.isLoading = false;
          this.isLoadingSearch=false;
          this.hasError = true;

          this.cdr.markForCheck();
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex + 1;
    this.pageSize = event.pageSize;

    this.loadAgents();
  }

  onSortChange(sort: Sort): void {
    if (!sort.direction) {
      this.sortBy = 'name';
      this.sortDirection = 'asc';
    } else {
      this.sortBy = sort.active;
      this.sortDirection = sort.direction as 'asc' | 'desc';
    }

    this.pageIndex = 1;

    this.loadAgents();
  }

  refresh(): void {
    this.loadAgents();
  }

onDeleteAgent(agent: AgentConfiguration): void {
  console.log('Delete agent:', agent);
}
}
