import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/users/leaderboard?limit=100');
      setLeaders(response.data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-quantum-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-quantum-primary">Leaderboard</h1>
          <Link to="/lobby" className="btn-secondary text-sm py-1 px-4">
            Back to Lobby
          </Link>
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">Player</th>
                  <th className="text-center py-3 px-4">Points</th>
                  <th className="text-center py-3 px-4">Wins</th>
                  <th className="text-center py-3 px-4">Losses</th>
                  <th className="text-center py-3 px-4">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((player, index) => {
                  const winRate = player.stats.gamesPlayed > 0
                    ? Math.round((player.stats.wins / player.stats.gamesPlayed) * 100)
                    : 0;

                  return (
                    <tr
                      key={player._id}
                      className="border-b border-gray-800 hover:bg-quantum-primary hover:bg-opacity-5 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className={`font-bold ${index < 3 ? 'text-quantum-primary text-xl' : ''}`}>
                          {index + 1}
                          {index === 0 && <span className="text-yellow-400 ml-2">★</span>}
                          {index === 1 && <span className="text-gray-400 ml-2">★</span>}
                          {index === 2 && <span className="text-orange-400 ml-2">★</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/profile/${player._id}`}
                          className="hover:text-quantum-primary transition-colors"
                        >
                          <div className="font-bold">{player.username}</div>
                          <div className="text-xs text-quantum-ghost">{player.quantumId}</div>
                        </Link>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="text-quantum-primary font-bold text-lg">
                          {player.points}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="text-green-400 font-semibold">
                          {player.stats.wins}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="text-red-400 font-semibold">
                          {player.stats.losses}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="font-semibold">{winRate}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {leaders.length === 0 && (
            <div className="text-center py-12 text-quantum-ghost">
              No players yet. Be the first!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
