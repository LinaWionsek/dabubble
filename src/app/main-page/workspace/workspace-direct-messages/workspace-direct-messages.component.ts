import { Component, inject, Input } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { Observable } from 'rxjs';
import { ChatService } from '../../../services/dm-chat.service';
import { ChannelService } from '../../../services/channel.service';



@Component({
  selector: 'app-workspace-direct-messages',
  standalone: true,
  imports: [],
  templateUrl: './workspace-direct-messages.component.html',
  styleUrl: './workspace-direct-messages.component.scss',
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
export class WorkspaceDirectMessagesComponent {
  showSubmenu = true;
  firestore: Firestore = inject(Firestore);
  @Input() currentUser?: User | null;
  users$!: Observable<User[]>;
  allUsers: User[] = [];

  activeIndex: number | null = null;
  activeChat: string = '';


  constructor(private chatService: ChatService, private channelService: ChannelService){}


  ngOnInit(){
    this.loadAllUsers();
  }


  loadAllUsers(){
    const usersCollection = collection(this.firestore, 'users')
    this.users$ = collectionData(usersCollection, { idField: 'id'}) as Observable<User[]>;

    this.users$.subscribe((changes) => {
      this.allUsers = Array.from(new Map(changes.map(user => [user.id, user])).values());
    })
  }


  toggleDropdown(){
    this.showSubmenu = !this.showSubmenu;
  }


  activateChat(index:number){
    this.channelService.clearActiveChannel();

    this.activeIndex = index; 
    this.activeChat = this.allUsers[index].id;
    const activeUserObject = this.allUsers[index]
    this.chatService.setActiveChat(activeUserObject);
  }
}
