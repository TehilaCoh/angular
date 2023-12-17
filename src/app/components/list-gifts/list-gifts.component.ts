import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Gift } from '../../models/Gift';
import { GiftService } from 'src/app/services/gift.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/User';
import { DonorService } from 'src/app/services/donor.service';
import { Donor } from 'src/app/models/Donor';


@Component({
  selector: 'app-list-gifts',
  templateUrl: './list-gifts.component.html',
  styleUrls: ['./list-gifts.component.css']
})
export class ListGiftsComponent implements OnInit {

  giftDialog: boolean;

  gifts: Gift[];
  gift: Gift=new Gift();

  users: User[];
  selectedUsers: User[]=[];
  win: User=new User();

  selectedgifts: Gift[];
  submitted: boolean;

  donors: Donor[]=[];

  constructor(private giftService: GiftService, 
    private messageService: MessageService, 
    private confirmationService: ConfirmationService,
    private userService:UserService,
    private donorService: DonorService) { }

  ngOnInit() {
    this.getAllGifts()
    this.donorService.reloadDonors$.subscribe(x => {
    this.donorService.getDonors().subscribe(data => this.donors = data);
  })
}
getAllGifts(){
  this.giftService.reloadGifts$.subscribe(x => {
  this.giftService.getGifts().subscribe(data => this.gifts = data);
});
}

  openNew() {
      this.gift = new Gift();
      this.submitted = false;
      this.giftDialog = true;
  }

  deleteSelectedGifts() {
      this.confirmationService.confirm({
          message: 'Are you sure you want to delete the selected gifts?',
          header: 'Confirm',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
              this.gifts = this.gifts.filter(val => !this.selectedgifts.includes(val));
              this.selectedgifts = null;
              this.messageService.add({severity:'success', summary: 'Successful', detail: 'Gifts Deleted', life: 3000});
          }
      });
      this.getAllGifts()
  }

  editGift(gift: Gift) {
      this.gift = {...gift};
      this.giftDialog = true;
  }

  deleteGift(gift: Gift) {
      this.confirmationService.confirm({
          message: 'Are you sure you want to delete ' + gift.name + '?',
          header: 'Confirm',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
              this.giftService.deleteGift(gift.id).subscribe(()=>  this.getAllGifts())
              this.gift =new Gift();
              this.messageService.add({severity:'success', summary: 'Successful', detail: 'Gift Deleted', life: 3000});            
          }
      });       
  }

  hideDialog() {
      this.giftDialog = false;
      this.submitted = false;
  }
  
  savegift() {
      this.submitted = true;

      if (this.gift.name.trim()) {
          if (this.gift.id) {
             this.giftService.saveGift(this.gift).subscribe(()=>{res=>console.log(res,"res saved")
             this.getAllGifts()})              
             this.messageService.add({severity:'success', summary: 'Successful', detail: 'Gift Updated', life: 3000});
          }
          else {
                this.gift.image = 'gift-placeholder.svg';
                this.giftService.addGift(this.gift).subscribe(()=>{res=>console.log(res,"res add")
                this.getAllGifts()}
              )
              this.messageService.add({severity:'success', summary: 'Successful', detail: 'Gift Created', life: 3000});
          }        
          this.getAllGifts()
          this.gifts = [...this.gifts];
          this.giftDialog = false;
          this.gift = new Gift();
      }   
  }
  findIndexById(id: number): number {
      let index = -1;
      for (let i = 0; i < this.gifts.length; i++) {
          if (this.gifts[i].id === id) {
              index = i;
              break;
          }
      }
      return index;
  }
randomUserWin(gift: Gift){
    var users;
    this.userService.reloadUsers$.subscribe(x => {
        this.userService.getUsers().subscribe(data => {
            users = data
            for(let i=0; i<users.length; i++){
                var user = users[i];
                if(user.tickets){
                user.tickets.map(x =>{
                    if(x.id==gift.id)
                        this.selectedUsers.push(user)
        
                })
            }
             }
                    var m= Math.floor(Math.random() * this.selectedUsers.length)
                    this.win=this.selectedUsers[m];
                    alert(`the winner is ${this.win.name}`)
            })
        });
  }   
  onUpload(files) {
      this.gift.image = files[0];
  }
}
