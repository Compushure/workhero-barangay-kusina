import { Shield } from 'lucide-react';

export function LoginHeader() {
  return (
    <div className="text-center mb-8 pt-6">
      <div className="mx-auto w-12 h-12 bg-[#DBEAFE] rounded-full flex items-center justify-center">
        <Shield className="w-6 h-6 text-[#1D4ED8]" />
      </div>
      <h2 className="text-2xl font-bold text-[#1D4ED8]">Sign In</h2>
      <p className="text-sm text-gray-500">
        Enter your credentials to access the admin dashboard
      </p>
    </div>
  );
}
