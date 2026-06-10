import { MessageCircle, Shield, Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#FDFCF7]">
      {/* Left Promotional Section (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-500 blur-3xl opacity-50"></div>
        
        <div className="relative z-10 flex items-center gap-2 font-bold text-2xl tracking-tight">
          <MessageCircle className="w-8 h-8" />
          Decko
        </div>

        <div className="relative z-10 max-w-lg mb-8">
          <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6">
            Smarter Chat, <br /> Real Connections.
          </h1>
          <div className="flex flex-wrap gap-6 text-sm font-medium text-blue-100">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" /> Fast & secure
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" /> Familiar & trusted
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px] mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
