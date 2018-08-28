export * from './orders-notificator.service'
export * from  './root-data-receiver.service'
export * from  './shopping-cart.service'
export * from './network.service'
export * from './auth.service'
export * from './toast-messanger.service'
export * from './alert-validator.service'
export * from './orders-manager.service'

export function playSound(soundPath?: string) {
  
  if (!soundPath) return;

  const SoundFilePath = `assets/sounds/${soundPath}`;

  return new Audio(SoundFilePath).play().catch(_ => {});

}

//export const orderNormalizer = (id: string) => (+id.split('_')[0]).toString(36).slice(-8);