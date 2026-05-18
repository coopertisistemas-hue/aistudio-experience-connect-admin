import AuthLeftPanel from '@/pages/auth/components/AuthLeftPanel';
import AuthCard from '@/pages/auth/components/AuthCard';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — cinematic experience panel */}
      <AuthLeftPanel />

      {/* Right — auth card */}
      <AuthCard />
    </div>
  );
}