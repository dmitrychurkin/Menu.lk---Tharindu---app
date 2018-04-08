import { Component } from "@angular/core";
import { IonicPage, NavParams } from "ionic-angular";
import { IMG_DATA_FIELD_TOKEN } from "../../../pages.constants";

@IonicPage()
@Component({
  selector: 'page-item',
  templateUrl: 'item.html'
})
export class ItemPage {
  
  backgroundImage: string;
  userNotes = '';
  itemCount = 1;
  

  constructor(public navParams: NavParams) {}
  
  
  ionViewDidLoad() {
    console.log(this.navParams.get('_id'));
    this.backgroundImage = `url(${this.navParams.get('menu').item[IMG_DATA_FIELD_TOKEN]})`;
  }
  onInc() {
    this.itemCount++;
  }
  onDec() {
    if (this.itemCount > 1) {
      this.itemCount--;
    }
  }
  toggleActive(e: any) {
    console.log(e);
    let input: HTMLInputElement = e.target;
    if (input) {
      let inputContainerClassList = input.parentElement.classList;
      let isActive = inputContainerClassList.contains('active');
      if (isActive && this.userNotes.length > 0) {
        inputContainerClassList.add('dirty');
      }else if (isActive && this.userNotes.length == 0) {
        inputContainerClassList.remove('dirty');
      }
      inputContainerClassList.toggle('active');
    }
    /*let { input } = this;
    if (input && input.nativeElement) {
      let inputContainerClassList = input.nativeElement.parentElement;
      inputContainerClassList.classList.toggle('active');
    }*/
  }
  
  
}