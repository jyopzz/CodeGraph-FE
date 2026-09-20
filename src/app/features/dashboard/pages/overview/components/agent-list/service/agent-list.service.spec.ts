import { TestBed } from '@angular/core/testing';

import { AgentListService } from './agent-list.service';

describe('AgentListService', () => {
  let service: AgentListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgentListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
