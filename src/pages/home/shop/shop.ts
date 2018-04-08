import { Component, ViewChild, ElementRef, Injector, AfterViewInit } from "@angular/core";
import { IonicPage } from "ionic-angular";

import { Currency, APP_ITEM_PAGE, IMG_DATA_FIELD_TOKEN } from "../../pages.constants";
import Base from "../../page.base.class";
import { ShoppingCart } from "../../../providers";
import { IPageConfig, IMenuType, IMenuItem, IOrder } from "../../../interfaces";


@IonicPage()
@Component({
  selector: 'page-shop',
  templateUrl: 'shop.html'
})
export class ShopPage extends Base implements AfterViewInit {
  //@ViewChild('listContainer') listContElem: ElementRef;
  pageConfig: IPageConfig = {
    fireConfig: {
      scope: 'menus',
      queryFn: null
    },
    withPreloader: true,
    job(resultSet: any) {
      console.log("LOG FROM PAGE SHOPS ReSULT SET =>", resultSet);
      this.resultSet.push(...resultSet);
    }
  }
  resultSet = [];
  private _isShopClosed = false;
  protected readonly _pageName = APP_ITEM_PAGE;
  @ViewChild('header') headerElem: ElementRef;
  private _headerHeight: number;
  //@ViewChild('listHeader') listHeader: ElementRef;

  backgroundImage: string;

  // menus: Array<any>;

  currency = Currency;

  constructor(injector: Injector, public cart: ShoppingCart) { 
    super(injector);

    this.pageConfig.fireConfig.scope += `/${this.navParams.get("_id")}`; 
    this.initRequest(this.pageConfig);
  }
  onSelect(menuItem: IMenuItem, { type, subhead }:IMenuType) {
    this._navigateFromRoot(this._pageName, this._orderFactory(menuItem, type, subhead));
  }
  addToCart(menuItem: IMenuItem, { type, subhead }: IMenuType) {
    console.log("ACTIVATED ADD TO CART => menuItem ", menuItem, type, subhead);
    const Order: IOrder = this._orderFactory(menuItem, type, subhead);
    this.cart.addToCart(Order);
  }
  private _orderFactory(...args): IOrder {
    let [ item, type, subhead, quantity= 1 ] = args;
    return {
      id: this.navParams.get('_id'),
      entityName: this.navParams.get('name'),
      entityImage: this.navParams.get(IMG_DATA_FIELD_TOKEN),
      menu: { type, subhead, item, quantity }
    };
  }

  get isCanOrder() {
    return this.navParams.get('takeaway') && !this._isShopClosed;
  }
  get workingTime() {
    const workTime = this.navParams.get('workingTime');
    if (Array.isArray(workTime)) {
      if (!workTime[1]) return `Open ${workTime[0]} hours`;
      // shop parsed time;

      // user current time
      const nowUserTime = this._timeFormatter(new Date).split(' ');
      const closedShopTime = workTime[1].split(' ');
      const [ hoursUserTime, minutesUserTime ] = nowUserTime[0].split(':');
      const [ closedHoursShopTime, closedMinutesShopTime ] = closedShopTime[0].split(':');
      if ( parseInt(hoursUserTime) < parseInt(closedHoursShopTime)) {
        return `Closes ${workTime[1]}`;
      }else if ( parseInt(hoursUserTime) == parseInt(closedHoursShopTime) ) {
        if ( closedMinutesShopTime ) {
          if ( parseInt(minutesUserTime) < parseInt(closedMinutesShopTime) ) {
            return `Closes ${workTime[1]}`;
          }
        }
      }
      this._isShopClosed = true;
      return `Closed opens ${workTime[0]}`;
    }

  }
  /*ngOnInit() {
    console.log("this.pageConfig.fireConfig.scope => ", this.pageConfig.fireConfig.scope);
    this.apiProvider.afDb.list<any>(this.pageConfig.fireConfig.scope, null).valueChanges().subscribe(res => {
      console.log("SHOP PAGE TEST RESULT => ", res);
    });
  }*/
  ngAfterViewInit() {
    this._headerHeight = this.headerElem.nativeElement.offsetHeight;
    super.ngAfterViewInit();
  }
  get listContHeight() {
    const { innerHeight, innerWidth, matchMedia } = window;
    if ( matchMedia('(orientation: portrait)').matches ) {
      return Math.max(innerHeight, innerWidth) - this._headerHeight;
    }
    return Math.min(innerHeight, innerWidth) - this._headerHeight;
  }

  get listWrapHeight() {
    return this.listContHeight - this._headerHeight - 50;
  }
  /*ngOnInit() {
    this.resourceResult = 
            this.getMenus()
                .then((shopMenus: any) => this.menus = shopMenus);
  }
  ngAfterViewInit() {
    this.resourceResult
        .then((menus: any) => this.imagesLoader.loadImages( this._extractImagesHelper(menus), this.imgsContainers ))
        // .catch();
  }*/
  ionViewDidLoad() {
    this.backgroundImage = `url(${this.navParams.get(IMG_DATA_FIELD_TOKEN)})`;
  }
  //onSelect(e, itemProps) {
    //this.app.getRootNav().push(APP_ITEM_PAGE, itemProps);
  //}
  /*getMenus() {
    let testFlag = false;
    return this.preloadProvider.startLoad(() => mockBackendCall(() => {
      console.log('Fake api call has made!');
      return Promise.resolve(testFlag ? (shopMenus[this.navParams.get('name')] || []) : []);
    }, testFlag));
  }*/
}