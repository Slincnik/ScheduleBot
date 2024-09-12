import { db } from '../structures/client.js';

interface ISubscriptionManager {
  getUser(id: number): boolean;
  getAll(): number[];
  toggle(id: number): boolean;
}

class SubscriptionManager implements ISubscriptionManager {
  private db: typeof db;

  constructor(database: typeof db) {
    this.db = database;
  }

  public getUser(id: number): boolean {
    return this.db.data.subscription.includes(id);
  }

  public getAll(): number[] {
    return this.db.data.subscription;
  }

  public toggle(id: number): boolean {
    const isSubscribed = this.getUser(id);

    this.db.update((data) => {
      if (isSubscribed) {
        data.subscription = data.subscription.filter((subId) => subId !== id);
      } else {
        data.subscription.push(id);
      }
    });

    return !isSubscribed;
  }
}

export const subscriptionManager = new SubscriptionManager(db);
