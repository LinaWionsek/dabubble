import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultChatComponent } from './default-chat.component';

describe('DefaultChatComponent', () => {
  let component: DefaultChatComponent;
  let fixture: ComponentFixture<DefaultChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DefaultChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
