import { Component, ElementRef, Renderer2, ViewChild, AfterViewChecked } from '@angular/core';
import { Checkbox, Events, IonicPage, List, NavController, PopoverController, Content } from 'ionic-angular';
import { asap } from 'rxjs/Scheduler/asap';
import { CartWidgetComponent } from '../../components';
import { Cart, IEntityInCart, IMenuItem } from '../../interfaces';
import { IDatasetIteratorLambdaObjectInfo, ShoppingCart, StorageProvider } from '../../providers';
import { APP_EV, Currency, DATABASE_TOKENS, PopoverCartMenuEventFlags, APP_QUICK_ORDER_PAGE, ANGULAR_ANIMATION_OPACITY } from '../pages.constants';
import { PopoverCartMenu } from './popover-cart-menu/popover-cart-menu';


@IonicPage()
@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html',
  animations: ANGULAR_ANIMATION_OPACITY
})
export class CartPage implements AfterViewChecked {
  @ViewChild('QuckOrder', { read: ElementRef }) areaQuickOrder: ElementRef;
  @ViewChild(Content) content: Content;
  @ViewChild('Title', { read: ElementRef }) title: ElementRef;
  @ViewChild('MasterCheckBox') masterCheckBox: Checkbox;
  @ViewChild(List) list: List;
  @ViewChild(CartWidgetComponent) cartWidget: CartWidgetComponent;
  itemDeleteCounter = 0;
  isSingleValueCheckboxBeenAct = false;
  Cart: Array<IEntityInCart>;
  currency = Currency;
  isDeleteModeEnabled = false;
  titleDesc = '';
  animator: ICheckBox = CHECKBOXES_DEFAULT_STYLES;
  s = PopoverCartMenuEventFlags;

  private _deleteModeFnCallback: Function;
  buttonPosition: string;
  private _isQuickOrderPageActivated: boolean;

  constructor(
    private _navCtrl: NavController,
    private _renderer2: Renderer2,
    private _events: Events,
    private _popoverCtrl: PopoverController,
    private _shoppingCartCtrl: ShoppingCart,
    private _storageProvider: StorageProvider) {
    this._getItems();
  }
  onQuickOrderPage() {
    this.list.closeSlidingItems();
    this._isQuickOrderPageActivated = true;
    this._navCtrl.push(APP_QUICK_ORDER_PAGE);
  }
  ngAfterViewChecked() {
    asap.schedule(() => this._setPositionBtn());
  }
  private _setPositionBtn() {
    try {
      if (this.content && this.areaQuickOrder && this.list && this.content.contentHeight > 0) {
        const btnHeight = this.areaQuickOrder.nativeElement.offsetHeight;
        const listHeight = this.list.getNativeElement().offsetHeight;
        this.buttonPosition = (listHeight + btnHeight + 100 < this.content.contentHeight) ?
            'absolute' : 'static';
      }
    }catch(err) {}
  }

  onSelectSingle(Item: IMenuItem, $event: Checkbox) {
    if ($event.value) {
      this._addOne();
      let isAllCheckBoxesChecked = true;
      this._shoppingCartCtrl.datasetIterator(({ menuItem }: IDatasetIteratorLambdaObjectInfo) => {
        if (isAllCheckBoxesChecked && !menuItem.meta.itemMarkForDelete) {
          isAllCheckBoxesChecked = false;
        }
      }, this.Cart);
      if (isAllCheckBoxesChecked) {
        this.masterCheckBox.checked = true;
      }
    } else {
      this._deductOne();
      const { value } = this.masterCheckBox;
      if (value) {
        this.isSingleValueCheckboxBeenAct = true;
        this.masterCheckBox.checked = false;
      }
    }
  }

  onCancelAll() {
    this.masterCheckBox.checked = false;
    this.onSelectAllChange(this.masterCheckBox);
    this.ionViewWillLeave();
  }

  onSelectAllChange($event: Checkbox) {
    if (this.isSingleValueCheckboxBeenAct) {
      this.isSingleValueCheckboxBeenAct = false;
      return;
    }
    this._shoppingCartCtrl.datasetIterator(({ menuItem }: IDatasetIteratorLambdaObjectInfo, $event: Checkbox) => {
      if ($event.value && !menuItem.meta.itemMarkForDelete) {
        this._addOne();
        menuItem.meta.itemMarkForDelete = true;
      } else if (!$event.value && menuItem.meta.itemMarkForDelete) {
        this._deductOne();
        menuItem.meta.itemMarkForDelete = false;
      }
    }, this.Cart, $event);
  }

  onSelectAll(masterCheckBox: Checkbox) {
    const { value } = masterCheckBox;

    masterCheckBox.checked = !value;
  }

  onDeleteItemSet() {

    this._shoppingCartCtrl.removeFromCart(this.Cart)
      .then(() => {
        this.masterCheckBox.checked = !!(this.itemDeleteCounter = 0);
        this.ionViewWillLeave();
        this._leaveCartPage()
      });
  }

  onDeleteItem(Item: IMenuItem) {
    this._shoppingCartCtrl.removeFromCart(Item, this.Cart)
      .then(() => this._leaveCartPage());
  }

  deleteModeHandler() {
    return (popoverFlag: PopoverCartMenuEventFlags) => {

      if (!this._isQuickOrderPageActivated) {
        this._renderer2.addClass(this.title.nativeElement, 'remove');
      }

      switch (popoverFlag) {
        case this.s.DELETE: {
          this.list.sliding = !(this.isDeleteModeEnabled = true);

          asap.schedule(() => this.titleDesc = this.s.DELETE, 500);

          asap.schedule(() => {
            this.animator = CHECKBOXES_DELETE_STYLES;
            asap.schedule(() => this.animator.transform = 'none', 750);
          }, 100);
          this.list.closeSlidingItems();
          break;
        }
        case this.s.CANCEL: {

          this.animator = CHECKBOXES_DEFAULT_STYLES;

          asap.schedule(() => this.titleDesc = this.s.CANCEL, 500);

          asap.schedule(() => {
            if (this.list) {
              this.list.sliding = !(this.isDeleteModeEnabled = false);
            }
            asap.schedule(() => this.cartWidget && (this.cartWidget.buttonDisabled = true));
          }, 750);
          break;
        }
      }
    };
  }

  presentPopover($event: any) {
    this._popoverCtrl.create('PopoverCartMenu')
      .present({ ev: $event });
  }
  
  ionViewDidLoad() {
    this.cartWidget.buttonDisabled = true;

    if (typeof this._deleteModeFnCallback !== 'function') {
      this._deleteModeFnCallback = this.deleteModeHandler();
      this._events.subscribe(APP_EV.DELETE_CART_MODE, this._deleteModeFnCallback);
    }
  }

  ionViewWillEnter() {
    this._isQuickOrderPageActivated = false;
  }

  ionViewWillLeave() {
    this._deleteModeFnCallback(PopoverCartMenuEventFlags.CANCEL);
    PopoverCartMenu.state = PopoverCartMenuEventFlags.DELETE;
  }

  ionViewWillUnload() {
    if (typeof this._deleteModeFnCallback === 'function') {
      this._events.unsubscribe(APP_EV.DELETE_CART_MODE, this._deleteModeFnCallback);
    }
  }

  private _addOne() {
    if (this.itemDeleteCounter + 1 <= this._getItemsCountInCart) {
      this.itemDeleteCounter += 1;
    }
  }

  private _deductOne() {
    if (this.itemDeleteCounter - 1 >= 0) {
      this.itemDeleteCounter -= 1;
    }
  }

  private _leaveCartPage() {
    if (this._getItemsCountInCart == 0) {
      asap.schedule(() => this._navCtrl.pop(), 1000);
    }
  }

  private get _getItemsCountInCart() {
    let totalItems = 0;
    this._shoppingCartCtrl.datasetIterator(({ menuItem }: IDatasetIteratorLambdaObjectInfo) => {
      if (menuItem._id) {
        totalItems++;
      }
    }, this.Cart);
    return totalItems;
  }

  private _setMetaProps(Cart: IEntityInCart[]) {
    this._shoppingCartCtrl.datasetIterator(({ menuItem }: IDatasetIteratorLambdaObjectInfo) => {
      if (typeof menuItem.meta !== 'object') {
        menuItem.meta = { itemMarkForDelete: false };
      }
    }, Cart);
  }

  private _getItems() {
    return this._storageProvider.getItem(DATABASE_TOKENS.SHOPPING_CART)
      .then((CartEntity: Cart) => {
        this.Cart = CartEntity.CART;
        this._setMetaProps(this.Cart);
      });
  }

}

const CHECKBOXES_DEFAULT_STYLES = {
  width: '0',
  marginLeft: '0',
  marginRight: '0',
  transform: 'translateX(-1000%)',
  transition: 'transform 500ms, width 500ms 250ms, margin-left 500ms 250ms, margin-right 500ms 250ms'
};
const CHECKBOXES_DELETE_STYLES = {
  marginLeft: '4px',
  marginRight: '20px',
  width: '5%',
  transform: 'translateX(0)',
  transition: 'transform 500ms 250ms, width 500ms, margin-left 500ms, margin-right 500ms'
};

interface ICheckBox {
  marginLeft: string;
  marginRight: string;
  width: string;
  transform: string;
}