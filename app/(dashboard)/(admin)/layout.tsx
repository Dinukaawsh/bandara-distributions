import { AdminOnly } from '@/components/layout/AdminOnly';

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return <AdminOnly>{children}</AdminOnly>;
}
