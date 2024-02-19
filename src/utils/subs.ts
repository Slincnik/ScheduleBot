import { db } from '../structures/client.js';

export const getUserSubscription = (id: number) => db.data.subscription.includes(id);

export const getAllUsersSubscriptions = () => db.data.subscription;

export const enableUserSubscription = (id: number) => {
  const userSub = getUserSubscription(id);

  if (userSub) return false;

  db.update((data) => data.subscription.push(id));

  return true;
};

export const disableUserSubscription = (id: number) => {
  const userSub = getUserSubscription(id);

  if (!userSub) return false;

  db.update((data) => {
    data.subscription.splice(data.subscription.indexOf(id), 1);
  });

  return true;
};
