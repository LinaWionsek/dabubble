import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelChatHeaderComponent } from './channel-chat-header.component';

describe('ChannelChatHeaderComponent', () => {
  let component: ChannelChatHeaderComponent;
  let fixture: ComponentFixture<ChannelChatHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelChatHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelChatHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
