import React, { useContext} from 'react';
import { IChatTheme, IChatViewComponentProps } from '../exportedTypes';

import { Section,  } from '../../reusables';
import { ChatViewList } from '../ChatViewList';
import { chatLimit } from '../../../config';

import { ThemeContext } from '../theme/ThemeProvider';
import { useChatData } from '../../../hooks/chat/useChatData';
import { MessageInput } from '../MessageInput';
import { ChatProfile } from '../ChatProfile';
import styled from 'styled-components';




/**
 * @interface IThemeProps
 * this interface is used for defining the props for styled components
 */
interface IThemeProps {
  theme?: IChatTheme;
}


export const ChatViewComponent: React.FC<IChatViewComponentProps> = (
  options: IChatViewComponentProps
) => {
  const {
    chatId,
    chatFilterList = [],
    messageInput = true,
    chatViewList = true,
    chatProfile = true,
    limit = chatLimit,
    emoji = true,
    file = true,
    gif = true,
    isConnected = true,
  } = options || {};

  const {env } = useChatData();

  console.log(env);
  
  // const [conversationHash, setConversationHash] = useState<string>();

  const theme = useContext(ThemeContext);

 



 




  return (
    <Conatiner
      width="100%"
      height="inherit"
      flexDirection="column"
      justifyContent="space-between"
      overflow="hidden"
      background={theme.backgroundColor?.chatViewComponentBackground}
      borderRadius={theme.borderRadius?.chatViewComponent}
      padding="13px"
      theme={theme}
    >
     
    {chatProfile && <ChatProfile chatId={chatId} style="Info" />}
      <Section
        flex="1 1 auto"
        overflow="hidden"
        padding="0 20px"
        margin="0 0px 10px 0px"
        flexDirection="column"
        justifyContent="start"
      >
      

        {chatId && chatViewList && <ChatViewList chatFilterList={chatFilterList} limit={limit} chatId={chatId} />}
      
      </Section>

      {/* )} */}

      {messageInput && (
        <Section flex="0 1 auto">
          <MessageInput chatId={chatId} File={file} Emoji={emoji} GIF={gif} isConnected={isConnected} />
        </Section>
      )}
    </Conatiner>
  );
};

//styles
const Conatiner = styled(Section)<IThemeProps>`
border:${(props) => props.theme.border?.chatViewComponent};
backdrop-filter:${(props) => props.theme.backdropFilter};

`;
