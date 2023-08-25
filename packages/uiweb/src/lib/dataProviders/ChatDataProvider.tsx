import { useState, ReactNode, useEffect } from 'react';
import { Constants, ENV } from '../config';
import {
  ChatDataContext,
  IChatDataContextValues,
} from '../context/chatContext';
import { ThemeContext } from '../components/chat/theme/ThemeProvider';
import useGetChatProfile from '../hooks/useGetChatProfile';
import { IUser, SignerType } from '@pushprotocol/restapi';
import { IChatTheme, lightChatTheme } from '../components/chat/theme';
import { getAddressFromSigner } from '../helpers';


export interface IChatUIProviderProps {
  children: ReactNode;
  theme?: IChatTheme;
  account?: string | null;
  signer?: SignerType | undefined;
  pgpPrivateKey?: string | null;
  env?: ENV;
}

export const ChatUIProvider = ({
  children,
  account = null,
  theme,
  pgpPrivateKey = null,
  signer = undefined,
  env = Constants.ENV.PROD,
}: IChatUIProviderProps) => {
  const [accountVal, setAccountVal] = useState<string | null>(account);
  const [pushChatSocket, setPushChatSocket] = useState<any>(null); 
   const [signerVal, setSignerVal] = useState<SignerType| undefined>(signer);

  const [pgpPrivateKeyVal, setPgpPrivateKeyVal] =
    useState<string | null>(pgpPrivateKey);
  const [envVal, setEnvVal] = useState<ENV>(env);
  const {fetchChatProfile} = useGetChatProfile();
  const [connectedProfile,setConnectedProfile]=useState<IUser | undefined>(undefined);

  const [isPushChatSocketConnected, setIsPushChatSocketConnected] =
  useState<boolean>(false);

  useEffect(() => {
    (async()=>{
      resetStates();
      setEnvVal(env);
    
      if (signer) {
        if (!account) {
          const address = await getAddressFromSigner(signer);
          setAccountVal(address);
        }
        else{
          setAccountVal(account);
        }
      } 
      setSignerVal(signer);
      setPgpPrivateKeyVal(pgpPrivateKey);
    })()
    
  }, [env,account,pgpPrivateKey,signer])





const resetStates = () => {
  setPushChatSocket(null);
  setIsPushChatSocketConnected(false);
  
};

useEffect(() => {
    (async () => {
      let user;
      console.log(account)
      if (account) {
        user = await fetchChatProfile({ profileId: account,env });
console.log(user)
        if (user) setConnectedProfile(user);
      }
    })();
  }, [account,env,pgpPrivateKey]);

  const value: IChatDataContextValues = {
    account: accountVal,
    signer:signerVal,
    setSigner:setSignerVal,
    setAccount: setAccountVal,
    pgpPrivateKey: pgpPrivateKeyVal,
    setPgpPrivateKey: setPgpPrivateKeyVal,
    env: envVal,
    setEnv: setEnvVal,
    pushChatSocket,
    setPushChatSocket,
    isPushChatSocketConnected,
    setIsPushChatSocketConnected,
    connectedProfile,
    setConnectedProfile
  };


  const PROVIDER_THEME = Object.assign({}, lightChatTheme, theme);
  return (
    <ThemeContext.Provider value={PROVIDER_THEME}>
      <ChatDataContext.Provider value={value}>
        {children}
      </ChatDataContext.Provider>
    </ThemeContext.Provider>
  );
};
