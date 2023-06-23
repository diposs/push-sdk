import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';

import { MinimisedModalHeader } from './MinimisedModalHeader';
import { Modal } from './modal';
import type { ChatFeedsType } from '../../types';
import { CHAT_SOCKET_TYPE, NotificationFeedsType } from '../../types';
import {
  ChatMainStateContext,
  ChatAndNotificationPropsContext,
  NotificationMainStateContext,
  ChatAndNotificationMainContext,
} from '../../context';
import { Section } from '../reusables/sharedStyling';
import useGetChatProfile from '../../hooks/chat/useGetChatProfile';
import {
  chatLimit,
  device,
  notificationLimit,
  requestLimit,
} from '../../config';
import useFetchRequests from '../../hooks/chat/useFetchRequests';
import useFetchChats from '../../hooks/chat/useFetchChats';
import {
  getAddress,
  getDefaultFeedObject,
  getNewChatUser,
  walletToPCAIP10,
} from '../../helpers';
import useFetchNotification from '../../hooks/notifications/useFetchNotification';
import useFetchUserSubscriptions from '../../hooks/notifications/useFetchUserSubscriptions';
import useChatNotificationSocket from '../../hooks/chatAndNotification/useChatNotificationSocket';

//make changes for users who dont have decryptedPgpPvtKey

export const ChatAndNotification = () => {
  const { setNewChat, setActiveTab, setActiveSubTab } = useContext<any>(
    ChatAndNotificationMainContext
  );
  const {
    setChatsFeed,
    setRequestsFeed,
    setSelectedChatId,
    setSearchedChats,
    setChats,
    setConnectedProfile,
    requestsFeed,
    chatsFeed,
  } = useContext<any>(ChatMainStateContext);
  const {
    setInboxNotifsFeed,
    setSpamNotifsFeed,
    subscriptionStatus,
    setSubscriptionStatus,
  } = useContext<any>(NotificationMainStateContext);
  const {
    decryptedPgpPvtKey,
    account,
    env,
    activeChosenTab,
    activeChat,
    onClose,
  } = useContext<any>(ChatAndNotificationPropsContext);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { fetchChatProfile } = useGetChatProfile();
  const { fetchRequests } = useFetchRequests();
  const { fetchChats } = useFetchChats();
  const { fetchUserSubscriptions } = useFetchUserSubscriptions();
  useChatNotificationSocket({});

  useChatNotificationSocket({ socketType: CHAT_SOCKET_TYPE.CHAT });

  useEffect(() => {
    setChatsFeed({});
    setRequestsFeed({});
    setInboxNotifsFeed({});
    setSpamNotifsFeed({});
    // setSubscriptionStatus(new Map());
    setActiveTab(activeChosenTab);

    // set active tab if present
    if (activeChosenTab) {
      setActiveTab(activeChosenTab);
      setModalOpen(true);
    }
    setActiveSubTab(null);

    setNewChat(false);
    setChats(new Map());
  }, [account, decryptedPgpPvtKey, env, activeChosenTab]);

  //make a helper for the function
  const fetchRequestList = async () => {
    const feeds = await fetchRequests({ page: 1, requestLimit });
    const firstFeeds: ChatFeedsType = { ...feeds };
    setRequestsFeed(firstFeeds);
  };

  useEffect(() => {
    if (Object.keys(requestsFeed).length) {
      return;
    }
    if (decryptedPgpPvtKey) {
      fetchRequestList();
    }
  }, [fetchRequests, decryptedPgpPvtKey, env]);

  const fetchChatList = async () => {
    const feeds = await fetchChats({ page: 1, chatLimit });
    const firstFeeds: ChatFeedsType = { ...feeds };
    setChatsFeed(firstFeeds);
  };

  useEffect(() => {
    if (Object.keys(chatsFeed).length) {
      return;
    }
    if (decryptedPgpPvtKey) {
      fetchChatList();
    }
  }, [fetchChats, decryptedPgpPvtKey, env, account]);

  useEffect(() => {
    (async () => {
      let user;
      if (account) {
        user = await fetchChatProfile({ profileId: account });

        if (user) setConnectedProfile(user);
      }
    })();
  }, [account]);

  useEffect(() => {
    (async () => {
      fetchUserSubscriptions();
    })();
  }, [env, account]);

  useEffect(() => {
    (async () => {
      if (activeChat) {
        const address = await getAddress(activeChat, env);
        if (address) {
          setModalOpen(true);
          setSelectedChatId(walletToPCAIP10(address));
          const selectedChat = chatsFeed[address] || requestsFeed[address];
          if (!selectedChat) {
            const result = await getNewChatUser({
              searchText: address,
              fetchChatProfile,
              env,
            });

            if (result) {
              const defaultFeed = getDefaultFeedObject({ user: result });
              setSearchedChats({ [defaultFeed.did]: defaultFeed });
            }
          } else {
            setSearchedChats(null);
          }
        }
      } else {
        setSearchedChats(null);
      }
    })();
  }, [activeChat]);

  const onMaximizeMinimizeToggle = () => {
    setModalOpen(!modalOpen);
  };

  const toggleOverflow = (val:string) => {
    if (typeof window != 'undefined' && window.document) {
      document.body.style.overflow = val;
  }
  }

  return (
    <Container
      width="472px"
      flexDirection="column"
      maxHeight="600px"
      position="fixed"
      background="#fff"
      padding="24px 24px 0 24px"
      right="12px"
      bottom="18px"
      overflow="hidden"
      onMouseEnter={() => toggleOverflow('hidden')}
      onMouseLeave={() => toggleOverflow('unset')}
    >
      <MinimisedModalHeader
        onMaximizeMinimizeToggle={onClose ?? onMaximizeMinimizeToggle}
        modalOpen={modalOpen}
      />
      {modalOpen && <Modal />}
    </Container>
  );
};

//styles

const Container = styled(Section)`
  border: 1px solid #dddddf;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.08), 0px 0px 96px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(5px);
  /* Note: backdrop-filter has minimal browser support */
  border-radius: 8px;
  @media ${device.mobileL} {
    width: 350px;
  }
  @media ${device.mobileS} {
    width: 330px;
    padding: 24px 17px 0 17px;
  }
`;
