import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickOperationsComponent } from './quick-operations.component';

describe('QuickOperationsComponent', () => {
  let component: QuickOperationsComponent;
  let fixture: ComponentFixture<QuickOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuickOperationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
