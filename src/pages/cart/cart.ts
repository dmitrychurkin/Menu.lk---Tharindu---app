import { AfterViewChecked, Component, Injector, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { Checkbox, Events, IonicPage, NavController, NavParams, PopoverController, ViewController, List } from "ionic-angular";
import { asap } from "rxjs/Scheduler/asap";
import { Cart, IHistoryModalTransferState, IMenuItem } from "../../interfaces";
import { ShoppingCartService, OrdersManagerService } from "../../services";
import { APP_EV, APP_QUICK_ORDER_PAGE, APP_SHOP_ITEM_PAGE, Currency, OrderManagmentActionFlag, OrderStatus, PopoverCartMenuEventFlags, FIREBASE_DB_TOKENS } from "../pages.constants";
import { PopoverCartMenu } from "../popover-cart-menu/popover-cart-menu";
import CartBaseClass, { IPropsForCalcBtnPosition } from './cart-base.class';
import { AngularFirestore } from "angularfire2/firestore";


const { ORDERS } = FIREBASE_DB_TOKENS;


@IonicPage()
@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html'
})
export class CartPage extends CartBaseClass implements AfterViewChecked {


  @ViewChild('MasterCheckBox') masterCheckBox: Checkbox;
  @ViewChildren('ItemCheckBox') ionChBoxes: QueryList<Checkbox>;
  
  private _isMasterCheckboxActivated = false;
  
  private _isQuickOrderPageActivated: boolean;
  private _isShopItemPageActivated: boolean;
  private _isActionBtnClicked: boolean;

  currency = Currency;

  OrderStatus = OrderStatus;
  OrderManagmentActionFlag = OrderManagmentActionFlag;

  mode: 'modal' | 'normal';
  orderId: string;

  constructor(
    private readonly _navCtrl: NavController,
    private readonly _viewCtrl: ViewController,
    private readonly _events: Events,
    private readonly _popoverCtrl: PopoverController,
    private readonly _ordersManagerService: OrdersManagerService,
    private readonly _angularFirestore: AngularFirestore,
    readonly shoppingCartService: ShoppingCartService,
    readonly navParams: NavParams,
    injector: Injector) { 
      super(injector); 

      const { mode= 'normal' } = <IHistoryModalTransferState>this.navParams.data;
      this.mode = mode;
      if (mode === 'modal') {
        this.orderId = this.navParams.data.orderInfo.id;
      }
    }

  get Service(): Cart {

    return this.mode === 'modal' ? (<IHistoryModalTransferState>this.navParams.data).orderContent : this.shoppingCartService.CART_OBJECT_DB;

  }

  get opacity() {

    if (this.pageWillLeave) {

      return 0;

    }

    return this.buttonPosition ? 1 : 0;
    
  }

  async modalAction(ACTION_FLAG: OrderManagmentActionFlag) {

    if (this._isActionBtnClicked) return;
    this._isActionBtnClicked = true;
    
    switch (ACTION_FLAG) {

      case OrderManagmentActionFlag.CLOSE_MODAL:
        await this._viewCtrl.dismiss();
      break;

      default:
        await this._ordersManagerService.dispatchOrderAction(ACTION_FLAG, this.navParams.data.orderInfo);

    }
    
    if (!this.navParams.data.orderInfo) return;

    const documentSnapshot = await this._angularFirestore.doc(`${ORDERS}/${this.navParams.data.orderInfo.id}`).ref.get();
    
    if (ACTION_FLAG == OrderManagmentActionFlag.RESTORE || ACTION_FLAG == OrderManagmentActionFlag.CANCEL) {

      Object.assign(this.navParams.data.orderInfo, documentSnapshot.data());

    }else if (ACTION_FLAG == OrderManagmentActionFlag.DELETE) {

      this.navParams.data.orderInfo = this.navParams.data.orderContent = documentSnapshot.data();

    }
    
  
    delete this._isActionBtnClicked;

  }

  onViewOrder(Item: IMenuItem) {
   
    if (this._isShopItemPageActivated || this.mode === 'modal') return;

    this._isShopItemPageActivated = true;

    this._navCtrl.push(APP_SHOP_ITEM_PAGE, Item);

  }

  onSelectAll(masCheckbox?: Checkbox): void {

    if (this.animator.isLocked || 
      !this.masterCheckBox || 
      !this.shoppingCartService.CART_OBJECT_DB.TOTAL_ORDERS_IN_CART) return;

    this._isMasterCheckboxActivated = true;

    this.masterCheckBox.checked = !masCheckbox ? false : !masCheckbox.checked;
    const { checked } = this.masterCheckBox;

    const { length } = this.ionChBoxes;
    this._calculateItemDeleteCounter(checked ? length : 0);
    this.ionChBoxes.forEach((checkbox: Checkbox) => checkbox.checked = checked);
  
    this._isMasterCheckboxActivated = false;

  }

  onDelete(Item?: IMenuItem, objToCalcBtnPosition?: IPropsForCalcBtnPosition) {

    this._setPositionQuickOrderBtn(objToCalcBtnPosition);

    if (Item) {

      Item.meta.itemMarkForDelete = true;

    }
    
    if (this.masterCheckBox) {

      this.pageWillLeave = this.masterCheckBox.checked;
      this.masterCheckBox.checked = false;

    }else {

      this.pageWillLeave = (Item && Item.quantity == this.shoppingCartService.CART_OBJECT_DB.TOTAL_ORDERS_IN_CART);

    }

    this._calculateItemDeleteCounter(0);
    
    this.shoppingCartService.removeFromCart(Item, this.pageWillLeave)
        .then(() => {

          if (this.pageWillLeave) {

            return asap.schedule(() => this._navCtrl.isActive(this._viewCtrl) && this._navCtrl.pop(), 1000);
          
          }

        });

  }

  onCancelAll() {

    this.onSelectAll();
    
    this.lists.length && this.lists.forEach((list: List) => list.closeSlidingItems());

  }

  onSelectSingle({ checked }: Checkbox): void {

    if (this._isMasterCheckboxActivated) return;

    this._calculateItemDeleteCounter(1, checked);
    this.masterCheckBox.checked = this.itemDeleteCounter == this.ionChBoxes.length;

  }

  onQuickOrderPage() { 

    if (this._isQuickOrderPageActivated ||
        !parseInt(this.areaQuickOrder.nativeElement.style.opacity) || 
        this.animator.isLocked || 
        !this.shoppingCartService.CART_OBJECT_DB.TOTAL_ORDERS_IN_CART) {

          return;
    }

    this.lists.forEach((list: List) => list.closeSlidingItems());
    
    this._isQuickOrderPageActivated = true;
    this._navCtrl.push(APP_QUICK_ORDER_PAGE);
  }

  ngAfterViewChecked() {
    
    if (typeof this._checkboxResolver === 'function' && this.ionChBoxes && this.ionChBoxes.length) {
      
      this._checkboxResolver();
      delete this._checkboxResolver;

    }
    
  }

  presentPopover($event: any) {
    
    if (this.animator.isLocked || !this.shoppingCartService.CART_OBJECT_DB.TOTAL_ORDERS_IN_CART) return;

    this._popoverCtrl.create('PopoverCartMenu')
      .present({ ev: $event });

  }

  ionViewDidEnter() {
    
    if (this.areaQuickOrder) {

      this._quickOrderButtonElement = this.areaQuickOrder.nativeElement;

    }
    
    this._setPositionQuickOrderBtn();
  }

  ionViewDidLoad() {

    this._events.subscribe(APP_EV.DELETE_CART_MODE, this._deleteModeFnCallback);
  }

  ionViewWillEnter() {
    
    delete this._isShopItemPageActivated;
    delete this._isQuickOrderPageActivated;
    delete this.pageWillLeave;
    delete this.STATE;
    delete this.STATE_1;
    delete this._isActionBtnClicked;

  }

  ionViewWillLeave() {
    
    this.onCancelAll();
    PopoverCartMenu.state = PopoverCartMenuEventFlags.DELETE;
    this._sub && this._sub.unsubscribe();
    this._sub = undefined;

  }

  ionViewWillUnload() {
    
    this._events.unsubscribe(APP_EV.DELETE_CART_MODE, this._deleteModeFnCallback);
    this.ionViewWillEnter();
    
  }

}




