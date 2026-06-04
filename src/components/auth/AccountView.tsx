import { User, Mail, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function AccountView() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Account Settings</h1>
        <p className="text-brand-slate">Manage your profile and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 bg-brand-cream text-brand-dark rounded-lg font-bold">
            <User className="w-5 h-5" />
            Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-brand-slate hover:bg-brand-steel/20 hover:text-white rounded-lg font-medium transition-colors">
            <Shield className="w-5 h-5" />
            Security
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#071739]/60 backdrop-blur-md rounded-2xl border border-brand-steel/20 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-brand-steel/15">
              <h2 className="text-lg font-semibold text-white">Profile Information</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-brand-steel/30 rounded-2xl flex items-center justify-center text-brand-cream font-bold text-2xl border border-brand-steel/40">
                  {user.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">
                    {user.display_name || 'Development Admin'}
                  </h3>
                  <p className="text-brand-slate">Administrator</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-slate mb-1">Email</label>
                  <div className="flex items-center gap-2 p-3 bg-brand-dark rounded-xl text-white border border-brand-steel/45">
                    <Mail className="w-4 h-4 text-brand-slate/60" />
                    {user.email || 'No email provided'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-950/10 backdrop-blur-md rounded-2xl border border-red-500/20 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-red-500/20 bg-red-950/20">
              <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
            </div>
            <div className="p-6">
              <p className="text-brand-slate text-sm mb-4">
                Once you sign out, you will need to log back in to manage your stores.
              </p>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
