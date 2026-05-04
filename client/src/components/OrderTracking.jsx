import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar.jsx';

const STEPS = [
  { key: 0, label: 'Order Placed', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { key: 1, label: 'Payment Confirmed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 2, label: 'Shipped', icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
  { key: 3, label: 'Delivered', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
];

export default function OrderTracking({ userName, onLogout }) {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get('/api/orders')
      .then((res) => {
        const found = res.data.find((o) => String(o.OrderID) === String(orderId));
        if (found) setOrder(found);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  const status = order?.ShippingStatus != null ? order.ShippingStatus : 0;
  const total = order?.items
    ? order.items.reduce((sum, it) => sum + it.Price * it.Number, 0)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <Navbar userName={userName} onLogout={onLogout} cartCount={0} />

      <div className="max-w-3xl mx-auto px-4 pt-28 pb-16">
        {/* Back link */}
        <button
          onClick={() => navigate('/orders')}
          className="text-white/50 hover:text-white/80 transition-colors text-sm flex items-center gap-1 mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Orders
        </button>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !order ? (
          <div className="text-center py-20">
            <p className="text-white/50 text-lg">Order not found</p>
            <Link to="/orders" className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 text-sm">
              View my orders →
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Order #{order.OrderID}</h1>
              <p className="text-white/40 text-sm mt-1">
                Placed on{' '}
                {new Date(order.OrderDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Timeline */}
            <div className="glass rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-6">Tracking Status</h2>
              <div className="relative">
                {STEPS.map((step, idx) => {
                  const completed = status > step.key;
                  const current = status === step.key;
                  const isLast = idx === STEPS.length - 1;

                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      {/* Icon column */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            completed
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                              : current
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 ring-4 ring-indigo-500/20'
                              : 'bg-white/5 border-white/10 text-white/20'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                          </svg>
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 h-10 mt-1 ${
                              completed ? 'bg-emerald-500/40' : 'bg-white/10'
                            }`}
                          />
                        )}
                      </div>

                      {/* Label */}
                      <div className="pt-2 pb-6">
                        <p
                          className={`text-sm font-medium ${
                            completed
                              ? 'text-emerald-400'
                              : current
                              ? 'text-white'
                              : 'text-white/25'
                          }`}
                        >
                          {step.label}
                        </p>
                        {current && !completed && (
                          <p className="text-white/30 text-xs mt-0.5">In progress</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping & Tracking Info */}
            <div className="glass rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wide mb-1">Recipient</p>
                  <p className="text-white text-sm">{order.RecipientName || '-'}</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wide mb-1">Phone</p>
                  <p className="text-white text-sm">{order.Phone || '-'}</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wide mb-1">Payment Method</p>
                  <p className="text-white text-sm">{order.PaymentMethod || 'Not specified'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-white/30 text-xs uppercase tracking-wide mb-1">Address</p>
                  <p className="text-white text-sm">{order.Address || '-'}</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wide mb-1">Tracking Number</p>
                  <p className="text-white text-sm font-mono">
                    {order.TrackingNumber ? (
                      <span className="text-indigo-400">{order.TrackingNumber}</span>
                    ) : (
                      <span className="text-white/25">Pending</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wide mb-1">Status</p>
                  <p className="text-white text-sm">
                    {['Pending', 'Paid', 'Shipped', 'Delivered'][status]}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Order Items</h2>
              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0"
                  >
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.ProductImageURL ? (
                        <img src={item.ProductImageURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white/20 text-xl">P</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.ProductName}</p>
                      <p className="text-white/40 text-xs">Qty: {item.Number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-semibold">¥{(item.Price / 100).toFixed(2)}</p>
                      <p className="text-white/30 text-xs">
                        ¥{((item.Price * item.Number) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                <span className="text-white/60 text-sm">Total</span>
                <span className="text-white text-xl font-bold">¥{(total / 100).toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
