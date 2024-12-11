import { Component, Output, EventEmitter, OnInit, inject, Input } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { Observable } from 'rxjs';
import { Channel } from './../../../models/channel.class';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { ChannelService } from '../../../services/channel.service';
import { User } from '../../../models/user.class';


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
  
  constructor(private channelService: ChannelService) {}

  showSubmenu = true;
  addChannelDialogOpened = false;
  channels$!: Observable<Channel[]>;
  allChannels: Channel[] = [];
  allUserChannels: Channel[] = [];
  firestore: Firestore = inject(Firestore);
  private isInitialized = false;

  activeIndex: number | null = null;
  activeChannel:string = '';


  ngOnInit(){
    this.getAllChannels();
    
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
      
      if (!this.isInitialized && this.allChannels.length > 0) {
        this.activateChannel(0); 
        this.isInitialized = true;
      }
    })
  }


  getAllChannelsForCurrentUser(){
    this.allUserChannels = this.allChannels.filter((channel) => channel.userIds.includes(this.currentUser!.id));
  }


  activateChannel(index:number) {
    this.activeIndex = index; 
    this.activeChannel = this.allChannels[index].id;
    this.channelService.setActiveChannel(this.activeChannel);
  }
}
