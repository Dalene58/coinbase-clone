import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveUser } from '../api/auth';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const activeUser = getActiveUser();
        if (!activeUser) {
          navigate('/signin');
          return;
        }
        setUser(activeUser);
      } catch (error) {
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect handled
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>
        <div className="bg-[#141519] p-8 rounded-2xl">
          <p className="text-xl text-white mb-4">
            <strong>Name:</strong> {user.name || 'N/A'}
          </p>
          <p className="text-lg text-[#8a919e]">
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}

