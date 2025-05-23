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
import { Reaction } from '../../../models/reaction.class';
import { AuthService } from '../../../services/authentication.service';
import { WelcomeService } from '../../../services/welcome.service';


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
    private workspaceService: WorkspaceService,
    private welcomeService: WelcomeService,
    private authService: AuthService
  ) {}

  showSubmenu = true;
  addChannelDialogOpened = false;
  channels$!: Observable<Channel[]>;
  allChannels: Channel[] = [];
  allUserChannels: Channel[] = [];
  activeChannel?: Channel | null;
  firestore: Firestore = inject(Firestore);

  welcomeMessage = new Message();
  welcomeAnswer = new Message();
  welcomeChannel = new Channel();
  newWelcomeChannelId = '';
  newWelcomeMessageId = '';
  lastWelcomeAnswerId = '';
  lastAnswerReaction = new Reaction();
  
  newExampleChannel1 = new Channel();
  newExampleChannel2 = new Channel();


  async ngOnInit(){
    await this.getCurrentUser();
    this.subscribeToChannelService();
    this.getAllChannels();
    this.checkIfUserHasWelcomeChannel();
  }

  async getCurrentUser(){
    this.currentUser = await this.authService.getFullUser();
  }

  async checkIfUserHasWelcomeChannel(){
    const userId = this.currentUser?.id;
    if(userId && !this.welcomeService.isUserWelcomed(userId)){
      await this.createNewWelcomeChannel();
      this.createExampleChannels();
    }
  }

  async createNewWelcomeChannel(){
    if(this.currentUser){
      this.welcomeService.addUserToWelcomed(this.currentUser.id);
      await this.addUserToWelcomeChannel();
      await this.addWelcomeMessageToWelcomeChannel();
      await this.addAnswersToWelcomeMessage();
      const welcomeChannel = this.getWelcomeChannel();
      
      if(welcomeChannel){
        this.activateChannel(welcomeChannel)
      }
    }
  }

  createExampleChannels(){
    this.initializeNewExampleChannel1();
    this.initializeNewExampleChannel2();
    this.uploadExampleChannels();
  }

  async uploadExampleChannels(){
    const channelCol = collection(this.firestore, 'channels')
    try {
      await addDoc(channelCol, { ...this.newExampleChannel1 });
      await addDoc(channelCol, { ...this.newExampleChannel2 });
    } catch (error) {
      console.error(error)
    }
  }

  getWelcomeChannel(){
    return this.allUserChannels.find(channel => channel.id === this.newWelcomeChannelId);
  }


  async addUserToWelcomeChannel(){
    this.initializeNewWelcomeChannel();
    const channelCol = collection(this.firestore, 'channels')
    try {
      const newChannelRef = await addDoc(channelCol, { ...this.welcomeChannel });
      this.newWelcomeChannelId = newChannelRef.id;
    } catch (error) {
      console.error(error)
    }
  }


  async addWelcomeMessageToWelcomeChannel(){
    this.initializeNewWelcomeMessage();
    
      const msgCol = collection(this.firestore, `channels/${this.newWelcomeChannelId}/messages/`);
      try {
        const msgRef = await addDoc(msgCol, { ...this.welcomeMessage });
        this.newWelcomeMessageId = msgRef.id;
      } catch (error) {
        console.error(error);
      }
  }

  async addAnswersToWelcomeMessage(){
     this.initializeNewAnswer1();
     await this.addNewAnswerToWelcomeMsg();
     this.initializeNewAnswer2();
     await this.addNewAnswerToWelcomeMsg();
     this.addReactionToLastAnswer(); 
  }


  async addNewAnswerToWelcomeMsg(){
    const msgCol = collection(this.firestore, `channels/${this.newWelcomeChannelId}/messages/${this.newWelcomeMessageId}/answers`);
    try {
      const msgRef = await addDoc(msgCol, { ...this.welcomeAnswer });
      this.lastWelcomeAnswerId = msgRef.id;
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
    if (this.currentUser) {
      this.allUserChannels = this.allChannels.filter((channel) => channel.userIds.includes(this.currentUser!.id)); 
    }
  }


  activateChannel(channel: Channel) {
    this.workspaceService.deactivateWorkspace()
    this.chatService.clearActiveChat();
    this.threadService.deactivateThread();
    this.activeChannel = channel;
    this.channelService.setActiveChannel(channel);
  }


  initializeNewWelcomeChannel(){
    this.welcomeChannel.name = "Welcome-Channel";
    this.welcomeChannel.creator = "Welcome-Bot";
    this.welcomeChannel.description = "Das ist der Welcome-Channel für neue User."
    this.welcomeChannel.userIds.push(this.currentUser!.id, 'welcomebot1', 'questionbot1');
  }

  initializeNewExampleChannel1(){
    this.newExampleChannel1.name = "Entwicklerteam";
    this.newExampleChannel1.creator = "7chpI7OAToO5RjFBaJJUjLRFCO03";
    this.newExampleChannel1.description = "Dies ist nur ein Beispiel-Channel.";
    this.newExampleChannel1.userIds.push(this.currentUser!.id, '7chpI7OAToO5RjFBaJJUjLRFCO03', '3cBlASSsPhObUqz4bjq8zHXlLig1');
  }

  initializeNewExampleChannel2(){
    this.newExampleChannel2.name = "Marketingteam";
    this.newExampleChannel2.creator = "MPysNe0NopNPrCMWEA8jaovXcHn2";
    this.newExampleChannel2.description = "Dies ist nur ein Beispiel-Channel.";
    this.newExampleChannel2.userIds.push(this.currentUser!.id, 'MPysNe0NopNPrCMWEA8jaovXcHn2', 'syH6N9T8MjaujfJ5JLDIILBBQ6A2');
  }

  initializeNewWelcomeMessage(){
    this.welcomeMessage.timeStamp = new Date().toISOString();
    this.welcomeMessage.messageText = "Herzlich Willkommen auf DABubble! Hier kannst du dich in Echtzeit mit deinen Teammitgliedern austauschen, entweder per Direktnachricht oder über einen Channel, den du ganz einfach im Workspace-Menü auf der linken Seite erstellen kannst. :-)"
    this.welcomeMessage.senderName = "Welcome-Bot";
    this.welcomeMessage.senderId = "welcomebot1"
    this.welcomeMessage.senderAvatar = "assets/img/bot1.png"
  }


  initializeNewAnswer1(){
    this.welcomeAnswer.timeStamp = new Date().toISOString();
    this.welcomeAnswer.messageText = "Mit welcher Angular-Version wurde dieses Projekt gebaut?"
    this.welcomeAnswer.senderName = "Question-Bot"
    this.welcomeAnswer.senderId = "questionbot1"
    this.welcomeAnswer.senderAvatar = "assets/img/bot2.png"
  }

  initializeNewAnswer2(){
    this.welcomeAnswer.timeStamp = new Date().toISOString();
    this.welcomeAnswer.messageText = "Für DABubble wurde Angular 17 verwendet."
    this.welcomeAnswer.senderName = "Welcome-Bot"
    this.welcomeAnswer.senderId = "welcomebot1"
    this.welcomeAnswer.senderAvatar = "assets/img/bot1.png"
  }

  async addReactionToLastAnswer(){
    this.lastAnswerReaction.originatorName = "Question-Bot";
    this.lastAnswerReaction.reactionType = "tick";
    this.lastAnswerReaction.originatorId = "questionbot1"
   
    const lastAnswerReactions = collection(this.firestore, `channels/${this.newWelcomeChannelId}/messages/${this.newWelcomeMessageId}/answers/${this.lastWelcomeAnswerId}/reactions`);
    	
      try {
        await addDoc(lastAnswerReactions, { ...this.lastAnswerReaction })
      } catch (error) {
        console.log(error)
      }    
  }


}
