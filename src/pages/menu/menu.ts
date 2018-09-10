import { Component, ViewChild } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { AngularFirestore } from 'angularfire2/firestore';
import { Header, IonicPage, NavController, NavParams, Platform, Tabs } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IMenuItem, IMenuType, IOrder, IRestaurants } from '../../interfaces';
import { ShoppingCartService, MessangingService, NetworkService, AvailabilityService } from '../../services';
import { APP_SHOP_ITEM_PAGE, Currency, IMG_DATA_FIELD_TOKEN, FIREBASE_DB_TOKENS, TemplateViewStates, MAX_CART_ITEMS } from '../pages.constants';


const { MENUS } = FIREBASE_DB_TOKENS;

@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html'
})
export class MenuPage  {

  @ViewChild(Header) private _header: Header;

  States = TemplateViewStates;
  currentState: TemplateViewStates;
  currency = Currency;
  RestaurantData: IRestaurants;
  ShopMenu = [];
  listContainerHeight: number;
  listWrapperHeight: number;

  private _shopMenuSub: Subscription;
  private _screenOrientationSub: Subscription;
  private _pageTransitionLock: boolean;

  constructor(private readonly _platform: Platform,
              private readonly _navCtrl: NavController,
              private readonly _shoppingCartService: ShoppingCartService,
              private readonly _tabs: Tabs,
                      readonly availabilyService: AvailabilityService,
                      readonly messService: MessangingService,
                      readonly networkService: NetworkService,
                              screenOrientation: ScreenOrientation,
                              navParams: NavParams, 
                              afDb: AngularFirestore) {
    
    this.RestaurantData = navParams.data;

    this.currentState = TemplateViewStates.RequestSent;

    const menuDoc = afDb.doc<TShnopMenus>(`${MENUS}/${this.RestaurantData.id}`);
    this._shopMenuSub = menuDoc.valueChanges()
                                .subscribe((shopMenus: TShnopMenus) => {
                                  
                                  if (typeof shopMenus === 'object' && Array.isArray(shopMenus.shop_menus)) {

                                    this.ShopMenu.push(...shopMenus.shop_menus);
                                    this.currentState = TemplateViewStates.None;

                                  }else {

                                    this.currentState = TemplateViewStates.ResponseEmpty;

                                  }

                                });
    this._screenOrientationSub = screenOrientation.onChange()
                                            .pipe(delay(300))
                                            .subscribe(() => 
                                              this._setHeight()
                                            );
  }

  get backgroundImage() {

    return `url(${this.RestaurantData[IMG_DATA_FIELD_TOKEN]})`;

  }

  ionViewWillEnter() {

    delete this._pageTransitionLock;

  }

  ionViewWillUnload() {

    this._shopMenuSub.unsubscribe();
    this._screenOrientationSub.unsubscribe();
    this._shopMenuSub = this._screenOrientationSub = undefined;

  }

  ionViewDidEnter() {

    this._setHeight();

  }

  onTapItem({ target }: any, menuItem: IMenuItem, menuType:IMenuType) {

    if (this._pageTransitionLock) return;
    
    const order: IOrder = this._compileDataIntoFutureOrder(menuItem, menuType);
  
    if (target.closest('.btn-addToCart')) {

      this._shoppingCartService.addToCart(order);

    }else {

      this._pageTransitionLock = true;
      this._navCtrl.push(APP_SHOP_ITEM_PAGE, order);

    }

  }

  private _compileDataIntoFutureOrder(menuItem: IMenuItem, { type, subhead }:IMenuType): IOrder {

    const { id, name: entityName, collection } = this.RestaurantData;

    return {
      id, entityName, collection, resourceLink: this.RestaurantData,
      menu: {
        type, 
        subhead, 
        userNotes: '', 
        quantity: MAX_CART_ITEMS - this._shoppingCartService.CART_OBJECT_DB.TOTAL_ORDERS_IN_CART == 0 ? 0 : 1, 
        item: menuItem
      }
    };
  }

  private _setHeight() {

    this.listContainerHeight = this._listContainerHeight();
    this.listWrapperHeight = this._listWrapperHeight();

  }

  private _listContainerHeight() {
    
    const width = this._platform.width();
    const height = this._platform.height();
    
    return (this._platform.isPortrait() ? Math.max(height, width) : Math.min(height, width)) - (this._headerHeight + this._tabbarHeight);

  }

  private _listWrapperHeight() {
  
    return this.listContainerHeight - (this._headerHeight + this._tabbarHeight);
  
  }

  private get _tabbarHeight() {

    const tabbarEl: HTMLElement | void = this._tabs._tabbar.nativeElement;
    return tabbarEl ? tabbarEl.offsetHeight : 1;

  }

  private get _headerHeight() {

    const headerEl: HTMLElement | void = this._header.getNativeElement();

    return headerEl ? headerEl.offsetHeight : 56;

  }

}

type TShnopMenus = { shop_menus: IMenuType[] };