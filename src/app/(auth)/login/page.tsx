import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | Notes App',
  description: 'Sign in to your Notes account',
};

// Configure this page to be statically rendered
// This forces the page to be statically rendered at build time
// without disabling API routes or middleware
export const dynamic = 'force-static';

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="text-3xl font-bold text-center mb-6">Sign In</h2>
            <LoginForm />
          </div>
        </div>
      </div>
    </>
  );
}
