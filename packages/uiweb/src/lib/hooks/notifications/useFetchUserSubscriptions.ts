import * as PushAPI from '@pushprotocol/restapi';
import type { ParsedResponseType } from '@pushprotocol/restapi';
import { useCallback, useContext, useState } from 'react';
import {
  ChatAndNotificationPropsContext,
  NotificationMainStateContext,
} from '../../context';
import { ParsedNotificationType } from '../../types';

const useFetchUserSubscriptions = () => {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const { account, env } = useContext<any>(ChatAndNotificationPropsContext);
  const { setSubscriptionStatus } = useContext<any>(
    NotificationMainStateContext
  );

  const fetchUserSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      console.log(env);
      const results = await PushAPI.user.getSubscriptions({
        user: account, // user address in CAIP
        env,
      });
      const subscriptionsMapping = new Map();
      results.forEach((subscription: { channel: string }) =>
        subscriptionsMapping.set(subscription.channel, true)
      );
      setSubscriptionStatus(subscriptionsMapping);
    } catch (error: Error | any) {
      setLoading(false);
      setError(error.message);
      console.log(error);
      return;
    } finally {
      setLoading(false);
    }
  }, [account, env]);

  return { fetchUserSubscriptions, error, loading };
};

export default useFetchUserSubscriptions;
