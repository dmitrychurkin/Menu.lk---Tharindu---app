import { Component, ViewChild } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { AngularFirestore } from 'angularfire2/firestore';
import { Header, IonicPage, NavController, NavParams, Platform, Tabs } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IMenuItem, IMenuType, IOrder, IRestaurants } from '../../interfaces';
import { ShoppingCartService, MessangingService, NetworkService } from '../../services';
import { APP_SHOP_ITEM_PAGE, Currency, IMG_DATA_FIELD_TOKEN, FIREBASE_DB_TOKENS, APP_MENU_PAGE, TemplateViewStates } from '../pages.constants';


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
  
  backgroundImage: string;

  listContainerHeight: number;
  listWrapperHeight: number;

  private _isShopClosed: boolean;
  private _shopMenuSub: Subscription;
  private _screenOrientationSub: Subscription;
  private _pageTransitionLock: boolean;

  constructor(private readonly _platform: Platform,
              private readonly _navCtrl: NavController,
              private readonly _shoppingCartService: ShoppingCartService,
              private readonly _tabs: Tabs,
                      readonly messService: MessangingService,
                      readonly networkService: NetworkService,
                              screenOrientation: ScreenOrientation,
                              navParams: NavParams, 
                              afDb: AngularFirestore) {
    
    this.RestaurantData = navParams.data;
    this.backgroundImage = `url(${this.RestaurantData[IMG_DATA_FIELD_TOKEN]})`;                          
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

  get workingTime() {

    const { workingTime } = this.RestaurantData;

    const { isClosed, message } = this._checkAvailability( 
      Array.isArray(workingTime) ? { open: workingTime[0], close: workingTime[1] } : workingTime
    );

    this._isShopClosed = isClosed;

    return message;

  }

  get isCanOrder() {

    return this.RestaurantData.takeaway && !this._isShopClosed;

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
      id, entityName, collection, isClosed: this._isShopClosed,
      menu: {
        type, subhead, userNotes: '', quantity: 1, item: menuItem
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

  private _checkAvailability({ open, close }: { open: string; close: string }, date= new Date): { isClosed: boolean, message: string } {

    if (close) {

      const toNumber = (timeStr: string) => +timeStr.split(':').join('');
      const timeConverterFn = (timeStr) => {
  
        const timeParts = timeStr.split(':');
        
        return `${ +timeParts[0] % 12 || 12 }${ +timeParts[1] == 0 ? ' ' : `:${timeParts[1]} ` }${ +timeParts[0] < 12 ? 'AM' : 'PM' }`
  
      };

      const openTimeNum = toNumber(open);
      const closeTimeNum = toNumber(close);
      const currentTimeNum = +`${date.getHours()}${('0' + date.getMinutes()).slice(-2)}`;
      const closedResult = { message: this.messService.getMessage(`closed_${APP_MENU_PAGE}`, timeConverterFn(open)), isClosed: true };
      const openResult = { message: this.messService.getMessage(`open_${APP_MENU_PAGE}`, timeConverterFn(close)), isClosed: false };
  
      if (closeTimeNum < openTimeNum) {
  
        if (currentTimeNum < openTimeNum && currentTimeNum >= closeTimeNum) {
  
          return closedResult;
  
        }
  
        return openResult;
  
      }
  
      
  
      if (currentTimeNum >= openTimeNum && currentTimeNum < closeTimeNum) {
  
        return openResult;
  
      }
  
      return closedResult;
  
    }
  
    return { message: this.messService.getMessage(`open24_7_${APP_MENU_PAGE}`, open), isClosed: false };

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