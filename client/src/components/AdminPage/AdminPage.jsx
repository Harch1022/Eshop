import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';

const STATUS_OPTIONS = [
  { value: 0, label: 'Pending' },
  { value: 1, label: 'Paid' },
  { value: 2, label: 'Shipped' },
  { value: 3, label: 'Delivered' },
];

const statusBadge = (status) => {
  const colors = {
    0: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    1: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    2: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    3: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  const labels = { 0: 'Pending', 1: 'Paid', 2: 'Shipped', 3: 'Delivered' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || colors[0]}`}>
      {labels[status] || 'Pending'}
    </span>
  );
};

export default function AdminPage({ userName, onLogout }) {
  const [tab, setTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- Products state ---
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    ProductName: '',
    ProductPrice: '',
    ProductStock: '',
    ProductDescription: '',
  });

  // --- Orders state ---
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // --- Sold products state ---
  const [soldProducts, setSoldProducts] = useState([]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const resetForm = () => {
    setFormData({ ProductName: '', ProductPrice: '', ProductStock: '', ProductDescription: '' });
    setEditingProduct(null);
    setShowAddForm(false);
    setImageFile(null);
    setImagePreview(null);
  };

  // --- Data fetching ---
  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders/admin');
      setOrders(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchSoldProducts = async () => {
    try {
      const res = await axios.get('/api/orders/admin');
      const sold = {};
      res.data.forEach((order) => {
        (order.items || []).forEach((item) => {
          const key = item.ProductID;
          if (!sold[key]) {
            sold[key] = { productName: item.ProductName, productId: item.ProductID, totalSold: 0, revenue: 0, buyers: [] };
          }
          sold[key].totalSold += item.Number;
          sold[key].revenue += item.Price * item.Number;
          if (!sold[key].buyers.find((b) => b.userId === order.UserID)) {
            sold[key].buyers.push({ userId: order.UserID, userName: order.UserName, email: order.UserEmail });
          }
        });
      });
      setSoldProducts(Object.values(sold));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProducts(), fetchOrders(), fetchSoldProducts()]).finally(() => setLoading(false));
  }, []);

  // --- Product CRUD ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      if (imageFile) {
        const fd = new FormData();
        fd.append('ProductName', formData.ProductName);
        fd.append('ProductPrice', Math.round(parseFloat(formData.ProductPrice) * 100));
        fd.append('ProductStock', parseInt(formData.ProductStock));
        fd.append('ProductDescription', formData.ProductDescription);
        fd.append('ProductImage', imageFile);
        await axios.post('/api/products', fd);
      } else {
        await axios.post('/api/products', {
          ProductName: formData.ProductName,
          ProductPrice: Math.round(parseFloat(formData.ProductPrice) * 100),
          ProductStock: parseInt(formData.ProductStock),
          ProductDescription: formData.ProductDescription,
        });
      }
      resetForm();
      fetchProducts();
    } catch (err) { console.error('Failed to add product:', err); }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/products/update?productId=${editingProduct.ProductID}`, {
        ProductName: formData.ProductName,
        ProductPrice: Math.round(parseFloat(formData.ProductPrice) * 100),
        ProductStock: parseInt(formData.ProductStock),
        ProductDescription: formData.ProductDescription,
      });
      if (imageFile) {
        const fd = new FormData();
        fd.append('ProductImage', imageFile);
        await axios.put(`/api/products/${editingProduct.ProductID}/image`, fd);
      }
      resetForm();
      fetchProducts();
    } catch (err) { console.error('Failed to update product:', err); }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/api/products/${productId}`);
      fetchProducts();
    } catch (err) { console.error('Failed to delete product:', err); }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      ProductName: product.ProductName,
      ProductPrice: (product.ProductPrice / 100).toFixed(2),
      ProductStock: product.ProductStock.toString(),
      ProductDescription: product.ProductDescription || '',
    });
    setImagePreview(product.ProductImageURL || null);
    setImageFile(null);
    setShowAddForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // --- Order management ---
  const handleUpdateShipping = async (orderId, status, tracking) => {
    try {
      await axios.put(`/api/orders/${orderId}/shipping`, { Status: status, TrackingNumber: tracking });
      fetchOrders();
      fetchSoldProducts();
    } catch (err) { console.error('Failed to update shipping:', err); }
  };

  const orderTotal = (order) => {
    if (!order.items) return 0;
    return order.items.reduce((s, i) => s + i.Price * i.Number, 0);
  };

  const tabs = [
    { key: 'products', label: 'Products' },
    { key: 'orders', label: 'Orders' },
    { key: 'sold', label: 'Sold Products' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <Navbar userName={userName} onLogout={handleLogout} cartCount={0} isAdmin />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ==================== PRODUCTS TAB ==================== */}
            {tab === 'products' && (
              <>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => { resetForm(); setShowAddForm(!showAddForm); }}
                    className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      showAddForm
                        ? 'bg-white/10 text-white hover:bg-white/15'
                        : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25'
                    }`}
                  >
                    {showAddForm ? 'Cancel' : '+ Add Product'}
                  </button>
                </div>

                {showAddForm && (
                  <div className="glass rounded-2xl p-6 mb-6 shadow-2xl">
                    <h2 className="font-semibold text-white mb-4">
                      {editingProduct ? 'Edit Product' : 'New Product'}
                    </h2>
                    <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-indigo-200 mb-1.5">Product Name</label>
                        <input
                          type="text"
                          value={formData.ProductName}
                          onChange={(e) => setFormData((p) => ({ ...p, ProductName: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-indigo-200 mb-1.5">Price (¥)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.ProductPrice}
                          onChange={(e) => setFormData((p) => ({ ...p, ProductPrice: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-indigo-200 mb-1.5">Stock</label>
                        <input
                          type="number"
                          value={formData.ProductStock}
                          onChange={(e) => setFormData((p) => ({ ...p, ProductStock: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-indigo-200 mb-1.5">Description</label>
                        <input
                          type="text"
                          value={formData.ProductDescription}
                          onChange={(e) => setFormData((p) => ({ ...p, ProductDescription: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>

                      {/* Image upload */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-indigo-200 mb-1.5">Product Image</label>
                        <div className="flex items-center gap-4">
                          {imagePreview && (
                            <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/70 text-sm hover:bg-white/10 transition-all"
                            >
                              {imagePreview ? 'Change Image' : 'Choose Image'}
                            </button>
                            {imageFile && (
                              <p className="text-white/30 text-xs mt-1">{imageFile.name}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <button
                          type="submit"
                          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-500/25"
                        >
                          {editingProduct ? 'Update Product' : 'Add Product'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="glass rounded-2xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">ID</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Product</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Image</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Price</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Stock</th>
                          <th className="text-right px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {products.map((p) => (
                          <tr key={p.ProductID} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-sm text-white/30 font-mono">#{p.ProductID}</td>
                            <td className="px-6 py-4 font-medium text-white text-sm">{p.ProductName}</td>
                            <td className="px-6 py-4">
                              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                                {p.ProductImageURL ? (
                                  <img src={p.ProductImageURL} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-white/10 text-xs">N/A</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-white">¥{(p.ProductPrice / 100).toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                p.ProductStock > 20 ? 'bg-emerald-500/20 text-emerald-400' :
                                p.ProductStock > 0 ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {p.ProductStock}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => startEdit(p)}
                                  className="px-3 py-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.ProductID)}
                                  className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ==================== ORDERS TAB ==================== */}
            {tab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-20 glass rounded-2xl">
                    <p className="text-white/30 text-lg">No orders yet</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.OrderID} className="glass rounded-2xl overflow-hidden shadow-2xl">
                      {/* Header row */}
                      <div
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => setExpandedOrder(expandedOrder === order.OrderID ? null : order.OrderID)}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-white font-semibold text-sm">Order #{order.OrderID}</span>
                          {statusBadge(order.ShippingStatus != null ? order.ShippingStatus : 0)}
                          <span className="text-white/30 text-xs">
                            {new Date(order.OrderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-white text-sm font-semibold">{order.UserName}</p>
                            <p className="text-white/30 text-xs">{order.UserEmail}</p>
                          </div>
                          <span className="text-white font-semibold text-sm">¥{(orderTotal(order) / 100).toFixed(2)}</span>
                          <svg className={`w-4 h-4 text-white/30 transition-transform ${expandedOrder === order.OrderID ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {expandedOrder === order.OrderID && (
                        <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                          {/* Shipping management */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                            <div>
                              <label className="block text-white/30 text-xs mb-1">Status</label>
                              <select
                                value={order.ShippingStatus != null ? order.ShippingStatus : 0}
                                onChange={(e) => handleUpdateShipping(order.OrderID, parseInt(e.target.value), order.TrackingNumber)}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              >
                                {STATUS_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-white/30 text-xs mb-1">Tracking Number</label>
                              <input
                                type="text"
                                defaultValue={order.TrackingNumber || ''}
                                placeholder="Enter tracking #"
                                onBlur={(e) => {
                                  const val = e.target.value.trim();
                                  const cur = order.TrackingNumber || '';
                                  if (val !== cur) {
                                    handleUpdateShipping(order.OrderID, order.ShippingStatus != null ? order.ShippingStatus : 0, val);
                                  }
                                }}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-white/15"
                              />
                            </div>
                            <div>
                              <label className="block text-white/30 text-xs mb-1">Payment</label>
                              <span className="inline-block px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300 text-xs font-medium">
                                {order.PaymentMethod || 'Credit Card'}
                              </span>
                            </div>
                            <div>
                              <label className="block text-white/30 text-xs mb-1">Customer</label>
                              <p className="text-white text-sm py-2 truncate">{order.UserName}</p>
                            </div>
                          </div>

                          {/* Items */}
                          <div>
                            <h4 className="text-white/30 text-xs uppercase tracking-wider mb-2">Order Items</h4>
                            <div className="space-y-2">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <span className="text-white/70">
                                    {item.ProductName} <span className="text-white/30">×{item.Number}</span>
                                  </span>
                                  <span className="text-white font-medium">¥{((item.Price * item.Number) / 100).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping address */}
                          {(order.RecipientName || order.Address) && (
                            <div>
                              <h4 className="text-white/30 text-xs uppercase tracking-wider mb-1">Shipping Address</h4>
                              <p className="text-white/60 text-sm">
                                {order.RecipientName} | {order.Phone}
                              </p>
                              <p className="text-white/40 text-sm">{order.Address}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ==================== SOLD PRODUCTS TAB ==================== */}
            {tab === 'sold' && (
              <div className="glass rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Product</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Total Sold</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Revenue</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Buyers</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {soldProducts.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-16 text-center text-white/30 text-sm">
                            No products sold yet
                          </td>
                        </tr>
                      ) : (
                        soldProducts.map((sp) => (
                          <tr key={sp.productId} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-medium text-white text-sm">{sp.productName}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">
                                {sp.totalSold} units
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-white">¥{(sp.revenue / 100).toFixed(2)}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1.5">
                                {sp.buyers.map((b) => (
                                  <span key={b.userId} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs">
                                    {b.userName}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
