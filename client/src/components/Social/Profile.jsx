import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || currentUser?.id;

  const fetchProfile = useCallback(async () => {
    try {
      const response = await axios.get(`/users/${targetUserId}`);
      setProfile(response.data.user);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-quantum-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <Link to="/lobby" className="btn-primary">
            Back to Lobby
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-quantum-primary">Player Profile</h1>
          <Link to="/lobby" className="btn-secondary text-sm py-1 px-4">
            Back to Lobby
          </Link>
        </div>

        <div className="card mb-6">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-24 h-24 bg-quantum-primary bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-4xl font-black">{profile.username[0].toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold">{profile.username}</h2>
              <p className="text-quantum-ghost">Quantum ID: {profile.quantumId}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`w-3 h-3 rounded-full ${profile.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                <span className="text-sm">{profile.isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-700">
            <div className="text-center">
              <div className="text-3xl font-black text-quantum-primary">{profile.points}</div>
              <div className="text-sm text-quantum-ghost">Points</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-green-400">{profile.stats.wins}</div>
              <div className="text-sm text-quantum-ghost">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-quantum-ghost">{profile.stats.ties}</div>
              <div className="text-sm text-quantum-ghost">Ties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-red-400">{profile.stats.losses}</div>
              <div className="text-sm text-quantum-ghost">Losses</div>
            </div>
          </div>

          {profile.stats.gamesPlayed > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">Win Rate</div>
                <div className="text-4xl font-black text-quantum-primary">
                  {Math.round((profile.stats.wins / profile.stats.gamesPlayed) * 100)}%
                </div>
                <div className="text-sm text-quantum-ghost mt-2">
                  {profile.stats.gamesPlayed} total games
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
