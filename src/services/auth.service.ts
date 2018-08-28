import { Inject, Injectable } from "@angular/core";
import { Error as AuthError, User, UserCredential } from "@firebase/auth-types";
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFirestore } from "angularfire2/firestore";
import { auth } from 'firebase/app';
import { AlertController } from "ionic-angular";
import { from, Observable, of } from "rxjs";
import { filter, pluck, shareReplay, switchMap, tap } from "rxjs/operators";
import { asap } from "rxjs/Scheduler/asap";
import { FormUserTemplateData, IAuthUserPayload, IProfileUserData } from "../interfaces";
import { FORM_USER_TEMPLATE_DATA_TOKEN, ERROR_CLASS_NAME, FIREBASE_DB_TOKENS } from "../pages/pages.constants";
import { AlertUIValidatorService } from "./alert-validator.service";
import { ShoppingCartService } from "./shopping-cart.service";

export enum Providers { GOOGLE, PWD, ANONYMUS };

const { USERS } = FIREBASE_DB_TOKENS;

@Injectable()
export class AuthService {

  user$ = this.afAuth.user
    .pipe(
      tap(_ => {

        delete this.isNewUser;
        this._userProfileDataSetter();
        this._shoppingCartService.removeFromCart(null, true, 'clear');

      }),
      switchMap((user: User | null) => this._userProfileDataController(user)),
      shareReplay(1)
    );
  isNewUser: boolean;
  private _newUserData: IProfileUserData;

  readonly alertUIValidatorService: AlertUIValidatorService = new AlertUIValidatorService;

  constructor(
    readonly afAuth: AngularFireAuth,
    readonly angularFirestore: AngularFirestore,
    readonly alertCtrl: AlertController,
    private readonly _shoppingCartService: ShoppingCartService,
    @Inject(FORM_USER_TEMPLATE_DATA_TOKEN) private _formTemplateData: FormUserTemplateData) {

      this._setupUserProfileData();

    }

  get userInstance() {
    return this.afAuth.auth.currentUser;
  }

  signIn(flag: Providers, handlers?: IPWDSignInFlowHandlers): Promise<UserCredential | void> {

    switch (flag) {
      case Providers.GOOGLE: {
        return this.afAuth
          .auth
          .signInWithRedirect(new auth.GoogleAuthProvider);
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

  private _signInPwdFlow({ onCancel = function () { }, onSuccess = onCancel }: IPWDSignInFlowHandlers) {

    const USER_EMAIL = 'user_email';
    const EMAIL_ID = 'email_textfield';

    const USER_NAME = 'user_name';
    const NAME_ID = 'name_textfield';

    const USER_PWD = 'user_password';
    const PWD_ID = 'password_textfield';

    const ErrorMessage = (initialEmail: string) => `Email must to be ${initialEmail}`;

    const emailInputOpts = {
      type: 'email',
      name: USER_EMAIL,
      placeholder: 'Email',
      id: EMAIL_ID
    };

    const mainEmailAuthFlowFn = (errMsg?: string, cssClass?: string) => {

      return new Promise((resolve: (value: UserCredential) => void) => {

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

                if (this.alertUIValidatorService.isUserInputInvalid()) {
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
                    } else if (~arr.indexOf('password')) {

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

                              if (this.alertUIValidatorService.isUserInputInvalid(initialEmail, data[USER_EMAIL], ErrorMessage)) {
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
                          
                          this.alertUIValidatorService.setInputsConfig(signInPromt, 
                            { id: EMAIL_ID, validators: { disabled: true, required: true, equality$: 'noteq' } }, 
                            { id: PWD_ID, validators: { minLength: 6, required: true, autofocus: true } });

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
                                        
                                        if (this.alertUIValidatorService.isUserInputInvalid()) {
                                          return false;
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
                                resetPwdPromt.present().then(() => 
                                  this.alertUIValidatorService.setInputsConfig(resetPwdPromt, { id: EMAIL_ID, validators: { minLength: 5, maxLength: 100, required: true, autofocus: true } })
                                );

                              };

                              resetPwdFlowFn();
                            });

                          };
                        });

                      };

                      signInPwdFlowFn();

                    } else {
                      // new user
                      const createNewUserFlowFn = (errMsg?: string, cssClass?: string) => {

                        const promtNewUser = this.alertCtrl.create({
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

                                if (this.alertUIValidatorService.isUserInputInvalid(initialEmail, data[USER_EMAIL], ErrorMessage)/*isUserInputValid(promtNewUser, initialEmail, data[USER_EMAIL])*/) {
                                  return false;
                                }

                                this.afAuth.auth.createUserWithEmailAndPassword(data[USER_EMAIL], data[USER_PWD])
                                  .then((userCredential: UserCredential) => {

                                    this._newUserData = { userName: data[USER_NAME] };

                                    resolve(userCredential);
                                  })
                                  .catch((err: AuthError) =>
                                    createNewUserFlowFn(err.message, ERROR_CLASS_NAME)
                                  );


                              }
                            }
                          ]
                        });
                        return promtNewUser.present().then(() => 
                          
                          this.alertUIValidatorService.setInputsConfig(promtNewUser, 
                            { id: EMAIL_ID, validators: { disabled: true, required: true, minLength: 5, maxLength: 100, equality$: 'noteq' } },
                            { id: NAME_ID,  validators: { required: true, minLength: 3, maxLength: 20, autofocus: true } },
                            { id: PWD_ID,   validators: { required: true, minLength: 6 } })

                        );

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
        promtEmail.present().then(() => 
          this.alertUIValidatorService.setInputsConfig(promtEmail, { id: EMAIL_ID, validators: { minLength: 5, maxLength: 100, required: true } })
        );

      });

    };
    return mainEmailAuthFlowFn().then((userCredential: UserCredential) => {
      onSuccess(userCredential);
      return userCredential;
    });
  }

  private _userProfileDataController(user: User | null): Observable<IAuthUserPayload | [ boolean, void ]> {

    if (!user) {

      return of({ userData: null });

    }

    const { uid, displayName, email, phoneNumber, isAnonymous, photoURL } = user;

    return this.angularFirestore
      .doc<IProfileUserData | undefined>(`${USERS}/${uid}`)
      .valueChanges()
      .pipe(
        switchMap((profileUserData: IProfileUserData | undefined) => {

          if (!profileUserData) {

            this.isNewUser = true;

            if (!isAnonymous) {

              const userProfileData: IProfileUserData = Object.assign({
                userName: displayName,
                userPhone: phoneNumber,
                userEmail: email
              }, typeof this._newUserData === 'object' ? this._newUserData : {});

              const promiseDb = this.angularFirestore
                .collection<IProfileUserData>(USERS)
                .doc(uid)
                .set(userProfileData)
                .then(() => delete this._newUserData);

              let promiseFireProfile = !displayName ? user.updateProfile({ displayName: userProfileData.userName, photoURL }) : Promise.resolve();

              return from(Promise.all([ promiseDb, promiseFireProfile ]));
              
            }

            return of({ userData: user });

          }

          return of({ userData: user, userProfileData: profileUserData });
        })
      );

  }

  updateUserProfile(displayName?: string, photoURL= null) {
    
    if (displayName) {

      return this.userInstance.updateProfile({ displayName, photoURL });

    }
    

  }

  updateUserEmail(newEmail: string, currentPassword: string) {

    return this._reauthenticate(currentPassword)
                .then(({ user }: UserCredential) => user.updateEmail(newEmail));

  }

  updateUserPassword(currentPassword: string, newPassword: string) {

    return this._reauthenticate(currentPassword)
                .then(({ user }: UserCredential) => user.updatePassword(newPassword));

  }

  private _reauthenticate(currentPassword: string) {

    const user = this.userInstance;

    return user.reauthenticateAndRetrieveDataWithCredential(
      auth.EmailAuthProvider.credential(user.email, currentPassword)
    );

  }

  private _setupUserProfileData() {

    return this.user$.pipe(
      pluck('userProfileData'),
      filter((userProfileData: IProfileUserData | undefined) => !!userProfileData)
    ).subscribe((userProfileData: IProfileUserData) => this._userProfileDataSetter(userProfileData));

  }

  private _userProfileDataSetter(userProfileData?: IProfileUserData) {

    this._formTemplateData.forEach(formTemplateItem => {

      const propName = formTemplateItem.mappedDbName;
      if ('model' in formTemplateItem && propName) {

        formTemplateItem.model = typeof userProfileData === 'undefined' ? userProfileData : userProfileData[propName];

      }

    });

  }

  retryStrategy(action: () => Promise<any>, { maxRetryAttempts = 5, scalingDuration = 1000 }: IRetryArgs = {}) {

    const executor: (attemptCount: number) => Promise<any> = (attemptCount: number) => {

      if (attemptCount > maxRetryAttempts) {
        return action();
      }

      return action().catch(() => asap.schedule(executor, attemptCount * scalingDuration, attemptCount + 1));
    };

    return executor(1);
  }
}

interface IRetryArgs {
  readonly maxRetryAttempts?: number;
  readonly scalingDuration?: number;
}

export interface IPWDSignInFlowHandlers {
  onCancel(data: any): void;
  onSuccess(data: UserCredential): void;
}