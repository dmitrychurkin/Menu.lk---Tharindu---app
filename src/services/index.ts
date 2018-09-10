export * from './orders-notificator.service'
export * from  './root-data-receiver.service'
export * from  './shopping-cart.service'
export * from './network.service'
export * from './auth.service'
export * from './toast-messanger.service'
export * from './alert-validator.service'
export * from './orders-manager.service'
export * from './custom-error-handler.service'
export * from './messaging-registry.service'
export * from './availability.service'

export function playSound(soundPath?: string) {

  if (!soundPath) return;

  const SoundFilePath = `assets/sounds/${soundPath}`;
  
  return new Audio(SoundFilePath).play().catch(_ => {});

}
