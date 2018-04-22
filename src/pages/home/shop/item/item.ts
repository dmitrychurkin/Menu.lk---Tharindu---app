import { Component } from "@angular/core";
import { IonicPage, NavParams } from "ionic-angular";
import { IMG_DATA_FIELD_TOKEN, ANGULAR_ANIMATION_OPACITY } from "../../../pages.constants";
import { ShoppingCart } from "../../../../providers";
import { IOrder } from "../../../../interfaces";

@IonicPage()
@Component({
  selector: 'page-item',
  templateUrl: 'item.html',
  animations: ANGULAR_ANIMATION_OPACITY
})
export class ItemPage {
  
  backgroundImage: string;
  //userNotes = '';
  //itemCount = 1;
  order: IOrder = this.navParams.data;

  constructor(public navParams: NavParams, public cart: ShoppingCart) {}
  
  addToCart() {
    //const OrderStr = JSON.stringify(this.order);
    //const OrderClone: IOrder = JSON.parse(OrderStr);
    //delete OrderClone.menu.item.description;
    this.cart.addToCart(this.order);
  }
  ionViewDidLoad() {
    this.backgroundImage = `url(${this.order.menu.item[IMG_DATA_FIELD_TOKEN]})`;
  }
  onInc() {
    this.order.menu.quantity++;
  }
  onDec() {
    if (this.order.menu.quantity > 1) {
      this.order.menu.quantity--;
    }
  }
  toggleActive(e: any) {
    
    let input: HTMLInputElement = e.target;
    if (input) {
      let inputContainerClassList = input.parentElement.classList;
      let isActive = inputContainerClassList.contains('active');
      if (isActive && this.order.menu.userNotes.length > 0) {
        inputContainerClassList.add('dirty');
      }else if (isActive && this.order.menu.userNotes.length == 0) {
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