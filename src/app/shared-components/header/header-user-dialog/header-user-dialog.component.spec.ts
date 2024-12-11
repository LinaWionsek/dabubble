import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderUserDialogComponent } from './header-user-dialog.component';

describe('HeaderUserDialogComponent', () => {
  let component: HeaderUserDialogComponent;
  let fixture: ComponentFixture<HeaderUserDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderUserDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeaderUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
