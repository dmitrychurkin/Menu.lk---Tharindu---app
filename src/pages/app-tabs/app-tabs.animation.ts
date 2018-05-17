import { AnimationBuilder, style, animate } from "@angular/animations";

export default class {

  constructor(public animationBuilder: AnimationBuilder) {}
// Preloader actions
  removePreloader(element: any, onDoneFn?: () => void, params= { from: { transform: 'translateX(0)', position: 'absolute', top: 0, left: '50%', zIndex: -1 }, to: { transform: 'translateX(-500%)', opacity: 0 } }) {
    this._baseAnimationBuilder(element, params, onDoneFn);
  }

  showPreloader(element: any, onDoneFn?: () => void, params= { from: { transform: 'translateX(-500%)', position: 'absolute', top: 0, left: '50%', zIndex: -1 }, to: { transform: 'translateX(0)' } }) {
    this._baseAnimationBuilder(element, params, onDoneFn);
  }

  removePreloaderIfSign(element: any, onDoneFn?: () => void, params= { from: { transform: 'translateY(0)' }, to: { transform: 'translateY(30%)', opacity: 0 } }) {
    this._baseAnimationBuilder(element, params, onDoneFn);
  }

// LoginWidget actions
  showLoginWidget(element: any, onDoneFn?: () => void, params= { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } }) {
    this._baseAnimationBuilder(element, params, onDoneFn);
  }

  removeLoginWidget(element: any, onDoneFn?: () => void, params= { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } }) {
    this._baseAnimationBuilder(element, params, onDoneFn);
  }

  private _baseAnimationBuilder(element: any, { from, to, timingProps }: IAnimationProps, onDoneFn?: () => void, onStartFn?: () => void) {
    const player = this.animationBuilder.build([
      style( from || '*' ),
      this._animationHelper( to, timingProps )
    ]).create(element);
    player.onStart( () => {
      typeof onStartFn === 'function' && onStartFn();
    } );
    player.onDone( () => {
      typeof onDoneFn === 'function' && onDoneFn();
      player.destroy();
    } );
    player.play();
  }
  private _animationHelper(cssProps: { [key: string]: string | number }, animationProps= '1s cubic-bezier(0.4, 0, 0.2, 1)') {
    return animate(animationProps, style( cssProps ));
  }
}

interface IAnimationProps {
  from: { [name: string]: any };
  to: { [name: string]: any };
  timingProps?: string;
}