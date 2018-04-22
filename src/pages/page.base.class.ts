import { AfterViewInit, Injector, Renderer2, ViewChild } from "@angular/core";
import { AlertController, App, Content, Events, Loading, LoadingController, NavParams, Platform } from "ionic-angular";
import { IPageConfig, IRestaurants } from "../interfaces";
import { ApiProvider, ImageLoader } from "../providers";
import { ScreenOrientation } from "@ionic-native/screen-orientation";


export default class Base implements AfterViewInit {
  
  // infinity scroll props
  // lastKey: string;
  //isFinished = false;

  // main data holder
  // resultSet: IRestaurants[] = [];

  // service props
  // protected _toggleHandlerRef$: Function;
  @ViewChild(Content) _content: Content;
  // private _configuredRequest: (...args: any[]) => any;
  private renderer2: Renderer2;
  private resourceResult: Promise<any>;
  private loadingCtrl: LoadingController;
  private alertCtrl: AlertController;
  imagesLoader: ImageLoader;
  apiProvider: ApiProvider;
  events: Events;
  screenOrientation: ScreenOrientation;
  platform: Platform;
  
  // new page push props
  // protected readonly _pageName: string;
  navParams: NavParams;
  app: App;

  
  constructor(injector: Injector) {

    // this.preloader = injector.get(PreloaderProvider);
    this.loadingCtrl = injector.get(LoadingController);
    this.alertCtrl = injector.get(AlertController);
    this.apiProvider = injector.get(ApiProvider);
    this.navParams = injector.get(NavParams);
    this.app = injector.get(App);
    this.imagesLoader = injector.get(ImageLoader);
    this.renderer2 = injector.get(Renderer2);
    this.events = injector.get(Events);
    this.screenOrientation = injector.get(ScreenOrientation);
    this.platform = injector.get(Platform);
    // if (pageConfig) {
    //   this._configuredRequest = this._setRequest(pageConfig);
    // }
  }
  initRequest(pageConfig: IPageConfig) {
    // this._configuredRequest = this._setRequest(pageConfig);
    this.resourceResult = this.getResource(pageConfig);
  }
  // ngOnInit() {
  //   if (!this.navParams.get('_id')) {
  //     this.events.subscribe(APP_EV.SORT_LIST, this._toggleHandlerRef$);
  //   }
  // }
  get isOrientationPortrait() {
    return this.screenOrientation.type.startsWith(this.screenOrientation.ORIENTATIONS.PORTRAIT)
  }

  ngAfterViewInit() {
    this.imagesLoader.configure(this._content, this.renderer2);
    
    // console.log("DEBUG FROM ngAfterViewInit => this.resourceResult ", this.resourceResult);
    // (this.resourceResult as Promise<any>)
    //     .then((resultSet: any) => {
    //       console.log("DEBUG FROM ngAfterViewInit => this.resourceResult then ", resultSet);
    //      if (!resultSet) return;
         
    //       // this.imagesLoader.configure(this._content, this.renderer2)
    //     });
  }
  //ionViewWillUnload() {
    //this.events.unsubscribe(APP_EV.SORT_LIST, this._toggleHandlerRef$);
  //}
  
  
  scrollHandler() {
    this.imagesLoader.updateImgs();
  }
  // onSelect(pageProps: any) {
  //   this._navigateFromRoot(this._pageName, pageProps);
  // }
  getResource(pageConfig: IPageConfig) {
    /*this.resourceResult = (typeof this._configuredRequest === 'function') ? 
     this._configuredRequest() : this._setRequest(pageConfig || {})();
     return this.resourceResult;*/
    return this._sendRequest(pageConfig);
  }
  private _sendRequest(pageConfig:IPageConfig) {
  
    let { job, fireConfig, httpConfig, withPreloader= true } = pageConfig;
    // job = typeof job !== 'function' ? (result: IRestaurants[]) => this._defaultJob(result, pageConfig) : job.bind(this);
    job = typeof job !== 'function' ? (result: IRestaurants[]) => result : job.bind(this);
    //return () => {
      
    let requestFn: any = this.apiProvider.configureRequest({ fireConfig, httpConfig }); 
    let loading: Loading | null = null;

    if (withPreloader) {
      // return this.preloader.startLoad({ job: handlerFn(), onSuccess: job });
      loading = this.loadingCtrl.create({
        content: 'Please wait...',
        dismissOnPageChange: false
      }); 
      loading.present();
    }

    return new Promise( (res: any, rej: any) => 
      requestFn().subscribe((result: IRestaurants[]) => {

        job(result/*, pageConfig*/);
        loading && loading.dismiss();
        res(result)

      }, (err: any) => rej(err) )
    ).catch((err: any) => {
      loading && loading.dismiss();
      this.alertCtrl.create({
        buttons: [{ text: 'Retry', role: 'retry', handler: () => { this._sendRequest(pageConfig) } }],
        title: 'Error',
        message: 'Error occured while loading resource, please check internet connection.'
      }).present();
      return err;
    });
    //};
  }
  
  
  /*private _sortingFn(reversed= false, sortingProp= 'rating') {

    return (a: any, b: any) => reversed ? b[sortingProp] - a[sortingProp] : a[sortingProp] - b[sortingProp];
  }*/
  
  
  /*protected _navigateFromRoot(pageName: string, pageProps?: any) {
    this.app.getRootNav().push(pageName, pageProps);
  }*/
  
}