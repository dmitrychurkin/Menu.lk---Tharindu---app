import { ViewChildren, QueryList, ElementRef, Injector, OnInit, AfterViewInit, ViewChild, AfterViewChecked, Renderer2 } from "@angular/core";
import { HttpProvider, PreloaderProvider, ImageLoader, RequestConfig } from "../providers";
import { mockBackendCall, mainMenu, shopMenus } from "./pages.constants";
import { NavParams, App, Content } from "ionic-angular";



export default class Base implements OnInit, AfterViewInit, AfterViewChecked {

  resultSet: any[] = [];
  protected readonly _pageName: string;
  private renderer2: Renderer2;
  private resourceResult: Promise<any>;
  @ViewChild(Content) _content: Content;
  @ViewChildren('imgContainer') private imgsContainers: QueryList<ElementRef>;

  private _configuredRequest: (...args: any[]) => any;

  private preloader: PreloaderProvider;
  private imagesLoader: ImageLoader;
  private httpProvider: HttpProvider;
  private _isImagesReady: (value?: true | PromiseLike<true>) => void;
  navParams: NavParams;
  app: App;

  
  constructor(injector: Injector, config: RequestConfig, job?: (...args: any[]) => any, isTesting= false) {
    this.preloader = injector.get(PreloaderProvider);
    // this.imagesLoader = injector.get(ImageLoaderProvider);
    this.httpProvider = injector.get(HttpProvider);
    this.navParams = injector.get(NavParams);
    this.app = injector.get(App);
    this.imagesLoader = injector.get(ImageLoader);
    this.renderer2 = injector.get(Renderer2);
    this._configuredRequest = this._setRequest(job= this._defaultJob.bind(this), config, isTesting);
  }
  ngOnInit() {
    this.getResource();
  }
  ngAfterViewInit() {
    this.resourceResult
        .then((resultSet: any) => {
          console.log(resultSet);
          this._isImagesReady = this.imagesLoader
                              .configure(this._content, this.renderer2, resultSet)
                              .isImagesReady;
          // this.imagesLoader.loadImages( this._extractImagesHelper(resultSet), this.imgsContainers ) 
        });
  }
  ngAfterViewChecked() {
    this._checkImages();
  }
  scrollHandler() {
    this.imagesLoader.updateImgs();
  }
  onSelect(e, pageProps) {
    this.app.getRootNav().push(this._pageName, pageProps);
  }
  getResource(job?: (...args: any[]) => any, config?: RequestConfig, isTesting?: boolean) {
    this.resourceResult = (typeof this._configuredRequest === 'function') ? 
     this._configuredRequest() : this._setRequest(job= this._defaultJob.bind(this), config, isTesting)();
     return this.resourceResult;
  }
  private _setRequest(job: (...args: any[]) => any, config: RequestConfig, isTesting: boolean) {
    console.log(config, job);
    const { url, isNeedSuccess, withPreloader= true } = config;

    return () => {

      let handlerFn = () => {
        if (isTesting) {
          return mockBackendCall( () => {
            console.log('Fake api call has made!');
            let resolvedMockData = null;
            switch (url) {
              case 'mainMenu':
                resolvedMockData = mainMenu;
              break;
              case 'shopMenus':
                resolvedMockData = shopMenus[this.navParams.get('name')] || [];
            }
            return Promise.resolve(job(resolvedMockData));
          }, isNeedSuccess ) ;
        }
        let httpRequest = this.httpProvider.configureRequest(config);
        return httpRequest().then(job);
      };

      if (withPreloader) {
        return this.preloader.startLoad( handlerFn );
      }

      return handlerFn();

    };
  }
  protected _extractImagesHelper(resource: Array<any>= [], fieldToken= 'imageUrl') {
    if (!Array.isArray(resource)) return;
    return resource.map((resorceItem: any) => resorceItem[fieldToken]);
  } 
  private _checkImages() {
    /*if (typeof this._isImagesReady === 'undefined' || this.imagesLoader._images.length == 0) {
      return;
    }*/
    if (this.imagesLoader._images.length == 0) return;
    if (typeof this._isImagesReady === 'function') {
      this._isImagesReady();
      delete this._isImagesReady;
    }
    
  }
  private _defaultJob(resultSet: any[]) {
    this.resultSet.push(...resultSet);
    return this.resultSet;
  }
}