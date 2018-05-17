import { Injectable } from "@angular/core";
import { User } from "@firebase/auth-types";
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import * as firebase from 'firebase/app';
import { Alert, AlertController } from "ionic-angular";

export enum Providers { GOOGLE, PWD, ANONYMUS };

@Injectable()
export class AuthProvider {

  user$ = this.afAuth.authState;
  isNewUser: boolean;
  // private _renderer2: Renderer2;

  constructor(
    public afAuth: AngularFireAuth,
    public afDb: AngularFireDatabase,
    public alertCtrl: AlertController) { }

  get userInstance() {
    return this.afAuth.auth.currentUser;
  }

  // configure(renderer2: Renderer2) {
  //   this._renderer2 = renderer2;
  // }

  signIn(flag: number, handlers?: IPWDSignInFlowHandlers) {

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
      .signOut();
  }

  private _signInPwdFlow({ onCancel, onNextOrSuccess }: IPWDSignInFlowHandlers) {
    
    const userEmail = 'user_email';
    const emailId = 'email_textfield';

    const userName = 'user_name';
    const nameId = 'name_textfield';

    const userPwd = 'user_password';
    const pwdId = 'password_textfield';

    const styleError = '1px solid #f53d3d';
    const styleGood = '1px solid #32db64';

    const getElementsHelper = (alertInstance: Alert) => {
      return {
        alert: alertInstance.instance._elementRef.nativeElement,
        email: document.getElementById(emailId) as HTMLInputElement,
        name: document.getElementById(nameId) as HTMLInputElement,
        pwd: document.getElementById(pwdId) as HTMLInputElement
      };
    }
    const uiErrorFlowHelper = (alertElement: HTMLElement, inputElement: HTMLInputElement, errorMessage?: string) => {
      alertElement.classList.add('error');
      const errorContainerElem = document.createElement('span');
      inputElement.parentElement.appendChild(errorContainerElem);
      errorContainerElem.classList.add('error-message');
      inputElement.style.borderBottom = styleError;
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
        target.style.borderBottom = styleGood;
      }
    };

    const focusHandler = () => () => clearPreviousErrors();
      
    const emailInputOpts = {
      type: 'email',
      name: userEmail,
      placeholder: 'Email',
      id: emailId
    };


    const promtEmail = this.alertCtrl.create({
      title: 'Sign in with email',
      enableBackdropDismiss: true,
      cssClass: '',
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
            // const ionAlert = promtEmail.instance._elementRef.nativeElement;
            // const inputElem = document.getElementById(emailId) as HTMLInputElement;
            const { email, alert } = getElementsHelper(promtEmail);
            const initialEmail = data[userEmail];
            
            if (email.checkValidity()) {
              //ionAlert.classList.remove('error');
              this.afAuth.auth
                .fetchSignInMethodsForEmail(initialEmail)
                .then((arr: Array<string>) => {
                  console.log(arr);
                  if (~arr.indexOf('google.com')) {
                    return this.alertCtrl.create({
                      title: 'Sign in',
                      subTitle: 'You already have an account',
                      message: `You’ve already used <strong>${initialEmail}</strong>. Sign in with Google to continue.`,
                      enableBackdropDismiss: false,
                      buttons: [{ text: 'sign in with google', handler: () => { this.signIn(Providers.GOOGLE); } }]
                    }).present();
                  }else if (~arr.indexOf('password')) {
                    const signInPromt = this.alertCtrl.create({
                      title: 'Sign in',
                      inputs: [
                        Object.assign(emailInputOpts, { value: initialEmail }),
                        {
                          type: 'password',
                          placeholder: 'Password',
                          name: userPwd,
                          id: pwdId
                        }
                      ],
                      buttons: [{
                        text: 'sign in',
                        handler: (data: any) => { 
                          this.afAuth.auth.signInWithEmailAndPassword(data[userEmail], data[userPwd]) 
                                          .then(({ uid }: User) => 
                                            this.afDb.object(`users/${uid}`).valueChanges().subscribe((data: any) => console.log('this.afDb.object(`users/${uid}`).valueChanges() => ', data))
                                          )
                                          .catch((err) => console.log(err));
                        }
                      }]
                    });
                    return signInPromt.present().then(() => {
                      const { email, name, pwd, alert } = getElementsHelper(signInPromt);
                      email.disabled = true;
                      email.required = true;

                      const btnGroupElement = document.querySelector('.alert-button-group');
                      const forgotPwdContainerElem = document.createElement('div');
                      forgotPwdContainerElem.style.padding = '0 30px';
                      btnGroupElement.parentNode.insertBefore(forgotPwdContainerElem, btnGroupElement);
                      forgotPwdContainerElem.innerHTML = `<a id="forgot-pwd" href="javascript:void(0)">Trouble signing in?</a>`;
                      document.getElementById('forgot-pwd').onclick = () => {
                        
                        signInPromt.dismiss().then(() => {

                          const resetPwdPromt = this.alertCtrl.create({
                            title: 'Recover password',
                            subTitle: 'Get instructions sent to this email that explain how to reset your password',
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
                                  this.afAuth.auth.sendPasswordResetEmail(data[userEmail])
                                                  .then(() => 
                                                    this.alertCtrl.create({
                                                      title: 'Check your email',
                                                      message: `Follow the instructions sent to <strong>${data[userEmail]}</strong> to recover your password`,
                                                      buttons: [{
                                                        text: 'done',
                                                        handler: onCancel
                                                      }]
                                                    }).present()
                                                  )
                                                  .catch((err) => console.log(err));
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

                        });
                        
                      };
                    });
                  }else {
                    // new user
                    const promtNewUser =  this.alertCtrl.create({
                      title: 'Create account',
                      inputs: [
                        Object.assign(emailInputOpts, { value: initialEmail }),
                        {
                          type: 'text',
                          placeholder: 'First & last name',
                          name: userName,
                          id: nameId
                        },
                        {
                          type: 'password',
                          placeholder: 'Password',
                          name: userPwd,
                          id: pwdId
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
  
                            const { alert, email, name, pwd } = getElementsHelper(promtNewUser);
  
                            // let errorMessage = '', newLine = '<br><br>'; 
                            let hasError = false;
                            // email.style.borderBottom = name.style.borderBottom = pwd.style.borderBottom = '';
                            clearPreviousErrors();

                            if (initialEmail !== data[userEmail]) {
                              //errorMessage += `Email must to be ${initialEmail}` + newLine;
                              //email.style.borderBottom = styleSet;
                              hasError = !uiErrorFlowHelper(alert, email, `Email must to be ${initialEmail}`);
                            }
                            if (!name.checkValidity()) {
                              // errorMessage += name.validationMessage + newLine;
                              // name.style.borderBottom = styleSet;
                              hasError = !uiErrorFlowHelper(alert, name);
                            }
                            if (!pwd.checkValidity()) {
                              // errorMessage += `${pwd.validationMessage}`;
                              // pwd.style.borderBottom = styleSet;
                              hasError = !uiErrorFlowHelper(alert, pwd);
                            }
  
                            if (hasError) {
                              return !hasError;
                            }else {
                              this.afAuth.auth.createUserWithEmailAndPassword(data[userEmail], data[userPwd])
                                              .then(({ uid }: User) => {
                                                this.isNewUser = true;
                                                this.afDb.object(`users/${uid}`).set({ displayName: data[userName] });
                                              })
                                              .catch((e: any) => console.log('Error User created ', e));
                            }
  
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
                  }
                })
                .catch((err: any) => console.log(err));
            } else {
              return uiErrorFlowHelper(alert, email);
            }
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
  }
}


export interface IPWDSignInFlowHandlers {
  onCancel(data: any): void;
  onNextOrSuccess(data: any): void | boolean;
}