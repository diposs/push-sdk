import React, { MouseEventHandler } from 'react'
import styled from 'styled-components'

export interface ISCWCModalProps { // Space Creation Widget Create Modal Interface
    isScheduleVisible?: MouseEventHandler;
    closeCreateModal?: MouseEventHandler;
}

export const SCWCreateModal: React.FC<ISCWCModalProps> = (props) => {
    const { isScheduleVisible, closeCreateModal } = props;
    return (
        <div>
            <ModalOverlay>
                <ModalParent>
                    Create Modal
                    <button
                        onClick={isScheduleVisible}
                    >
                        Schedule Space
                    </button>

                    <CloseBtn
                        onClick={closeCreateModal}
                    >
                        close create modal
                    </CloseBtn>
                </ModalParent>
            </ModalOverlay>
        </div>
    )
}

/* styling */
const ModalParent = styled.div<ISCWCModalProps>`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 5rem;
    background-color: red;

    display: flex;
    flex-direction: column;
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4); /* Black with 50% opacity */
    display: flex;
    justify-content: center;
    align-items: center;
`;

const CloseBtn = styled.button`
    position: absolute;
    top: 0;
    right: 0;
    margin: 1rem;
`;