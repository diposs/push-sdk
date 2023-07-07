import React, { useState } from 'react';
import styled from 'styled-components';
import { Modal } from '../reusables/Modal';
import { Spinner } from '../reusables/Spinner';
import { ModalHeader } from '../reusables/ModalHeader';
import { useFeedScroll, useSpaceData, useSpaceRequests } from '../../../hooks';
import { SpaceBanner } from '../SpaceBanner';

export interface ISpaceInvitesProps {
  account?: string;
  children?: React.ReactNode;
}

export const SpaceInvites: React.FC<ISpaceInvitesProps> = ({
  account = '0x04bE5701AB5b2f2117332b4748020737B29a2e1D',
  children,
}: ISpaceInvitesProps) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { spaceRequests, setSpaceRequests } = useSpaceData();

  const containerRef = useFeedScroll(spaceRequests.apiData?.length);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const loadMoreData = () => {
    if (
      loading === false &&
      spaceRequests.currentPage &&
      spaceRequests.lastPage &&
      spaceRequests.currentPage < spaceRequests.lastPage
    ) {
      console.log('Load More Data');
      setSpaceRequests({
        currentPage: spaceRequests.currentPage + 1,
        lastPage: spaceRequests.lastPage + 1,
      });
    }
  };

  const onScrollContainer = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight) {
        loadMoreData();
      }
    }
  };

  const { loading } = useSpaceRequests(account);
  return (
    <>
      {!children && <Button onClick={handleOpenModal}>Space Invites</Button>}

      {children && <div onClick={handleOpenModal}>{children}</div>}

      {modalOpen && (
        <Modal clickawayClose={handleCloseModal} width="450px">
          <ModalHeader
            heading='Spaces Invites'
            headingBadgeNumber={spaceRequests.apiData?.length}
            closeCallback={handleCloseModal}
          />
          <ScrollContainer ref={containerRef} onScroll={onScrollContainer}>
            <InviteContainer>
              {spaceRequests.apiData
                ? spaceRequests.apiData.map((space: any) => {
                    return (
                      <SpaceBanner
                        spaceId={space.spaceId}
                        orientation="maximized"
                        isInvite={true}
                      />
                    );
                  })
                : null}
              {loading ? <Spinner size="40" /> : null}
            </InviteContainer>
          </ScrollContainer>
        </Modal>
      )}
    </>
  );
};

const Button = styled.button`
  padding: 8px 16px;
  background-color: #8b5cf6;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const ScrollContainer = styled.div`
  max-height: 400px;
  width: inherit;
  margin-top: 24px;
  overflow-y: scroll;

  &::-webkit-scrollbar{
    margin-left: 10px;
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb{
    -webkit-appearance: none;
    width: 4px;
    height: auto;
    background:#8B5CF6;
    border-radius: 99px;
  }
}`;

const InviteContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 10px;
}`;
