import { db } from '../structures/client.js';

export const getUserSubscription = (id: number): boolean => db.data.subscription.includes(id);

export const getAllUsersSubscriptions = (): number[] => db.data.subscription;

export const toggleUserSubscription = (id: number): boolean => {
  const isSubscribed = getUserSubscription(id);

  db.update((data) => {
    if (isSubscribed) {
      data.subscription = data.subscription.filter((subId) => subId !== id);
    } else {
      data.subscription.push(id);
    }
  });

  return !isSubscribed;
};
