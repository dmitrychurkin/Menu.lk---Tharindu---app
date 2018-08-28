import { AnimationBuilder } from "@angular/animations";
import AnimationsBaseClass from '../animations-base.class'

export default class extends AnimationsBaseClass {

  constructor(animationBuilder: AnimationBuilder) { super(animationBuilder); }
// Preloader actions
  removePreloader(element: any, onDoneFn?: () => void, params= { from: { transform: 'translateX(0)', position: 'absolute', top: 0, /*left: '50%',*/ zIndex: -1, backgroundColor: 'rgba(0, 0, 0, .0)' }, to: { transform: 'translateX(-30%)', /*opacity: 0,*/ backgroundColor: 'rgba(0, 0, 0, .2)' } }) {
    this._baseAnimationBuilder(element, params, onDoneFn);
  }

  showPreloader(element: any, onDoneFn?: () => void, params= { from: { transform: 'translateX(-30%)', position: 'absolute', top: 0, /*left: '50%',*/ zIndex: -1, backgroundColor: 'rgba(0, 0, 0, .2)' }, to: { transform: 'translateX(0)', backgroundColor: 'rgba(0, 0, 0, .0)' } }) {
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

  // New User Widget actions

  showNewUserWidget(element: any, onDoneFn?: () => void) {
    this.showLoginWidget(element, onDoneFn);
  }

}
