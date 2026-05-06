import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
      return;
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-[#141519] rounded-2xl shadow-lg border border-[#1f2126] p-8">
        
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-white">
              {user.name || "Unnamed User"}
            </h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#1f2126] mb-6"></div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-[#0f1115] p-4 rounded-xl">
            <p className="text-sm text-gray-400">Account Type</p>
            <p className="text-white text-lg font-medium">
              {user.accountType || "Personal"}
            </p>
          </div>

          <div className="bg-[#0f1115] p-4 rounded-xl">
            <p className="text-sm text-gray-400">Joined</p>
            <p className="text-white text-lg font-medium">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          <div className="bg-[#0f1115] p-4 rounded-xl">
            <p className="text-sm text-gray-400">User ID</p>
            <p className="text-white text-lg font-medium">
              {user.id || "N/A"}
            </p>
          </div>

          <div className="bg-[#0f1115] p-4 rounded-xl">
            <p className="text-sm text-gray-400">Status</p>
            <p className="text-green-400 text-lg font-medium">
              Active
            </p>
          </div>

        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => navigate('/edit-profile')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
          >
            Edit Profile
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('user');
              navigate('/signin');
            }}
            className="text-red-400 hover:text-red-500 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

