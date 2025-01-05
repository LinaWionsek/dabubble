import { Component, inject } from '@angular/core';
import { WorkspaceComponent } from './workspace/workspace.component';
import { MainChatComponent } from './main-chat/main-chat.component';
import { ThreadComponent } from './thread/thread.component';
import { AddChannelDialogComponent } from './add-channel-dialog/add-channel-dialog.component';
import { HeaderComponent } from '../shared-components/header/header.component';
import { AuthService } from '../services/authentication.service';
import { Router } from '@angular/router';
import { ThreadService } from '../services/thread.service';
import { ToastService } from '../services/toast.service';
import { ToastComponent } from '../shared-components/toast/toast.component';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    HeaderComponent,
    WorkspaceComponent,
    MainChatComponent,
    ThreadComponent,
    AddChannelDialogComponent,
    ToastComponent,
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent {
  addChannelDialogOpened = false;
  activeChannel: string = '';
  threadActivated = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private threadService: ThreadService,
    private toastService: ToastService,
    private stateService: StateService
  ) {}

  ngOnInit() {
    this.threadService.threadActivated$.subscribe((activated) => {
      this.threadActivated = activated;
    });
    let message = this.stateService.getState('message');
    if (message) {
      setTimeout(() => {
        this.toastService.showToast(message);
      }, 1000);
    }
  }

  handleDialogStateChange(dialogState: boolean) {
    this.addChannelDialogOpened = dialogState;
  }
}
