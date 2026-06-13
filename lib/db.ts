import { getMongoClient } from '@/lib/mongodb';

export async function getBillingDb() {
  const client = await getMongoClient();
  return client.db('billing_system');
}

export const DEFAULT_STORE = {
  store_name: 'BANDARA STORE',
  address: 'මැදවෙල, මන්දාරම්නුවර',
  phone: 'දු.ක: 0729484858 / 0759335156',
};
