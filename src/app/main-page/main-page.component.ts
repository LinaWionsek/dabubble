import { Component, inject } from '@angular/core';
import { WorkspaceComponent } from './workspace/workspace.component';
import { MainChatComponent } from './main-chat/main-chat.component';
import { ThreadComponent } from './thread/thread.component';
import { AddChannelDialogComponent } from './add-channel-dialog/add-channel-dialog.component';
import { HeaderComponent } from '../shared-components/header/header.component';
import { AuthService } from '../services/authentication.service';
import { Router } from '@angular/router';
import { ThreadService } from '../services/thread.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    HeaderComponent,
    WorkspaceComponent,
    MainChatComponent,
    ThreadComponent,
    AddChannelDialogComponent,
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent {
  addChannelDialogOpened = false;
  activeChannel: string = '';
  threadActivated = false;

  constructor(private authService: AuthService, private router: Router, private threadService: ThreadService) {}


  ngOnInit(){
    this.threadService.threadActivated$.subscribe((activated) => {
      this.threadActivated = activated;
    });
  }
  

  handleDialogStateChange(dialogState: boolean) {
    this.addChannelDialogOpened = dialogState;
  }
}
