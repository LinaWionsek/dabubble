import { Component, Output, EventEmitter, inject } from '@angular/core';
import { WorkspaceChannelsComponent } from "./workspace-channels/workspace-channels.component";
import { WorkspaceDirectMessagesComponent } from "./workspace-direct-messages/workspace-direct-messages.component";
import { trigger, state, style, transition, animate } from '@angular/animations';
import { User } from '../../models/user.class';
import { AuthService } from '../../services/authentication.service';
import { ChannelService } from '../../services/channel.service';
import { ChatService } from '../../services/dm-chat.service';
import { ThreadService } from '../../services/thread.service';
import { collection, collectionData, Firestore, getDocs } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { Channel } from '../../models/channel.class';
import { Message } from '../../models/message.class';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [WorkspaceChannelsComponent, WorkspaceDirectMessagesComponent, FormsModule],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
  animations: [
    trigger('slideInOut', [
      state('opened', style({
        transform: 'translateX(0)',
        opacity: 1,
        display: 'block', // Display state ensures visibility when opened
      })),
      state('closed', style({
        transform: 'translateX(-200%)',
        opacity: 0,
        display: 'none', // Display state hides element when closed
      })),
      transition('opened <=> closed', animate('125ms ease-in-out')), // Smooth transition
    ]),
  ],
})
export class WorkspaceComponent {
  @Output() dialogStateChange = new EventEmitter<boolean>();

  currentUser?: User | null ;
  workspaceMenuOpened = true;

  firestore: Firestore = inject(Firestore);
  allUsers$!: Observable<User[]>;
  users: User[] = [];
  showSearchBar: boolean = false;
  showUserProfile: boolean = false;
  user: User | null = null;
  isUserMenuOpen: boolean = false;
  isUserProfileOpen: boolean = false;
  searching: boolean = false;
  selectedUserId: string | null = null;
  private authSubscription: Subscription | null = null;
  searchTerm = '';
  searchedUsers: User[] = [];
  channels$!: Observable<Channel[]>;
  allChannels: Channel[] = [];
  allUserChannels: Channel[] = [];
  messages$!: Observable<Message[]>;
  allMessages: Message[] = [];
  searchResults: Message[] = [];
  showDropDown: boolean = false;


  constructor(
    private authService: AuthService, 
    private channelService: ChannelService, 
    private chatService: ChatService, 
    private threadService: ThreadService,
    private workspaceService: WorkspaceService
  ){}


  ngOnInit(){
    this.getCurrentUser();
  }


  async getCurrentUser(){
    this.currentUser = await this.authService.getFullUser();
  }


  handleDialogStateChange(newState: boolean) {
    this.dialogStateChange.emit(newState); 
  }


  toggleWorkspaceMenu(){
    this.workspaceMenuOpened = !this.workspaceMenuOpened;
  }


  activateDefaultChat(){
    this.workspaceService.deactivateWorkspace();
    this.channelService.clearActiveChannel();
    this.chatService.clearActiveChat();
    this.threadService.deactivateThread();
  }

  setActiveChat(user: User) {
    this.workspaceService.deactivateWorkspace();
    this.channelService.clearActiveChannel();
    this.threadService.deactivateThread();
    this.chatService.setActiveChat(user);
    this.resetSearch();
  }

  setActiveChannel(channel: Channel) {
    this.workspaceService.deactivateWorkspace();
    this.channelService.setActiveChannel(channel);
    this.resetSearch();
  }



  searchDevspace() {
    if (!this.searchTerm || this.searchTerm.trim().length === 0) {
      this.resetSearch();
      return;
    }
    this.showDropDown = true;
    this.searching = true;
    this.searchUser();
    this.getAllChannels();
    
  }

  resetSearch() {
    this.searchResults = [];
    this.searchedUsers = [];
    this.showDropDown = false;
    this.searching = false;
    this.searchTerm = '';
  }

  searchUser() {
    const userCollection = collection(this.firestore, 'users');
    this.allUsers$ = collectionData(userCollection, {
      idField: 'id',
    }) as Observable<User[]>;

    this.allUsers$.subscribe((changes) => {
      this.users = changes;
      this.searchedUsers = this.users.filter(
        (filterResult) =>
          filterResult.firstName
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          filterResult.lastName
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
    });
  }

  getAllChannels() {
    const userChannelsCollection = collection(this.firestore, 'channels');
    this.channels$ = collectionData(userChannelsCollection, {
      idField: 'id',
    }) as Observable<Channel[]>;
    this.channels$.subscribe((changes) => {
      this.allChannels = Array.from(
        new Map(changes.map((channel) => [channel.id, channel])).values()
      );
      this.getAllChannelsForCurrentUser();
    });
  }

  async getAllChannelsForCurrentUser() {
    this.getUserChannels();
    await this.fetchMessagesForChannels();
    this.filterSearchResults();
  }

  getUserChannels() {
    this.allUserChannels = this.allChannels.filter((channel) =>
      channel.userIds.includes(this.user!.id)
    );
  }

  async fetchMessagesForChannels() {
    const messagesMap = new Map<string, Message>();
    for (const channel of this.allUserChannels) {
      const channelMessagesRef = collection(
        this.firestore,
        `channels/${channel.id}/messages`
      );
      const snapshot = await getDocs(channelMessagesRef);
      const messages = snapshot.docs.map((doc) => ({
        ...(doc.data() as Message),
        id: doc.id,
        channel: channel,
      }));
      messages.forEach((message) => messagesMap.set(message.id, message));
    }
    this.allMessages = Array.from(messagesMap.values());
  }

  filterSearchResults() {
    this.searchResults = this.allMessages.filter((message) =>
      message.messageText.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
