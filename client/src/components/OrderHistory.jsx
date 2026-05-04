import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar.jsx';

const STATUS_MAP = {
  0: { label: 'Pending', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  1: { label: 'Paid', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  2: { label: 'Shipped', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  3: { label: 'Delivered', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
};

const statusBadge = (status) => {
  const s = STATUS_MAP[status] || STATUS_MAP[0];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.color}`}>
      {s.label}
    </span>
  );
};

export default function OrderHistory({ userId, userName, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    axios
      .get('/api/orders', { params: { userId } })
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [userId]);

  const totalForOrder = (order) => {
    if (!order.items) return 0;
    return order.items.reduce((sum, it) => sum + it.Price * it.Number, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <Navbar userName={userName} onLogout={onLogout} cartCount={0} />

      <div className="max-w-4xl mx-auto px-4 pt-28 pb-16">
        <h1 className="text-3xl font-bold text-white mb-8">My Orders</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-white/50 text-lg">No orders yet</p>
            <Link to="/productPage" className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 transition-colors text-sm">
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.OrderID}
                onClick={() => navigate(`/order/${order.OrderID}`)}
                className="glass rounded-xl p-5 cursor-pointer hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold text-sm">
                      Order #{order.OrderID}
                    </span>
                    {statusBadge(order.ShippingStatus != null ? order.ShippingStatus : 0)}
                  </div>
                  <span className="text-white/40 text-xs">
                    {new Date(order.OrderDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {order.items?.slice(0, 4).map((item, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white/40 text-[10px] overflow-hidden"
                        title={item.ProductName}
                      >
                        {item.ProductImageURL ? (
                          <img src={item.ProductImageURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          item.ProductName?.charAt(0) || 'P'
                        )}
                      </div>
                    ))}
                    {(order.items?.length || 0) > 4 && (
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-xs">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/50 text-xs truncate">
                      {order.items?.map((it) => it.ProductName).join(', ')}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-semibold text-sm">
                      ¥{(totalForOrder(order) / 100).toFixed(2)}
                    </p>
                    <svg className="w-4 h-4 text-white/20 inline-block group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
