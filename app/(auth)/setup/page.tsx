import Link from 'next/link';
import { Button } from '@/components/ui';
import { AuthLayout } from '@/components/layout';

export default function SetupIndexPage() {
  return (
    <AuthLayout>
      <h1 className="text-2xl font-extrabold text-primary label-si">ප්‍රථම සැකසුම</h1>
      <p className="mt-2 text-slate-600 label-si">MongoDB හි පළමු admin ගිණුම සාදන්න. සියලු පරිශීලකයින් /login හරහා පිවිසෙයි.</p>
      <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm label-si">
        <strong>SETUP_SECRET</strong> ඔබේ .env ගොනුවේ තිබිය යුතුය.
      </p>
      <div className="mt-5 space-y-2">
        <Link href="/setup/admin"><Button className="w-full">Admin ගිණුම සාදන්න</Button></Link>
        <Link href="/login"><Button variant="secondary" className="w-full">පිවිසුම් පිටුවට</Button></Link>
      </div>
    </AuthLayout>
  );
}
