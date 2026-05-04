import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';

export default function ProductInfoPage({ userName, onLogout, addToCart, cart }) {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    axios
      .get(`/api/products`, { params: { productId } })
      .then((res) => setProduct(res.data))
      .catch(console.error);
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      {
        id: product.ProductID,
        title: product.ProductName,
        price: product.ProductPrice,
        image: product.ProductImageURL || `https://picsum.photos/seed/${product.ProductID}/400/400`,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
      </div>
    );

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} onLogout={onLogout} cartCount={cartCount} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Link
          to="/productPage"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image */}
          <div className="aspect-square bg-white rounded-3xl border border-gray-100 flex items-center justify-center p-8 shadow-sm overflow-hidden">
            {product.ProductImageURL ? (
              <img
                src={product.ProductImageURL}
                alt={product.ProductName}
                className="max-w-full max-h-full object-contain animate-float"
              />
            ) : (
              <div className="text-[160px] opacity-10 animate-float">📦</div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">
              {product.ProductName?.split(' ').pop()}
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {product.ProductName}
            </h1>
            <p className="text-gray-500 leading-relaxed mb-8 text-base">
              {product.ProductDescription || 'No description available.'}
            </p>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-gray-900">
                ¥{(product.ProductPrice / 100).toFixed(2)}
              </span>
              {product.ProductStock > 0 ? (
                <span className="text-sm text-green-600 font-medium">
                  {product.ProductStock} in stock
                </span>
              ) : (
                <span className="text-sm text-red-500 font-medium">Out of stock</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => {
                  let v = parseInt(e.target.value, 10);
                  if (isNaN(v) || v < 1) v = 1;
                  if (v > 50) v = 50;
                  setQuantity(v);
                }}
                className="w-16 text-center py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                onClick={handleAddToCart}
                disabled={product.ProductStock <= 0}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {added ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
