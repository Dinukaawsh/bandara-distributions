import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getBillingDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const db = await getBillingDb();
    const users = db.collection('users');

    if (body.action === 'change_own') {
      const current_password = String(body.current_password || '');
      const new_password = String(body.new_password || '');
      const confirm_password = String(body.confirm_password || '');

      if (new_password !== confirm_password) {
        return NextResponse.json({ error: 'නව මුරපදයන් එකිනෙකට නොගැලපේ!' }, { status: 400 });
      }

      const dbUser = await users.findOne({ username: user.username, password: current_password });
      if (!dbUser) {
        return NextResponse.json({ error: 'ඇතුළත් කළ වත්මන් මුරපදය වැරදියි!' }, { status: 401 });
      }

      await users.updateOne({ username: user.username }, { $set: { password: new_password } });
      return NextResponse.json({ success: true, message: 'ඔබේ මුරපදය සාර්ථකව වෙනස් කරන ලදී!' });
    }

    if (body.action === 'admin_reset') {
      if (user.role.toLowerCase() !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const target_user = String(body.target_user || '');
      const admin_new_password = String(body.admin_new_password || '');
      if (!target_user || !admin_new_password) {
        return NextResponse.json({ error: 'කරුණාකර සියලුම විස්තර පුරවන්න.' }, { status: 400 });
      }

      await users.updateOne({ username: target_user }, { $set: { password: admin_new_password } });
      return NextResponse.json({
        success: true,
        message: `${target_user} ගේ මුරපදය සාර්ථකව වෙනස් කරන ලදී!`,
      });
    }

    if (body.action === 'list_users' && user.role.toLowerCase() === 'admin') {
      const allUsers = await users.find({}, { projection: { username: 1, role: 1, password: 1 } }).toArray();
      return NextResponse.json({ users: allUsers });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/password error:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
