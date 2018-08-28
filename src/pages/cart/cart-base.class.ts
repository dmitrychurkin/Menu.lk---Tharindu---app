import { ElementRef, Injector, QueryList, Renderer2, ViewChild, ViewChildren } from "@angular/core";
import { ScreenOrientation } from "@ionic-native/screen-orientation";
import { Content, Item, List } from "ionic-angular";
import { delay } from "rxjs/operators";
import { Subscription } from "rxjs/Subscription";
import { Animator } from "../animations-base.class";
import { PopoverCartMenuEventFlags } from "../pages.constants";


export default class {

  private readonly _renderer2: Renderer2 = this._injector.get(Renderer2);
  private readonly _screenOrientation: ScreenOrientation = this._injector.get(ScreenOrientation);

  protected _sub: Subscription;
  protected _deleteModeFnCallback: (a: PopoverCartMenuEventFlags) => void = this._deleteModeHandler();

  protected _checkboxResolver: () => void;

  protected _quickOrderButtonElement: HTMLButtonElement;

  @ViewChild('QuickOrder', { read: ElementRef }) areaQuickOrder: ElementRef;
  @ViewChild(Content) content: Content;

  @ViewChild(List) list: List;
  @ViewChildren('ionItem') ionItem: QueryList<Item>;

  pageWillLeave: boolean;

  isDeleteModeEnabled = false;

  STATE: PopoverCartMenuEventFlags;
  STATE_1: any;

  checkboxStyles = {
    out: {
      width: '0',
      marginLeft: '0',
      marginRight: '0',
      opacity: 0,
      transform: 'translateX(-1000%)',
      transition: 'transform 500ms, width 500ms 250ms, margin-left 500ms 250ms, margin-right 500ms 250ms, opacity 500ms 1ms'
    },
    in: {
      marginLeft: '4px',
      marginRight: '20px',
      width: '5%',
      opacity: 1,
      transform: 'translateX(0)',
      transition: 'transform 500ms 250ms, width 500ms, margin-left 500ms, margin-right 500ms'
    }
  };

  buttonPosition: string;

  itemDeleteCounter = 0;

  s = PopoverCartMenuEventFlags;

  animator = new Animator();
  

  constructor(private readonly _injector: Injector) {

    this._sub = this._screenOrientation
      .onChange()
      .pipe(delay(1))
      .subscribe(() => this._setPositionQuickOrderBtn());

  }

  protected _setPositionQuickOrderBtn(objToCalcBtnPosition?: IPropsForCalcBtnPosition) {

    const S = 'static';
    const A = 'absolute';
    this.buttonPosition = A;

    if (this._screenOrientation.type.includes(this._screenOrientation.ORIENTATIONS.LANDSCAPE)) {

      this.buttonPosition = S;

      return;

    }

    const contentHeight = this.content.getContentDimensions().contentHeight;

    if (this.content && this._quickOrderButtonElement && this.list && contentHeight > 0) {

      const btnHeight = this._quickOrderButtonElement.offsetHeight;
      const listHeight = this.list.getNativeElement().offsetHeight;
      let cutover = 0;

      if (typeof objToCalcBtnPosition === 'object') {

        const { deviderElem, itemsLength, index } = objToCalcBtnPosition;
        cutover = this.ionItem.toArray()[index].getNativeElement().offsetHeight;

        if (itemsLength == 1) {

          cutover += deviderElem.getNativeElement().offsetHeight;

        }

      }
       
      this.buttonPosition = listHeight - cutover + btnHeight < contentHeight ? A : S;

    }

  }

  protected _calculateItemDeleteCounter(amount: number, flagOperation?: boolean) {

    if (typeof flagOperation === 'boolean') {

      flagOperation ? this.itemDeleteCounter += amount : this.itemDeleteCounter -= amount;

    } else {

      this.itemDeleteCounter = amount;

    }

    this.animator.animate({
      elemSelector: '.js-btns',
      transition: '.5s ease-in-out',
      duration: 500,
      onBeforeTransition: () => 
            this.itemDeleteCounter > 0 && (!this.STATE_1 || this.STATE_1 === PopoverCartMenuEventFlags.CANCEL) 
            || !this.itemDeleteCounter && this.STATE_1 === PopoverCartMenuEventFlags.DELETE
            || this.pageWillLeave,
      onTransitionDone: (btnsArray: HTMLElement[]) => {
        btnsArray.forEach((btn: HTMLElement) => btn.style.opacity = '');
        this.STATE_1 = this.pageWillLeave || (this.itemDeleteCounter > 0 ? PopoverCartMenuEventFlags.DELETE : PopoverCartMenuEventFlags.CANCEL);
      }
    });

    if (this.pageWillLeave) {

      if (this.STATE === PopoverCartMenuEventFlags.DELETE) {

        this._deleteModeFnCallback(PopoverCartMenuEventFlags.CANCEL);

      }

    }

  }

  protected _deleteModeHandler(): (popoverFlag: PopoverCartMenuEventFlags) => void {

    return (popoverFlag: PopoverCartMenuEventFlags): void => {

      switch (popoverFlag) {

        case this.s.DELETE: {

          this.list.sliding = !(this.isDeleteModeEnabled = true);
          this.list.closeSlidingItems();
          new Promise((res: () => void) => this._checkboxResolver = res)
            .then(() => this.animator.animate({
              elemSelector: '.js-checkboxes',
              transition: this.checkboxStyles.in.transition,
              styles: this.checkboxStyles.in,
              delay: 30,
              duration: 780,
              onTransitionDone: (checkboxes: HTMLElement[]) => checkboxes.forEach((checkbox: HTMLElement) => this._renderer2.setStyle(checkbox, 'transform', 'none'))
            }));

          break;
        }
        case this.s.CANCEL: {

          this.isDeleteModeEnabled = false;

          if (!this.pageWillLeave) {

            this.animator.animate({
              elemSelector: '.js-checkboxes',
              transition: this.checkboxStyles.out.transition,
              styles: this.checkboxStyles.out,
              delay: 1,
              onBeforeTransition: (checkboxes: HTMLElement[]) => !checkboxes.forEach((checkbox: HTMLElement) => this._renderer2.setStyle(checkbox, 'transform', 'translateX(0)')),
              onTransitionDone: () => this.list.sliding = true
            });

          }

          break;
        }
      }

      
      this.animator.animate({
        elemSelector: '.js-token',
        transition: '.5s ease-in-out',
        duration: PopoverCartMenuEventFlags.DELETE === popoverFlag ? 500 : 750,
        onTransitionDone: () => this.STATE = popoverFlag
      });
    };
  }

}

export interface IPropsForCalcBtnPosition {
  readonly deviderElem: Item;
  readonly itemsLength: number;
  readonly index: number;
}