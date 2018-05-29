import { Injectable } from "@angular/core";
import { Error as AuthError, User } from "@firebase/auth-types";
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import * as firebase from 'firebase/app';
import { Alert, AlertController } from "ionic-angular";
import { asap } from "rxjs/Scheduler/asap";
import { IPwdAuthUserData } from "../interfaces";

export enum Providers { GOOGLE, PWD, ANONYMUS };

@Injectable()
export class AuthProvider {

  user$ = this.afAuth.authState;
  isNewUser: boolean;
  pwdAuthUserData: IPwdAuthUserData;
  
  constructor(
    public afAuth: AngularFireAuth,
    public afDb: AngularFireDatabase,
    public alertCtrl: AlertController) {}

  get userInstance() {
    return this.afAuth.auth.currentUser;
  }

  signIn(flag: Providers, handlers?: IPWDSignInFlowHandlers) {

    switch (flag) {
      case Providers.GOOGLE: {
        return this.afAuth
          .auth
          .signInWithRedirect(new firebase.auth.GoogleAuthProvider);
      }
      case Providers.PWD: {
        return this._signInPwdFlow(handlers);
      }
      case Providers.ANONYMUS: {
        return this.afAuth
          .auth
          .signInAnonymously();
      }
    }
  }

  signOut() {
    return this.afAuth
      .auth
      .signOut().then(() => this.pwdAuthUserData && delete this.pwdAuthUserData);
  }

  private _signInPwdFlow({ onCancel= function(){}, onSuccess= function(){} }: IPWDSignInFlowHandlers) {
    
    const USER_EMAIL = 'user_email';
    const EMAIL_ID = 'email_textfield';

    const USER_NAME = 'user_name';
    const NAME_ID = 'name_textfield';

    const USER_PWD = 'user_password';
    const PWD_ID = 'password_textfield';

    const STYLE_ERROR = '1px solid #f53d3d';
    const STYLE_GOOD = '1px solid #32db64';

    const ERROR_CLASS_NAME = 'error';

    const getElementsHelper: (alertInstance: Alert) => IUIFields = (alertInstance: Alert) => {
      return {
        alert: alertInstance.instance._elementRef.nativeElement,
        email: document.getElementById(EMAIL_ID) as HTMLInputElement,
        name: document.getElementById(NAME_ID) as HTMLInputElement,
        pwd: document.getElementById(PWD_ID) as HTMLInputElement
      };
    }
    const uiErrorFlowHelper = (alertElement: HTMLElement, inputElement: HTMLInputElement, errorMessage?: string) => {
      const { classList } = alertElement;
      
      if (!classList.contains(ERROR_CLASS_NAME)) {
        classList.add(ERROR_CLASS_NAME);
      }
      const errorContainerElem = document.createElement('span');
      inputElement.parentElement.appendChild(errorContainerElem);
      errorContainerElem.classList.add('error-message');
      inputElement.style.borderBottom = STYLE_ERROR;
      errorContainerElem.innerHTML = errorMessage || inputElement.validationMessage;
      return false;
    };
    const clearPreviousErrors = () => {
      Array.from(document.querySelectorAll('.error-message')).forEach((errorContainer: HTMLSpanElement) => {
        const inputElement = errorContainer.previousElementSibling as HTMLInputElement;
        inputElement.style.borderBottom = '';
        errorContainer.remove();
      });
    };

    const blurHandler = (alert: HTMLElement) => (ev: FocusEvent) => {
      const target: HTMLInputElement = ev.target as HTMLInputElement;

      if (!target.checkValidity()) {
        uiErrorFlowHelper(alert, target);
      }else {
        clearPreviousErrors();
        target.style.borderBottom = STYLE_GOOD;
      }
    };

    const focusHandler = () => () => clearPreviousErrors();
      
    const emailInputOpts = {
      type: 'email',
      name: USER_EMAIL,
      placeholder: 'Email',
      id: EMAIL_ID
    };

    const isUserInputValid = (alertInstance: Alert, initialEmail?: string, dataEmail?: string) => {
      
      clearPreviousErrors();

      const { email, pwd, name, alert } = getElementsHelper(alertInstance);
      let hasError = false;

      if (initialEmail && dataEmail) {
        if (initialEmail !== dataEmail) {
          hasError = !uiErrorFlowHelper(alert, email, `Email must to be ${initialEmail}`);
        }
      }else {
        if (email && !email.checkValidity()) {
          hasError = !uiErrorFlowHelper(alert, email);
        }
      }
        
      if (name && !name.checkValidity()) {
        hasError = !uiErrorFlowHelper(alert, name);
      }
      if (pwd && !pwd.checkValidity()) {
        hasError = !uiErrorFlowHelper(alert, pwd);
      }

      return !hasError;

    };

    const mainEmailAuthFlowFn = (errMsg?: string, cssClass?: string) => {
      
      return new Promise((resolve: (value: User) => void) => {

        const promtEmail = this.alertCtrl.create({
          title: 'Sign in with email',
          enableBackdropDismiss: false,
          message: errMsg,
          cssClass,
          inputs: [emailInputOpts],
          buttons: [
            {
              text: 'cancel',
              role: 'cancel',
              handler: onCancel
            },
            {
              text: 'next',
              handler: (data: any) => {
                
                const initialEmail = data[USER_EMAIL];
                
                if (!isUserInputValid(promtEmail)) {
                  return false;
                }
  
                this.afAuth.auth
                    .fetchSignInMethodsForEmail(initialEmail)
                    .then((arr: Array<string>) => {
                      
                      if (~arr.indexOf('google.com')) {
                        return this.alertCtrl.create({
                          title: 'Sign in',
                          subTitle: 'You already have an account',
                          message: `You’ve already used <strong>${initialEmail}</strong>. Sign in with Google to continue.`,
                          enableBackdropDismiss: false,
                          buttons: [{ text: 'sign in with google', handler: () => { this.signIn(Providers.GOOGLE).then(resolve); } }]
                        }).present();
                      }else if (~arr.indexOf('password')) {
  
                        const signInPwdFlowFn = (errMsg?: string, cssClass?: string) => {
  
                          const signInPromt = this.alertCtrl.create({
                            title: 'Sign in',
                            enableBackdropDismiss: false,
                            message: errMsg,
                            cssClass,
                            inputs: [
                              Object.assign(emailInputOpts, { value: initialEmail }),
                              {
                                type: 'password',
                                placeholder: 'Password',
                                name: USER_PWD,
                                id: PWD_ID
                              }
                            ],
                            buttons: [{
                              text: 'sign in',
                              handler: (data: any) => { 
    
                                if (!isUserInputValid(signInPromt, initialEmail, data[USER_EMAIL])) {
                                  return false;
                                }
                                
                                this.afAuth.auth.signInWithEmailAndPassword(data[USER_EMAIL], data[USER_PWD]) 
                                                .then(resolve)
                                                .catch((err: AuthError) => 
                                                  signInPwdFlowFn(err.message, ERROR_CLASS_NAME)
                                                );
                              }
                            }]
                          });
                          return signInPromt.present().then(() => {
                            const { email, pwd, alert } = getElementsHelper(signInPromt);
                            email.disabled = true;
                            email.required = true;
                            
                            pwd.minLength = 6;
                            pwd.required = true;
                            pwd.onblur = blurHandler(alert);
                            pwd.onfocus = focusHandler();
  
                            const btnGroupElement = document.querySelector('.alert-button-group');
                            const forgotPwdContainerElem = document.createElement('div');
                            forgotPwdContainerElem.style.padding = '0 30px';
                            btnGroupElement.parentNode.insertBefore(forgotPwdContainerElem, btnGroupElement);
                            forgotPwdContainerElem.innerHTML = `<a id="forgot-pwd" href="javascript:void(0)">Trouble signing in?</a>`;
                            document.getElementById('forgot-pwd').onclick = () => {
                              
                              signInPromt.dismiss().then(() => {
                                
                                const resetPwdFlowFn = (errMsg?: string, cssClass?: string) => {
  
                                  const resetPwdPromt = this.alertCtrl.create({
                                    title: 'Recover password',
                                    subTitle: 'Get instructions sent to this email that explain how to reset your password',
                                    enableBackdropDismiss: false,
                                    message: errMsg,
                                    cssClass,
                                    inputs: [
                                      Object.assign(emailInputOpts, { value: initialEmail })
                                    ],
                                    buttons: [
                                      {
                                        text: 'cancel',
                                        role: 'cancel',
                                        handler: onCancel
                                      },
                                      {
                                        text: 'send',
                                        handler: (data: any) => {
                                          const { alert, email } = getElementsHelper(resetPwdPromt);
                                          if (!email.checkValidity()) {
                                            return uiErrorFlowHelper(alert, email);
                                          }
                                          this.afAuth.auth.sendPasswordResetEmail(data[USER_EMAIL])
                                                          .then(() => 
                                                            this.alertCtrl.create({
                                                              title: 'Check your email',
                                                              message: `Follow the instructions sent to <strong>${data[USER_EMAIL]}</strong> to recover your password`,
                                                              buttons: [{
                                                                text: 'done',
                                                                handler: onCancel
                                                              }]
                                                            }).present()
                                                          )
                                                          .catch((err: AuthError) => 
                                                            resetPwdFlowFn(err.message, ERROR_CLASS_NAME)
                                                          );
                                        }
                                      }
                                    ]
                                  });
                                  resetPwdPromt.present().then(() => {
                                    const { alert, email } = getElementsHelper(resetPwdPromt);
                                    email.minLength = 5;
                                    email.maxLength = 100;
                                    email.required = true;
                                    email.onblur = blurHandler(alert);
                                    email.onfocus = focusHandler();
                                  });
  
                                };
                                
                                resetPwdFlowFn();
                              });
                              
                            };
                          });
  
                        };
  
                        signInPwdFlowFn();
  
                      }else {
                        // new user
                        const createNewUserFlowFn = (errMsg?: string, cssClass?: string) => {
                          
                          const promtNewUser =  this.alertCtrl.create({
                            title: 'Create account',
                            enableBackdropDismiss: false,
                            message: errMsg,
                            cssClass,
                            inputs: [
                              Object.assign(emailInputOpts, { value: initialEmail }),
                              {
                                type: 'text',
                                placeholder: 'First & last name',
                                name: USER_NAME,
                                id: NAME_ID
                              },
                              {
                                type: 'password',
                                placeholder: 'Password',
                                name: USER_PWD,
                                id: PWD_ID
                              }
                            ],
                            buttons: [
                              {
                                text: 'cancel',
                                role: 'cancel',
                                handler: onCancel
                              },
                              {
                                text: 'save',
                                handler: (data: any) => {
        
                                  if (!isUserInputValid(promtNewUser, initialEmail, data[USER_EMAIL])) {
                                    return false;
                                  }
                                  
                                  this.afAuth.auth.createUserWithEmailAndPassword(data[USER_EMAIL], data[USER_PWD])
                                                    .then((user: User) => {
                                                      this.isNewUser = true;
                                                      this.pwdAuthUserData = { userName: data[USER_NAME] };
                                                      this._setPwdAuthUserDataOnCreate(user, this.pwdAuthUserData);
                                                      resolve(user);
                                                    })
                                                    .catch((err: AuthError) => 
                                                      createNewUserFlowFn(err.message, ERROR_CLASS_NAME)
                                                    );
                                  
        
                                }
                              }
                            ]
                          });
                          return promtNewUser.present().then(() => {
                            const { email, name, pwd, alert } = getElementsHelper(promtNewUser);
                            
                            email.disabled = true;
                            email.required = true;
                            email.minLength = 5;
                            email.maxLength = 100;
        
                            name.minLength = 3;
                            name.maxLength = 20;
                            name.required = true;
                            name.onblur = blurHandler(alert);
                            name.onfocus = focusHandler();
        
                            pwd.minLength = 6;
                            pwd.required = true;
                            pwd.onblur = blurHandler(alert);
                            pwd.onfocus = focusHandler();
                          });
  
                        };
                        createNewUserFlowFn();
                      }
                    })
                    .catch((err: AuthError) => 
                      mainEmailAuthFlowFn(err.message, ERROR_CLASS_NAME)
                    );
  
              }
            }
          ]
        });
        promtEmail.present().then(() => {
          const { email, alert } = getElementsHelper(promtEmail);
          email.minLength = 5;
          email.maxLength = 100;
          email.required = true;
          email.onblur = blurHandler(alert);
          email.onfocus = focusHandler();
        });

      });

    };
    return mainEmailAuthFlowFn().then((user: User) => { 
      onSuccess(user);
      return user;
    });
  }
  setPwdAuthUserData(user: User) {
    if (user) {
      const { displayName, uid } = user;

      if (!this.pwdAuthUserData && !this.isNewUser && !displayName) {

        return this.afDb.object<IPwdAuthUserData | void>(`users/${uid}`)
                    .valueChanges()
                    .subscribe((pwdUserData: IPwdAuthUserData | void) => {
                        if (pwdUserData) {
                          this.pwdAuthUserData = pwdUserData;
                        }
                    });
      }
    }
  }
  private _setPwdAuthUserDataOnCreate({ uid }: User, userData: IPwdAuthUserData) {
    
    return this.retryStrategy(() => this.afDb.object<IPwdAuthUserData>(`users/${uid}`).set(userData), { maxRetryAttempts: Infinity });
  }

  retryStrategy(action: () => Promise<any>, { maxRetryAttempts= 5, scalingDuration= 1000 }: IRetryArgs = {}) {
    
    const executor: (attemptCount: number) => Promise<any> = (attemptCount: number) => {
      
      if (attemptCount > maxRetryAttempts) {
        return action();
      }
      
      return action().catch(() => asap.schedule(executor, attemptCount * scalingDuration, attemptCount + 1));
    };
    
    return action().catch(() => executor(1));
  }
}

interface IRetryArgs {
  readonly maxRetryAttempts?: number;
  readonly scalingDuration?: number;
}

interface IUIFields {
  readonly alert: HTMLElement;
  readonly email: HTMLInputElement;
  readonly name: HTMLInputElement;
  readonly pwd: HTMLInputElement;
}
export interface IPWDSignInFlowHandlers {
  onCancel(data: any): void;
  onSuccess(data: User): void;
}