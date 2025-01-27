import { Component, Output, EventEmitter, OnInit, inject, Input, SimpleChanges } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { Observable } from 'rxjs';
import { Channel } from './../../../models/channel.class';
import { Firestore, addDoc, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { ChannelService } from '../../../services/channel.service';
import { User } from '../../../models/user.class';
import { ThreadService } from '../../../services/thread.service';
import { ChatService } from '../../../services/dm-chat.service';
import { WorkspaceService } from '../../../services/workspace.service';
import { Message } from '../../../models/message.class';


@Component({
  selector: 'app-workspace-channels',
  standalone: true,
  imports: [ ],
  templateUrl: './workspace-channels.component.html',
  styleUrl: './workspace-channels.component.scss',
  animations: [
    trigger('submenuAnimation', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('125ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('125ms ease-in', style({ height: '0', opacity: 0 })),
      ]),
    ]),
  ]
})
export class WorkspaceChannelsComponent {
  @Input() currentUser?: User | null;
  @Output() dialogStateChange = new EventEmitter<boolean>();
  
  constructor(
    private channelService: ChannelService, 
    private threadService: ThreadService, 
    private chatService: ChatService,
    private workspaceService: WorkspaceService
  ) {}

  showSubmenu = true;
  addChannelDialogOpened = false;
  channels$!: Observable<Channel[]>;
  allChannels: Channel[] = [];
  allUserChannels: Channel[] = [];
  activeChannel?: Channel | null;
  firestore: Firestore = inject(Firestore);

  welcomeMessage = new Message();
  welcomeChannel?: Channel | null;
  

  ngOnInit(){
    this.subscribeToChannelService();
    this.getAllChannels();
    setTimeout(()=>{
      this.checkIfUserHasChannels();
    }, 200)
  
  }


  async checkIfUserHasChannels(){
    if(this.allUserChannels.length === 0){
      await this.addUserToWelcomeChannel();
      await this.addWelcomeMessageToWelcomeChannel();
      const welcomeChannel = this.getWelcomeChannel();
      
      if(welcomeChannel){
        this.activateChannel(welcomeChannel)
      }
    }
  }

  getWelcomeChannel(){
    return this.allUserChannels.find(channel => channel.name === 'Welcome-Channel') || null;
  }

  async addUserToWelcomeChannel(){
    const channelDocRef = doc(this.firestore, 'channels/11F7a9TqLf6BxuhTVD2H');
    try {
      await updateDoc(channelDocRef, {
        userIds: this.currentUser?.id
      })
    } catch (error) {
      console.error(error)
    }
  }

  async addWelcomeMessageToWelcomeChannel(){
    this.initializeNewWelcomeMessage();
    const welcomeMsg = doc(this.firestore, 'channels/11F7a9TqLf6BxuhTVD2H/messages/hGa7XVRj51jDqXhq7gVp');
    
    try {
      await updateDoc(welcomeMsg, { ...this.welcomeMessage });
    } catch (error) {
      console.error(error);
    }
  }
  
  

  subscribeToChannelService(){
    this.channelService.activeChannel$.subscribe((channel) => {
      this.activeChannel = channel;
    })
  }


  ngOnChanges(changes: SimpleChanges){
    if (changes['currentUser'] && this.currentUser) {
      this.getAllChannelsForCurrentUser(); 
    }
  }


  toggleDropdown(){
    this.showSubmenu = !this.showSubmenu;
  }


  displayAddChannelDialog(){
    this.addChannelDialogOpened = true;
    this.dialogStateChange.emit(this.addChannelDialogOpened);
  }


  
  getAllChannels(){
    const userChannelsCollection = collection(this.firestore, 'channels' );
    this.channels$ = collectionData(userChannelsCollection, { idField: 'id'}) as Observable<Channel[]>;
    
  
    this.channels$.subscribe((changes) => {
      this.allChannels = Array.from(new Map(changes.map(channel => [channel.id, channel])).values());
      this.getAllChannelsForCurrentUser();
    })
  }


  getAllChannelsForCurrentUser(){
    setTimeout(() => {
      this.allUserChannels = this.allChannels.filter((channel) => channel.userIds.includes(this.currentUser!.id));
    }, 100)
  }


  activateChannel(channel: Channel) {
    this.workspaceService.deactivateWorkspace()
    this.chatService.clearActiveChat();
    this.threadService.deactivateThread();
    this.activeChannel = channel;
    this.channelService.setActiveChannel(channel);
  }


  initializeNewWelcomeMessage(){
    this.welcomeMessage.timeStamp = new Date().toISOString();
    this.welcomeMessage.messageText = "Herzlich Willkommen auf DABubble! Hier kannst du dich in Echtzeit mit deinen Teammitgliedern austauschen, entweder per Direktnachricht oder über einen Channel, den du ganz einfach im Workspace-Menü auf der linken Seite erstellen kannst. :-)"
    this.welcomeMessage.senderName = "Welcome-Bot";
    this.welcomeMessage.senderId = "2BB0uxWkRwSjhhUSexrcOU9"
    this.welcomeMessage.senderAvatar = "assets/img/bot1.png"
  }

}
