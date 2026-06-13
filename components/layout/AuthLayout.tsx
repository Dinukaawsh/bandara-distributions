import { Footer } from '@/components/ui';

type AuthLayoutProps = {
  children: React.ReactNode;
  langToggle?: React.ReactNode;
};

export function AuthLayout({ children, langToggle }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      {langToggle && <div className="absolute right-4 top-4 z-10">{langToggle}</div>}
      <div className="auth-card">{children}</div>
      <div className="absolute bottom-4 w-full">
        <Footer />
      </div>
    </div>
  );
}
