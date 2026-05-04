import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

export default function CartPage({ userName, userId, onLogout, cart, addToCart }) {
  const [step, setStep] = useState('cart');
  const [address, setAddress] = useState({ name: '', phone: '', address: '' });
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderResult, setOrderResult] = useState(null);

  const PAYMENT_METHODS = [
    { key: 'credit', label: 'Credit Card', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', color: 'from-indigo-500 to-blue-600' },
    { key: 'debit', label: 'Debit Card', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', color: 'from-purple-500 to-pink-600' },
    { key: 'alipay', label: 'Alipay', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-blue-500 to-cyan-600' },
    { key: 'wechat', label: 'WeChat Pay', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'from-emerald-500 to-green-600' },
    { key: 'cod', label: 'Cash on Delivery', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', color: 'from-amber-500 to-orange-600' },
  ];
  const navigate = useNavigate();

  const updateQuantity = (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      addToCart(item, -item.quantity);
    } else {
      addToCart(item, delta);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 1500;
  const total = subtotal + shipping;

  const handleToAddress = () => {
    setError('');
    setStep('address');
  };

  const handleToPayment = () => {
    if (!address.name || !address.phone || !address.address) {
      setError('Please fill in all shipping information.');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      // Step 1: Checkout
      const checkoutRes = await axios.post('/api/checkout', {
        userId,
        items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
        shipping: {
          RecipientName: address.name,
          Phone: address.phone,
          Address: address.address,
          PaymentMethod: PAYMENT_METHODS.find((m) => m.key === paymentMethod)?.label || 'Credit Card',
        },
      });

      const orderId = checkoutRes.data.orderId;

      // Step 2: Simulate payment
      await axios.put(`/api/orders/${orderId}/pay`);

      setOrderResult({ orderId, total: total });
      setStep('confirmation');

      // Clear cart
      cart.forEach((item) => addToCart(item, -item.quantity));
    } catch (err) {
      console.error('[Cart] Checkout error:', err);
      if (err.response) {
        const msg = `[${err.response.status}] ${JSON.stringify(err.response.data)}`;
        console.error('[Cart] Response:', msg);
        const detail = err.response.data?.details || err.response.data?.error || msg;
        setError(detail);
      } else {
        setError('Cannot connect to server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Confirmation Screen ---
  if (step === 'confirmation' && orderResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <Navbar userName={userName} onLogout={onLogout} cartCount={0} />
        <main className="max-w-2xl mx-auto px-4 pt-32 pb-16 text-center">
          <div className="glass rounded-3xl p-12 shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-500/20">
              <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-white/50 mb-1">Order #{orderResult.orderId}</p>
            <p className="text-white/40 text-sm mb-1">
              Paid via <span className="text-white/70 font-medium">{PAYMENT_METHODS.find((m) => m.key === paymentMethod)?.label}</span>
            </p>
            <p className="text-white/40 text-sm mb-8">
              Total: <span className="text-white font-semibold">¥{(orderResult.total / 100).toFixed(2)}</span>
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate(`/order/${orderResult.orderId}`)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium text-sm hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
              >
                Track Order
              </button>
              <Link
                to="/productPage"
                className="inline-flex px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium text-sm hover:bg-white/10 transition-all"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- Main Cart View ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <Navbar userName={userName} onLogout={onLogout} cartCount={cart.reduce((s, i) => s + i.quantity, 0)} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {['Cart', 'Shipping', 'Payment'].map((s, i) => {
            const stepNum = i;
            const currentStep = step === 'cart' ? 0 : step === 'address' ? 1 : 2;
            const active = stepNum <= currentStep;
            const isCurrent = stepNum === currentStep;
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    active
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-white/5 text-white/20 border border-white/10'
                  }`}
                >
                  {stepNum + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${isCurrent ? 'text-white' : active ? 'text-indigo-400' : 'text-white/20'}`}>
                  {s}
                </span>
                {i < 2 && (
                  <div className={`w-8 sm:w-12 h-0.5 ${stepNum > i ? 'bg-indigo-500' : 'bg-white/10'}`} />
                )}
              </div>
            );
          })}
        </div>

        <h1 className="text-3xl font-bold text-white mb-10">
          {step === 'cart' ? 'Shopping Cart' : step === 'address' ? 'Shipping Information' : 'Payment'}
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl">
            <svg className="w-20 h-20 mx-auto text-white/10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-white/30 text-lg mb-6">Your cart is empty</p>
            <Link
              to="/productPage"
              className="inline-flex px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Cart Items or Address Form or Payment */}
            <div className="lg:col-span-2 space-y-4">
              {step === 'cart' &&
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="glass rounded-2xl p-4 sm:p-5 flex gap-4 items-center card-hover"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/5">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <span className="text-3xl opacity-20">📦</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.id}`} className="font-semibold text-white hover:text-indigo-400 transition-colors line-clamp-2">
                        {item.title}
                      </Link>
                      <p className="text-lg font-bold text-white mt-1">
                        ¥{(item.price / 100).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                      <button
                        onClick={() => updateQuantity(item, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 transition-colors font-medium"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-semibold text-sm text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 transition-colors font-medium"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

              {step === 'address' && (
                <div className="glass rounded-2xl p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-indigo-200 mb-1.5">Recipient Name</label>
                    <input
                      type="text"
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      placeholder="Full name"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-indigo-200 mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="Phone number"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-indigo-200 mb-1.5">Delivery Address</label>
                    <textarea
                      value={address.address}
                      onChange={(e) => setAddress({ ...address, address: e.target.value })}
                      placeholder="Full delivery address"
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {step === 'payment' && (
                <div className="space-y-4">
                  {/* Payment method selection */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
                    <div className="space-y-2">
                      {PAYMENT_METHODS.map((pm) => (
                        <button
                          key={pm.key}
                          onClick={() => setPaymentMethod(pm.key)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                            paymentMethod === pm.key
                              ? 'border-indigo-500 bg-indigo-500/10'
                              : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${pm.color} flex items-center justify-center flex-shrink-0`}>
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={pm.icon} />
                            </svg>
                          </div>
                          <span className={`text-sm font-medium ${paymentMethod === pm.key ? 'text-white' : 'text-white/60'}`}>
                            {pm.label}
                          </span>
                          {paymentMethod === pm.key && (
                            <svg className="w-5 h-5 text-indigo-400 ml-auto" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Order review */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Order Review</h3>
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-white/70">
                            {item.title} <span className="text-white/30">×{item.quantity}</span>
                          </span>
                          <span className="text-white font-medium">¥{((item.price * item.quantity) / 100).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
                      <div className="flex justify-between text-sm text-white/50">
                        <span>Subtotal</span>
                        <span>¥{(subtotal / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-white/50">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? 'Free' : `¥${(shipping / 100).toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-white/10">
                        <span>Total</span>
                        <span>¥{(total / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping info */}
                  <div className="glass rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-white/50 text-sm font-medium">Deliver to</span>
                    </div>
                    <p className="text-white text-sm font-medium ml-6">{address.name}</p>
                    <p className="text-white/40 text-xs ml-6">{address.phone}</p>
                    <p className="text-white/40 text-xs ml-6">{address.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Summary & Actions */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-6 sticky top-24">
                <h3 className="font-bold text-white mb-4 text-lg">
                  {step === 'cart' ? 'Order Summary' : step === 'address' ? 'Shipping Info' : 'Confirm & Pay'}
                </h3>

                {step === 'cart' && (
                  <>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-white/50">
                        <span>Subtotal</span>
                        <span>¥{(subtotal / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white/50">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? 'Free' : `¥${(shipping / 100).toFixed(2)}`}</span>
                      </div>
                      <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-bold text-white">
                        <span>Total</span>
                        <span>¥{(total / 100).toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleToAddress}
                      className="w-full mt-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
                    >
                      Proceed to Checkout
                    </button>
                  </>
                )}

                {step === 'address' && (
                  <>
                    <p className="text-white/40 text-sm mb-4">Fill in your delivery details on the left, then continue.</p>
                    <button
                      onClick={handleToPayment}
                      className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
                    >
                      Continue to Payment
                    </button>
                    <button
                      onClick={() => { setStep('cart'); setError(''); }}
                      className="w-full mt-2 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl text-sm hover:bg-white/10 transition-all"
                    >
                      Back to Cart
                    </button>
                  </>
                )}

                {step === 'payment' && (
                  <>
                    {error && (
                      <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 text-red-400 text-sm">
                        {error}
                      </div>
                    )}
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-4">
                      <p className="text-white/30 text-xs mb-1">Paying with</p>
                      <p className="text-white text-sm font-medium">
                        {PAYMENT_METHODS.find((m) => m.key === paymentMethod)?.label}
                      </p>
                    </div>
                    <button
                      onClick={handlePay}
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Pay ¥{(total / 100).toFixed(2)}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => { setStep('address'); setError(''); }}
                      className="w-full mt-2 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl text-sm hover:bg-white/10 transition-all"
                    >
                      Back
                    </button>
                    <p className="text-white/20 text-xs text-center mt-3">
                      Demo payment — no real charges
                    </p>
                  </>
                )}

                <Link
                  to="/productPage"
                  className="block text-center mt-3 text-sm text-white/30 hover:text-indigo-400 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
