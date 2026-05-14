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
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600">Manage your profile and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium">
            <User className="w-5 h-5" />
            Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
            <Shield className="w-5 h-5" />
            Security
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-2xl">
                  {user.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {user.display_name || 'Development Admin'}
                  </h3>
                  <p className="text-gray-500">Administrator</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-gray-700 border border-gray-100">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {user.email || 'No email provided'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-red-50 bg-red-50/50">
              <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4">
                Once you sign out, you will need to log back in to manage your stores.
              </p>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
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
