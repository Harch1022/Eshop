import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';
import HeroCanvas from '../HeroCanvas';

export default function ProductPage({ userName, onLogout, addToCart, cart, isAdmin }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [addedMsg, setAddedMsg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes] = await Promise.all([
          axios.get('/api/products'),
        ]);
        const prods = prodRes.data;
        setProducts(prods);

        const cats = [...new Set(prods.map((p) => p.ProductName?.split(' ').pop()).filter(Boolean))];
        setCategories(cats);

        const q = {};
        prods.forEach((p) => { q[p.ProductID] = 1; });
        setQuantities(q);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = (product) => {
    const item = {
      id: product.ProductID,
      title: product.ProductName,
      price: product.ProductPrice,
      image: product.ProductImageURL || `https://picsum.photos/seed/${product.ProductID}/400/400`,
      category: product.ProductDescription,
    };
    addToCart(item, quantities[product.ProductID] || 1);
    setAddedMsg(product.ProductID);
    setTimeout(() => setAddedMsg(null), 1500);
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const filtered = products.filter((p) => {
    const catMatch =
      selectedCategories.size === 0 ||
      selectedCategories.has(p.ProductName?.split(' ').pop());
    const searchMatch = p.ProductName?.toLowerCase().includes(searchTerm.toLowerCase());
    return catMatch && searchMatch;
  });

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} onLogout={onLogout} cartCount={cartCount} isAdmin={isAdmin} />

      {/* Hero Section with Three.js */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <HeroCanvas />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
            Discover{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Premium
            </span>{' '}
            Products
          </h1>
          <p className="text-lg md:text-xl text-indigo-200/70 max-w-2xl mx-auto mb-8 font-light">
            Curated collection of exceptional products. Shop with confidence.
          </p>
          <a
            href="#products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-medium transition-all backdrop-blur-sm"
          >
            Explore Now
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategories(new Set())}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategories.size === 0
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCategories.has(cat)
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-xl mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-400 text-lg">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div key={product.ProductID} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover relative">
                <Link to={`/product/${product.ProductID}`} className="block">
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 overflow-hidden">
                    {product.ProductImageURL ? (
                      <img
                        src={product.ProductImageURL}
                        alt={product.ProductName}
                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-6xl opacity-20 group-hover:scale-110 transition-transform duration-500">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-indigo-500 font-medium uppercase tracking-wider mb-1">
                      {product.ProductName?.split(' ').pop()}
                    </p>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                      {product.ProductName}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                      ¥{(product.ProductPrice / 100).toFixed(2)}
                    </p>
                  </div>
                </Link>

                <div className="px-5 pb-5 flex items-center gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all active:scale-95"
                  >
                    {addedMsg === product.ProductID ? '✓ Added!' : 'Add to Cart'}
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantities[product.ProductID] || 1}
                    onChange={(e) => {
                      let v = parseInt(e.target.value, 10);
                      if (isNaN(v) || v < 1) v = 1;
                      if (v > 50) v = 50;
                      setQuantities((prev) => ({ ...prev, [product.ProductID]: v }));
                    }}
                    className="w-14 text-center py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
