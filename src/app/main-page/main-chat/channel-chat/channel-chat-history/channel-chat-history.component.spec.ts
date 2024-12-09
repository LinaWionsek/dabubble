import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelChatHistoryComponent } from './channel-chat-history.component';

describe('ChannelChatHistoryComponent', () => {
  let component: ChannelChatHistoryComponent;
  let fixture: ComponentFixture<ChannelChatHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelChatHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelChatHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
