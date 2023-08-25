import {
  useChatData,
  useClickAway,
  useDeviceWidthCheck,
  usePushChatSocket,
} from '../../../hooks';
import type { FileMessageContent, IGroup } from '../../../types';
import type { ChatMainStateContextType } from '../../../context/chatAndNotification/chat/chatMainStateContext';
import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import { GIFType, IChatTheme, MessageInputProps } from '../exportedTypes';
import styled from 'styled-components';
import { PUBLIC_GOOGLE_TOKEN, device } from '../../../config';
import { Section, Div, Span } from '../../reusables';
import { EmojiIcon } from '../../../icons/Emoji';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import * as PUSHAPI from '@pushprotocol/restapi';
import { GifIcon } from '../../../icons/Gif';
import GifPicker from 'gif-picker-react';
import { AttachmentIcon } from '../../../icons/Attachment';
import usePushSendMessage from '../../../hooks/chat/usePushSendMessage';
import { SendCompIcon } from '../../../icons/SendCompIcon';
import { Spinner } from '../../reusables';
import { ThemeContext } from '../theme/ThemeProvider';
import OpenLink from '../../../icons/OpenLink';
import useVerifyAccessControl from '../../../hooks/chat/useVerifyAccessControl';
import TokenGatedIcon from '../../../icons/Token-Gated.svg';
import { Modal } from '../helpers/Modal';
import { Image } from '../../reusables';
import { ConnectButtonComp } from '../ConnectButton';
import useGetGroupByID from '../../../hooks/chat/useGetGroupByID';
import { ethers } from 'ethers';
import {
  checkIfIntent,
  checkIfSameChat,
  getDefaultFeedObject,
  getNewChatUser,
  pCAIP10ToWallet,
  setAccessControl,
  walletToPCAIP10,
} from '../../../helpers';
import useFetchChat from '../../../hooks/chat/useFetchChat';
import useGetChatProfile from '../../../hooks/useGetChatProfile';
import { IFeeds } from '@pushprotocol/restapi';
import useGetGroup from '../../../hooks/chat/useGetGroup';
import useApproveChatRequest from '../../../hooks/chat/useApproveChatRequest';

/**
 * @interface IThemeProps
 * this interface is used for defining the props for styled components
 */
interface IThemeProps {
  theme?: IChatTheme;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  chatId,
  Emoji = true,
  GIF = true,
  File = true,
  isConnected,
  onClick,
}) => {
  const [typedMessage, setTypedMessage] = useState<string>('');
  const [showEmojis, setShowEmojis] = useState<boolean>(false);
  const [gifOpen, setGifOpen] = useState<boolean>(false);
  const [newChat, setNewChat] = useState<boolean>(false);
  const modalRef = useRef(null);
  const fileUploadInputRef = useRef<HTMLInputElement>(null);
  const [fileUploading, setFileUploading] = useState<boolean>(false);
  const [isRules, setIsRules] = useState<boolean>(false);
  const [isMember, setIsMember] = useState<boolean>(false);
  const { approveChatRequest, loading: approveLoading } =
    useApproveChatRequest();
  // const [groupInformation, setGroupInformation] = useState<IGroup | undefined>(undefined);
  const onChangeTypedMessage = (val: string) => {
    setTypedMessage(val);
  };
  const { acceptedRequestMessage, groupInformationSinceLastConnection } =
    usePushChatSocket();
  const [chatFeed, setChatFeed] = useState<IFeeds>({} as IFeeds);
  const theme = useContext(ThemeContext);
  const isMobile = useDeviceWidthCheck(425);
  const { sendMessage, loading } = usePushSendMessage();
  const {
    verificationSuccessfull,
    verifyAccessControl,
    setVerificationSuccessfull,
    verified,
    setVerified,
    loading: accessLoading,
  } = useVerifyAccessControl();
  const { account, env ,connectedProfile,setConnectedProfile,pgpPrivateKey, signer,} = useChatData();
  const { fetchChat } = useFetchChat();
  const { fetchChatProfile } = useGetChatProfile();
  const { getGroupByID } = useGetGroupByID();
  const { getGroup } = useGetGroup();

  useClickAway(modalRef, () => {
    setShowEmojis(false);
    setGifOpen(false);
  });
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textAreaRef?.current?.style) {
      textAreaRef.current.style.height = 25 + 'px';
      const scrollHeight = textAreaRef.current?.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + 'px';
    }
  }, [textAreaRef, typedMessage]);

  const addEmoji = (emojiData: EmojiClickData, event: MouseEvent): void => {
    setTypedMessage(typedMessage + emojiData.emoji);
    setShowEmojis(false);
  };

  const handleUploadFile = () => {
    if (fileUploadInputRef.current) {
      fileUploadInputRef.current.click();
    }
  };

  const checkVerification = () => {
    verifyAccessControl({ chatId, did: account! });
  };

  const handleJoinGroup = async () => {
    if (chatFeed && chatFeed?.groupInformation?.isPublic) {
      const response = await approveChatRequest({
        chatId,
      });
      if(response)
        await updateChatFeed();
    } else {
      const sendTextMessage = await sendMessage({
        message: `Hello, please let me join this group, my wallet address is ${account}`,
        chatId: chatFeed?.groupInformation?.groupCreator || '',
        messageType: 'Text',
      });
    }
  };

  useEffect(() => {
    const storedTimestampJSON = localStorage.getItem(chatId);

    if (storedTimestampJSON) {
      const storedTimestamp = JSON.parse(storedTimestampJSON);
      const currentTimestamp = new Date().getTime();
      const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000;

      if (
        Math.abs(currentTimestamp - storedTimestamp) <
        twentyFourHoursInMilliseconds
      ) {
        setVerified(true);
      } else {
        setVerified(false);
        setAccessControl(chatId, true);
      }
    }
  }, [chatId, verified, isMember, account, env]);

  const uploadFile = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    if (!(e.target instanceof HTMLInputElement)) {
      return;
    }
    if (!e.target.files) {
      return;
    }
    if (
      e.target &&
      (e.target as HTMLInputElement).files &&
      ((e.target as HTMLInputElement).files as FileList).length
    ) {
      const file: File = e.target.files[0];
      if (file) {
        try {
          const TWO_MB = 1024 * 1024 * 2;
          if (file.size > TWO_MB) {
            console.log('Files larger than 2mb is now allowed');
            throw new Error('Files larger than 2mb is now allowed');
          }
          setFileUploading(true);
          const messageType = file.type.startsWith('image') ? 'Image' : 'File';
          const reader = new FileReader();
          let fileMessageContent: FileMessageContent;
          reader.readAsDataURL(file);
          reader.onloadend = async (e): Promise<void> => {
            fileMessageContent = {
              content: e.target!.result as string,
              name: file.name,
              type: file.type,
              size: file.size,
            };

            sendPushMessage(JSON.stringify(fileMessageContent), messageType);
          };
        } catch (err) {
          console.log(err);
        } finally {
          setFileUploading(false);
        }
      }
    }
  };

  const sendPushMessage = async (content: string, type: string) => {
    try {
      const sendMessageResponse = await sendMessage({
        message: content,
        chatId,
        messageType: type as any,
      });
      if (sendMessageResponse&&sendMessageResponse.includes('400')) {
        setAccessControl(chatId, true);
        setVerified(false);
        setVerificationSuccessfull(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      if (!connectedProfile && account) {
        const user = await fetchChatProfile({ profileId: account!, env });
        if (user) setConnectedProfile(user);
      }
    })();
  }, [account]);

  const sendTextMsg = async () => {
    if (typedMessage.trim() !== '') {
      await sendPushMessage(typedMessage as string, 'Text');
      setTypedMessage('');
    }
  };

  const sendGIF = async (emojiObject: GIFType) => {
    sendPushMessage(emojiObject.url as string, 'GIF');
    setGifOpen(false);
  };

  useEffect(() => {
    if (Object.keys(groupInformationSinceLastConnection || {}).length) {
      if (
        chatFeed?.groupInformation?.chatId.toLowerCase() ===
        groupInformationSinceLastConnection.chatId.toLowerCase()
      ) {
        const updateChatFeed = chatFeed;
        updateChatFeed.groupInformation = groupInformationSinceLastConnection;
        setChatFeed(updateChatFeed);
      }
    }
  }, [groupInformationSinceLastConnection]);

  const updateChatFeed = async() => {
    const chat = await fetchChat({ chatId });
    if (Object.keys(chat || {}).length) {
      setChatFeed(chat as IFeeds);
    }
  }
  
  useEffect(() => {
    (async () => {
      if (
        Object.keys(acceptedRequestMessage || {}).length &&
        Object.keys(chatFeed || {}).length
      ) {
       await updateChatFeed();
      }
    })();
  }, [acceptedRequestMessage]);

  useEffect(() => {
    (async () => {
      if (!account && !env) return;
      if(account && env){
        const chat = await fetchChat({ chatId });
        if (Object.keys(chat || {}).length) setChatFeed(chat as IFeeds);
        else {
          let newChatFeed;
          let group;
          const result = await getNewChatUser({
            searchText: chatId,
            fetchChatProfile,
            env,
          });
          if (result) {
            newChatFeed = getDefaultFeedObject({ user: result });
          } else {
            group = await getGroup({ searchText: chatId });
            if (group) {
              newChatFeed = getDefaultFeedObject({ groupInformation: group });
            }
          }
          if (newChatFeed) {
            setChatFeed(newChatFeed);
          }
        }
      }
       
      
    
    })();
  }, [chatId, pgpPrivateKey, account, env]);

  const checkIfrules = async () => {
    const members = chatFeed?.groupInformation?.members || [];
    const pendingMembers = chatFeed?.groupInformation?.pendingMembers || [];
    const allMembers = [...members, ...pendingMembers];
    allMembers.forEach((acc) => {
      if (
        acc.wallet.toLowerCase() === walletToPCAIP10(account!).toLowerCase()
      ) {
        setIsMember(true);
      }
    });

    if (chatFeed?.groupInformation?.rules) {
      setIsRules(true);
    }
  };
  useEffect(() => {
    if (!account && !env && !chatId) return;
    if (account && env && chatId && chatFeed && chatFeed?.groupInformation)
      checkIfrules();
  }, [chatId, chatFeed, account, env]);

  return (
   !Object.keys(chatFeed || {}).length? <>
   {!pgpPrivateKey && isConnected && (
     <TypebarSection
     // zIndex="1"
       width="100%"
     borderRadius="13px"
     position="static"
     padding={` ${pgpPrivateKey ? '13px 16px' : ''}`}
     background={`${theme.backgroundColor?.messageInputBackground}`}
     alignItems="center"
     justifyContent="space-between"
   >
        <Section
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          padding="8px"
        >
          {!signer && (
            <Span
              padding="8px 8px 8px 16px"
              color="#B6BCD6"
              fontSize="15px"
              fontWeight="400"
              textAlign="start"
            >
              You need to connect your wallet to get started
            </Span>
          )}
          <ConnectButtonComp />
        </Section>
        </TypebarSection>
      )}
   </> 
      : 
      !checkIfIntent({ chat: chatFeed, account: account! })  &&
      Object.keys(chatFeed || {}).length ? (
      <Container theme={theme}>
        {/* {isConnected && (
                  <ConnectButtonComp />
              )} */}
        <TypebarSection
          // zIndex="1"
          borderRadius="13px"
          position="static"
          padding={` ${pgpPrivateKey ? '13px 16px' : ''}`}
          background={`${theme.backgroundColor?.messageInputBackground}`}
          alignItems="center"
          justifyContent="space-between"
        >
       
          {Object.keys(chatFeed || {}).length && chatFeed?.groupInformation ? (
            <>
              {pgpPrivateKey && !isMember && (
                <Section
                  width="100%"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Span
                    padding="8px 8px 8px 16px"
                    color={theme.textColor?.chatReceivedBubbleText}
                    fontSize="15px"
                    fontWeight="500"
                    textAlign="start"
                  >
                    Click on the button to join the group
                  </Span>
                  <ConnectWrapper>
                    <Connect onClick={() => handleJoinGroup()}>
                      {approveLoading ? (
                        <Spinner color="#fff" size="24" />
                      ) : (
                        ' Join Group '
                      )}
                    </Connect>
                  </ConnectWrapper>
                </Section>
              )}
              {pgpPrivateKey && !verified && isMember && isRules && (
                <Section
                  width="100%"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Span
                    padding="8px 8px 8px 16px"
                    color={theme.textColor?.chatReceivedBubbleText}
                    fontSize="15px"
                    fontWeight="500"
                    textAlign="start"
                  >
                    Sending messages requires{' '}
                    <Span color={theme.backgroundColor?.chatSentBubbleBackground}>
                      1 PUSH Token
                    </Span>{' '}
                    for participation.{' '}
                    <Link
                      href="https://docs.push.org/developers/developer-tooling/push-sdk/sdk-packages-details/epnsproject-sdk-restapi/for-chat/group-chat#to-create-a-token-gated-group"
                      target="_blank"
                      color={theme.backgroundColor?.chatSentBubbleBackground}
                    >
                      Learn More <OpenLink />
                    </Link>
                  </Span>
                  <ConnectWrapper>
                    <Connect onClick={() => checkVerification()}>
                      {accessLoading ? (
                        <Spinner color="#fff" size="24" />
                      ) : (
                        'Verify Access'
                      )}
                    </Connect>
                  </ConnectWrapper>
                </Section>
              )}
              {pgpPrivateKey && !verificationSuccessfull && (
                <Modal width="439px">
                  <Section
                    padding="10px"
                    theme={theme}
                    gap="32px"
                    flexDirection="column"
                  >
                    <Span
                      fontWeight="500"
                      fontSize="24px"
                      color={theme.textColor?.chatSentBubbleText}
                    >
                      Verification Failed
                    </Span>
                    <Span
                      color={theme.textColor?.encryptionMessageText}
                      fontSize="16px"
                    >
                      Please ensure the following conditions are met to
                      participate and send messages.
                    </Span>
                    <Section gap="8px" alignItems="start">
                      <Image
                        verticalAlign="start"
                        height="24"
                        width="24"
                        src={TokenGatedIcon}
                        alt="token-gated"
                      />
                      <Section flexDirection="column">
                        {' '}
                        {/* Added marginLeft */}
                        <Span
                          color={theme.textColor?.chatSentBubbleText}
                          textAlign="start"
                          alignSelf="start"
                        >
                          Token Gated
                        </Span>
                        <Span
                          fontWeight="500"
                          textAlign="start"
                          color={theme.textColor?.chatSentBubbleText}
                        >
                          You need to have{' '}
                          <Span
                            color={
                              theme.backgroundColor?.chatSentBubbleBackground
                            }
                          >
                            1 PUSH Token
                          </Span>{' '}
                          in your wallet to be able to send messages.
                        </Span>
                      </Section>
                    </Section>
                    <Section gap="8px">
                      <TokenWrapper
                        onClick={() => {
                          if (onClick) {
                            onClick();
                          }
                          setVerificationSuccessfull(true);
                        }}
                      >
                        <TokenGet>
                          Get Free Tokens
                          <OpenLink height="12" width="12" />
                        </TokenGet>
                      </TokenWrapper>
                      <ConnectWrapperClose
                        onClick={() => {
                          setVerificationSuccessfull(true);
                        }}
                      >
                        <ConnectClose>Close</ConnectClose>
                      </ConnectWrapperClose>
                    </Section>
                  </Section>
                </Modal>
              )}
            </>
          ) : null}
          {pgpPrivateKey &&
            (((isRules ? verified : true) && isMember) ||
              (chatFeed && !chatFeed?.groupInformation)) && (
              <>
                <Section gap="8px" flex="1" position="static">
                  {Emoji && (
                    <Div
                      width="25px"
                      cursor="pointer"
                      height="25px"
                      alignSelf="end"
                      onClick={() => setShowEmojis(!showEmojis)}
                    >
                      <EmojiIcon color={theme.iconColor?.emoji} />
                    </Div>
                  )}
                  {showEmojis && (
                    <Section
                      ref={modalRef}
                      position="absolute"
                      bottom="2.5rem"
                      left="2.5rem"
                      zIndex="700"
                    >
                      <EmojiPicker
                        width={isMobile ? 260 : 320}
                        height={370}
                        onEmojiClick={addEmoji}
                      />
                    </Section>
                  )}
                  <MultiLineInput
                    theme={theme}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        sendTextMsg();
                      }
                    }}
                    placeholder="Type your message..."
                    onChange={(e) => onChangeTypedMessage(e.target.value)}
                    value={typedMessage}
                    ref={textAreaRef}
                    rows={1}
                  />
                </Section>
                <SendSection position="static">
                  {GIF && (
                    <Section
                      width="34px"
                      height="24px"
                      cursor="pointer"
                      alignSelf="end"
                      onClick={() => setGifOpen(!gifOpen)}
                    >
                      <GifIcon />
                    </Section>
                  )}
                  {gifOpen && (
                    <Section
                      position="absolute"
                      bottom="2.5rem"
                      zIndex="1"
                      right={isMobile ? '7rem' : '8rem'}
                      ref={modalRef}
                    >
                      <GifPicker
                        onGifClick={sendGIF}
                        width={isMobile ? 260 : 320}
                        height={370}
                        tenorApiKey={String(PUBLIC_GOOGLE_TOKEN)}
                      />
                    </Section>
                  )}
                  <Section onClick={handleUploadFile}>
                    {!fileUploading && File && (
                      <>
                        <Section
                          width="17"
                          height="24px"
                          cursor="pointer"
                          alignSelf="end"
                          onClick={() => setNewChat(true)}
                        >
                          <AttachmentIcon color={theme.iconColor?.attachment} />
                        </Section>
                        <FileInput
                          type="file"
                          ref={fileUploadInputRef}
                          onChange={(e) => uploadFile(e)}
                        />
                      </>
                    )}
                  </Section>
                  {!(loading || fileUploading) && (
                    <Section
                      cursor="pointer"
                      alignSelf="end"
                      height="24px"
                      onClick={() => sendTextMsg()}
                    >
                      <SendCompIcon color={theme.iconColor?.sendButton} />
                    </Section>
                  )}
  
                  {(loading || fileUploading) && (
                    <Section alignSelf="end" height="24px">
                      <Spinner color={theme.spinnerColor} size="22" />
                    </Section>
                  )}
                </SendSection>
              </>
            )}
        </TypebarSection>
      </Container>
    ) : (
      <></>   
  )
 
  );
};

const Container = styled.div<IThemeProps>`
  width: 100%;
  overflow: hidden;
  border: ${(props) => props.theme.border?.messageInput};
  border-radius: ${(props) => props.theme.borderRadius?.messageInput};
`;
const TypebarSection = styled(Section)`
  gap: 10px;
  @media ${device.mobileL} {
    gap: 0px;
  }
`;
const SendSection = styled(Section)`
  gap: 11.5px;
  @media ${device.mobileL} {
    gap: 7.5px;
  }
`;
const MultiLineInput = styled.textarea<IThemeProps>`
  font-family: inherit;
  font-weight: 400;
  transform: translateY(3px);
  font-size: 16px;
  outline: none;
  overflow-y: auto;
  box-sizing: border-box;
  background: ${(props) => props.theme.backgroundColor?.messageInputBackground};
  border: none;
  color: ${(props) => props.theme.textColor?.messageInputText};
  resize: none;
  flex: 1;
  padding-right: 5px;
  align-self: end;
  @media ${device.mobileL} {
    font-size: 14px;
  }
  &&::-webkit-scrollbar {
    width: 4px;
    padding-right: 0px;
  }
  ::-webkit-scrollbar-thumb {
    background: rgb(181 181 186);
    border-radius: 10px;
    height: 50px;
  }
  ::placeholder {
    color: ${(props) => props.theme.textColor?.messageInputText};
    transform: translateY(0px);
    @media ${device.mobileL} {
      font-size: 14px;
    }
  }

  min-height: 25px;
  max-height: 80px;
  word-break: break-word;
`;
const FileInput = styled.input`
  display: none;
`;

const ConnectWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  cursor:pointer;
`;

const StyledButton = styled.button`
  border: 0px;
  outline: 0px;
  padding: 24px 9px;
  font-weight: 500;
  border-radius: 12px;
  font-size: 17px;
  cursor: pointer;
  width: 147px;
  height: 44px;
  text-align: start;
  align-items: center;
  display: flex;
  justify-content: center;
`;

const Connect = styled(StyledButton)`
  color: rgb(255, 255, 255);
  background: #d53a94;
`;

const ConnectWrapperClose = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const StyledButtonClose = styled.button`
  border: 0px;
  outline: 0px;
  padding: 24px 9px;
  font-weight: 500;
  border-radius: 12px;
  font-size: 17px;
  cursor: pointer;
  width: 147px;
  height: 44px;
  text-align: start;
  align-items: center;
  display: flex;
  justify-content: center;
`;

const ConnectClose = styled(StyledButtonClose)`
  color: rgb(255, 255, 255);
  background: #d53a94;
  gap: 8px;
`;

const TokenWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const TokenStyledButton = styled.button`
  border: 0px;
  outline: 0px;
  padding: 22px 9px;
  font-weight: 500;
  border-radius: 12px;
  font-size: 17px;
  cursor: pointer;
  width: 100%;
  height: 44px;
  text-align: start;
  align-items: center;
  display: flex;
  justify-content: center;
`;

const TokenGet = styled(TokenStyledButton)`
  color: #d53a94;
  border: 2px solid #d53a94;
  background: none;
  gap: 8px;
`;
const Link = styled.a`
  color: #d53a94;
  link-decoration: none;
  text-decoration: none;
`;
