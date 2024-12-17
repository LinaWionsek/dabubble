import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmChatComponent } from './dm-chat.component';

describe('DmChatComponent', () => {
  let component: DmChatComponent;
  let fixture: ComponentFixture<DmChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DmChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
