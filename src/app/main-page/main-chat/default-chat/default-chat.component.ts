import { Component, inject } from '@angular/core';
import { ChatHistoryComponent } from "../../../shared-components/chat-history/chat-history.component";
import { ChatInputComponent } from "../../../shared-components/chat-input/chat-input.component";
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from '../../../models/channel.class';
import { AuthService } from '../../../services/authentication.service';
import { User } from '../../../models/user.class';
import { FormsModule } from '@angular/forms';
import { ReceiverService } from '../../../services/receiver.service';

@Component({
  selector: 'app-default-chat',
  standalone: true,
  imports: [ChatHistoryComponent, ChatInputComponent, FormsModule],
  templateUrl: './default-chat.component.html',
  styleUrl: './default-chat.component.scss'
})
export class DefaultChatComponent {

  inputValue: string = '';
  showChannelDropdown = false;
  showUserDropdown = false;

  filteredChannels: Channel[] = [];
  filteredUsers: User[] = [];
  
  currentUser?: User | null ;
  channels$!: Observable<Channel[]>;
  allChannels: Channel[] = [];
  allUserChannels: Channel[] = [];
  users$!: Observable<User[]>;
  allUsers: User[] = [];


  firestore: Firestore = inject(Firestore);

  constructor(private authService: AuthService, private receiverService: ReceiverService){}


  async ngOnInit(){
    await this.getCurrentUser();
    this.getAllChannels();
    this.getAllUsers();
  }


  async getCurrentUser(){
    this.currentUser = await this.authService.getFullUser();
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
    this.allUserChannels = this.allChannels.filter((channel) => channel.userIds.includes(this.currentUser!.id));
  }


  getAllUsers(){
    const usersCollection = collection(this.firestore, 'users')
    this.users$ = collectionData(usersCollection, { idField: 'id'}) as Observable<User[]>;

    this.users$.subscribe((changes) => {
      this.allUsers = Array.from(new Map(changes.filter(user => user.id !== this.currentUser?.id)
        .map(user => [user.id, user])
      ).values());
    })
  }


  checkInputValue(){
    if(this.inputValue.startsWith('#')){
      this.showUserDropdown = false;
      this.showChannelDropdown = true;
      this.setFilteredChannels();
    } else if(this.inputValue.startsWith('@')){
      this.showChannelDropdown = false;
      this.showUserDropdown = true;
      this.setFilteredUsers();
    } else {
      this.showChannelDropdown = false;
      this.showUserDropdown = false;
    }
  }


  setFilteredChannels(){
    if(this.inputValue.length > 1){
      this.filterChannels();
    } else {
      this.filteredChannels = [...this.allUserChannels];
    }
  }


  setFilteredUsers(){
    if(this.inputValue.length > 1){
      this.filterUsers();
    } else {
      this.filteredUsers = [...this.allUsers];
    }
  }


  filterChannels(){
    const trimmedInput = this.inputValue.slice(1).toLowerCase();
    this.filteredChannels = this.allUserChannels.filter((channel) => 
      channel.name.toLowerCase().startsWith(trimmedInput)
    );
    this.showChannelDropdown = this.filteredChannels.length > 0;
  }


  filterUsers(){
    const trimmedInput = this.inputValue.slice(1).toLowerCase();
    this.filteredUsers = this.allUsers.filter((user) => 
      user.firstName.toLowerCase().startsWith(trimmedInput) || 
      user.lastName.toLowerCase().startsWith(trimmedInput)
    );
    this.showUserDropdown = this.filteredUsers.length > 0;
  }


  setReceiver(receiver: Channel | User){
    if('creator' in receiver){
      this.inputValue = "#" + receiver.name;
      this.receiverService.setReceiver(receiver);
      this.showChannelDropdown = false;
    } else if('email' in receiver){
      this.inputValue = receiver.firstName + ' ' + receiver.lastName;
      this.receiverService.setReceiver(receiver);
      this.showUserDropdown = false;
    }
  }


  checkForValidReceiverInput(){
    this.showUserDropdown = false;
    this.showChannelDropdown = false;

    if(this.inputValue.startsWith('@')){
      this.checkForValidUserNameInput();
    } else if(this.inputValue.startsWith('#')){
      this.checkForValidChannelInput();
    } else if(this.isEmail(this.inputValue)){
      this.checkForValidUserMailInput();
    }
  }


  checkForValidUserMailInput(){
    const inputUserMail = this.inputValue.toLowerCase();
    const foundUser = this.allUsers.find((user) => user.email === inputUserMail);
    
    if(foundUser){
      this.setReceiver(foundUser);
    }
  }


  isEmail(input: string){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  }


  checkForValidUserNameInput(){
    if(this.inputValue.length > 1){
      const inputUserName = this.inputValue.slice(1).toLowerCase();
      const foundUser = this.allUsers.find((user) => (user.firstName + ' ' + user.lastName).toLowerCase() === inputUserName);

      if(foundUser){
        this.setReceiver(foundUser);
      }
    }
  }


  checkForValidChannelInput(){
    if(this.inputValue.length > 1){
      const inputChannelName = this.inputValue.slice(1).toLowerCase();
      const foundChannel = this.allChannels.find((channel) => channel.name.toLowerCase() === inputChannelName);
      
      if(foundChannel){
        this.setReceiver(foundChannel);
      }
    }
  }




}
