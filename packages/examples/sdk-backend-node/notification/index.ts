import { runNotificaitonsLowLevelUseCases } from './notification.lowlevel';
import { runNotificationClassUseCases } from './notification';

export const runNotificationUseCases = async (): Promise<void> => {
  console.log(`
███╗░░██╗░█████╗░████████╗██╗███████╗██╗░█████╗░░█████╗░████████╗██╗░█████╗░███╗░░██╗
████╗░██║██╔══██╗╚══██╔══╝██║██╔════╝██║██╔══██╗██╔══██╗╚══██╔══╝██║██╔══██╗████╗░██║
██╔██╗██║██║░░██║░░░██║░░░██║█████╗░░██║██║░░╚═╝███████║░░░██║░░░██║██║░░██║██╔██╗██║
██║╚████║██║░░██║░░░██║░░░██║██╔══╝░░██║██║░░██╗██╔══██║░░░██║░░░██║██║░░██║██║╚████║
██║░╚███║╚█████╔╝░░░██║░░░██║██║░░░░░██║╚█████╔╝██║░░██║░░░██║░░░██║╚█████╔╝██║░╚███║
╚═╝░░╚══╝░╚════╝░░░░╚═╝░░░╚═╝╚═╝░░░░░╚═╝░╚════╝░╚═╝░░╚═╝░░░╚═╝░░░╚═╝░╚════╝░╚═╝░░╚══╝
      `);
  await runNotificationClassUseCases();
  console.log(`
▒█▄░▒█ ▒█▀▀▀█ ▀▀█▀▀ ▀█▀ ▒█▀▀▀ ▀█▀ ▒█▀▀█ ░█▀▀█ ▀▀█▀▀ ▀█▀ ▒█▀▀▀█ ▒█▄░▒█ ░ ▒█░░░ ▒█▀▀▀█ ▒█░░▒█ ▒█░░░ ▒█▀▀▀ ▒█░░▒█ ▒█▀▀▀ ▒█░░░ 
▒█▒█▒█ ▒█░░▒█ ░▒█░░ ▒█░ ▒█▀▀▀ ▒█░ ▒█░░░ ▒█▄▄█ ░▒█░░ ▒█░ ▒█░░▒█ ▒█▒█▒█ ▄ ▒█░░░ ▒█░░▒█ ▒█▒█▒█ ▒█░░░ ▒█▀▀▀ ░▒█▒█░ ▒█▀▀▀ ▒█░░░ 
▒█░░▀█ ▒█▄▄▄█ ░▒█░░ ▄█▄ ▒█░░░ ▄█▄ ▒█▄▄█ ▒█░▒█ ░▒█░░ ▄█▄ ▒█▄▄▄█ ▒█░░▀█ █ ▒█▄▄█ ▒█▄▄▄█ ▒█▄▀▄█ ▒█▄▄█ ▒█▄▄▄ ░░▀▄▀░ ▒█▄▄▄ ▒█▄▄█
  `);
  await runNotificaitonsLowLevelUseCases();
};
