import {
  CreateGroupEvent,
  GroupMeta,
  GroupEventRawData,
  UpdateGroupEvent,
  MessageRawData,
  MessageEvent,
  MessageEventType,
  Member,
  GroupEventType,
  LeaveGroupEvent,
  JoinGroupEvent,
} from './pushStreamTypes';

export class DataModifier {
  public static handleChatGroupEvent(data: any, includeRaw = false): any {
    if (data.eventType === 'create') {
      return this.mapToCreateGroupEvent(data, includeRaw);
    } else if (data.eventType === 'update') {
      return this.mapToUpdateGroupEvent(data, includeRaw);
    } else if (
      data.eventType === GroupEventType.JoinGroup ||
      data.eventType === GroupEventType.LeaveGroup ||
      data.eventType === MessageEventType.Request ||
      data.eventType === GroupEventType.Remove
    ) {
      return this.mapToGroupMemberEvent(data, includeRaw, data.eventType);
    } else {
      console.warn('Unknown eventType:', data.eventType);
      return data;
    }
  }

  private static buildChatGroupEventMetaAndRaw(
    incomingData: any,
    includeRaw: boolean
  ): {
    meta: GroupMeta;
    raw?: GroupEventRawData;
  } {
    const mapMembersAdmins = (arr: any[]): Member[] => {
      return arr.map((item) => ({
        address: item.wallet,
        profile: {
          image: item.image,
          publicKey: item.publicKey,
        },
      }));
    };

    const mapPendingMembersAdmins = (arr: any[]): Member[] => {
      return arr.map((item) => ({
        address: item.wallet,
        profile: {
          image: item.image,
          publicKey: item.publicKey,
        },
      }));
    };

    const meta: GroupMeta = {
      name: incomingData.groupName,
      description: incomingData.groupDescription,
      image: incomingData.groupImage,
      owner: incomingData.groupCreator,
      members: mapMembersAdmins(
        incomingData.members.filter((m: any) => !m.isAdmin)
      ),
      admins: mapMembersAdmins(
        incomingData.members.filter((m: any) => m.isAdmin)
      ),
      pending: {
        members: mapPendingMembersAdmins(
          incomingData.pendingMembers.filter((m: any) => !m.isAdmin)
        ),
        admins: mapPendingMembersAdmins(
          incomingData.pendingMembers.filter((m: any) => m.isAdmin)
        ),
      },
      private: !incomingData.isPublic,
      rules: incomingData.rules || {},
    };

    if (includeRaw) {
      const raw: GroupEventRawData = {
        verificationProof: incomingData.verificationProof,
      };
      return { meta, raw };
    }

    return { meta };
  }

  public static mapToGroupEvent(
    eventType: GroupEventType,
    incomingData: any,
    includeRaw: boolean
  ): CreateGroupEvent | UpdateGroupEvent {
    const { meta, raw } = this.buildChatGroupEventMetaAndRaw(
      incomingData,
      includeRaw
    );

    const groupEvent: any = {
      event: eventType,
      origin: incomingData.messageOrigin,
      timestamp: incomingData.timestamp,
      chatId: incomingData.chatId,
      from: incomingData.from,
      meta,
    };

    if (includeRaw) {
      groupEvent.raw = raw;
    }

    return groupEvent as CreateGroupEvent | UpdateGroupEvent;
  }

  public static mapToCreateGroupEvent(
    incomingData: any,
    includeRaw: boolean
  ): CreateGroupEvent {
    return this.mapToGroupEvent(
      GroupEventType.CreateGroup,
      incomingData,
      includeRaw
    ) as CreateGroupEvent;
  }

  public static mapToUpdateGroupEvent(
    incomingData: any,
    includeRaw: boolean
  ): UpdateGroupEvent {
    return this.mapToGroupEvent(
      GroupEventType.UpdateGroup,
      incomingData,
      includeRaw
    ) as UpdateGroupEvent;
  }

  public static mapToMessageEvent(
    data: any,
    includeRaw = false,
    eventType: MessageEventType
  ): MessageEvent {
    const messageEvent: MessageEvent = {
      event: eventType,
      origin: data.messageOrigin,
      timestamp: data.timestamp.toString(),
      chatId: data.chatId, // TODO: ChatId not working for w2w
      from: data.fromCAIP10,
      to: [data.toCAIP10], // TODO: Assuming 'to' is an array in MessageEvent. Update as necessary.
      message: {
        type: data.messageType,
        content: data.messageContent,
      },
      meta: {
        group: data.isGroup || false,
      },
      reference: data.cid,
    };

    if (includeRaw) {
      const rawData: MessageRawData = {
        fromCAIP10: data.fromCAIP10,
        toCAIP10: data.toCAIP10,
        fromDID: data.fromDID,
        toDID: data.toDID,
        encType: data.encType,
        encryptedSecret: data.encryptedSecret,
        signature: data.signature,
        sigType: data.sigType,
        verificationProof: data.verificationProof,
        previousReference: data.link,
      };
      messageEvent.raw = rawData;
    }

    return messageEvent;
  }

  public static handleChatEvent(data: any, includeRaw = false): any {
    const eventTypeMap: { [key: string]: MessageEventType } = {
      Chat: MessageEventType.Message,
      Request: MessageEventType.Request,
      Approve: MessageEventType.Accept,
      Reject: MessageEventType.Reject,
    };

    const eventType: MessageEventType | undefined =
      eventTypeMap[data.eventType || data.messageCategory];

    if (eventType) {
      return this.mapToMessageEvent(
        data,
        includeRaw,
        eventType as MessageEventType
      );
    } else {
      console.warn(
        'Unknown eventType:',
        data.eventType || data.messageCategory
      );
      return data;
    }
  }

  private static mapToGroupMemberEvent(
    data: any,
    includeRaw: boolean,
    eventType: GroupEventType
  ): JoinGroupEvent | LeaveGroupEvent {
    const baseEventData = {
      origin: data.messageOrigin,
      timestamp: data.timestamp,
      chatId: data.chatId,
      from: data.from,
      to: data.to,
      event: eventType as GroupEventType.JoinGroup | GroupEventType.LeaveGroup,
    };

    return includeRaw
      ? {
          ...baseEventData,
          raw: { verificationProof: data.verificationProof },
        }
      : baseEventData;
  }
}
