import type { Db } from 'mongodb';

export type NotificationType =
  | 'user_registered'
  | 'user_disabled'
  | 'user_enabled'
  | 'product_added'
  | 'product_deleted'
  | 'cashier_unavailable'
  | 'stock_out';

export async function logNotification(
  db: Db,
  type: NotificationType,
  message: string,
  meta: Record<string, unknown> = {}
) {
  await db.collection('notifications').insertOne({
    type,
    message,
    meta,
    created_at: new Date(),
  });
}
