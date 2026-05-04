import { useEffect, useState } from 'react';
import { getAllCryptos, getGainers, getNewListings, createCrypto } from '../api/crypto';

const CryptoCard = ({ crypto, onEdit }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all">
    <div className="flex items-start gap-4">
      <img 
        src={crypto.image || '/placeholder-coin.png'} 
        alt={crypto.name}
        className="h-12 w-12 rounded-full"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 truncate">{crypto.name}</h3>
        <p className="text-sm text-slate-500 capitalize">{crypto.symbol}</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-slate-900">${crypto.price?.toFixed(4) || 'N/A'}</p>
        <p className={`text-sm font-medium ${crypto.change24h >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {crypto.change24h?.toFixed(2) || 'N/A'}%
        </p>
      </div>
    </div>
    {onEdit && (
      <button 
        onClick={() => onEdit(crypto)}
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
      >
        Edit
      </button>
    )}
  </div>
);

export default function Crypto() {
  const [allCryptos, setAllCryptos] = useState([]);
  const [gainers, setGainers] = useState([]);
  const [newListings, setNewListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    price: '',
    image: '',
    change24h: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [all, gainersData, newData] = await Promise.all([
        getAllCryptos(),
        getGainers(),
        getNewListings()
      ]);
      setAllCryptos(all || []);
      setGainers(gainersData || []);
      setNewListings(newData || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCrypto({
        name: formData.name,
        symbol: formData.symbol.toUpperCase(),
        price: parseFloat(formData.price),
        image: formData.image,
        change24h: parseFloat(formData.change24h)
      });
      setShowAddForm(false);
      setFormData({ name: '', symbol: '', price: '', image: '', change24h: '' });
      fetchData(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  const currentData = activeTab === 'gainers' ? gainers : 
                     activeTab === 'new' ? newListings : allCryptos;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Cryptocurrencies</h1>
            <p className="text-xl text-gray-600 mt-2">Manage and view all cryptocurrencies</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            {showAddForm ? 'Cancel' : '+ Add Crypto'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Add New Cryptocurrency</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">24h Change (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.change24h}
                  onChange={(e) => setFormData({...formData, change24h: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (optional)</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  Create Crypto
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-200 text-gray-900 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <p className="text-red-800 font-medium">{error}</p>
            <button onClick={fetchData} className="mt-3 text-blue-600 hover:underline">
              Retry
            </button>
          </div>
        )}

        <div className="flex bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <button
            className={`px-6 py-4 font-semibold ${activeTab === 'all' ? 'bg-blue-50 border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('all')}
          >
            All Cryptos ({allCryptos.length})
          </button>
          <button
            className={`px-6 py-4 font-semibold ${activeTab === 'gainers' ? 'bg-green-50 border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('gainers')}
          >
            Top Gainers ({gainers.length})
          </button>
          <button
            className={`px-6 py-4 font-semibold ${activeTab === 'new' ? 'bg-purple-50 border-b-2 border-purple-600 text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('new')}
          >
            New ({newListings.length})
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-gray-200 h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentData.map((crypto) => (
              <CryptoCard key={crypto._id || crypto.id} crypto={crypto} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

