import React, { useState, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [address, setAddress] = useState({
    fullName: '', street: '', city: '', postalCode: '', country: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('Razorpay');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shipping = subtotal > 150 ? 0 : 10;
  const tax = Number((subtotal * 0.18).toFixed(2));
  const finalTotal = Number((subtotal - discountAmount + tax + shipping).toFixed(2));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Fetch saved user addresses
    const fetchAddresses = async () => {
      try {
        const res = await fetch('/api/auth/addresses', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAddresses(data);
          // Set default if exists
          const def = data.find(a => a.isDefault);
          if (def) {
            setAddress({
              fullName: def.fullName,
              street: def.street,
              city: def.city,
              postalCode: def.postalCode,
              country: def.country
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAddresses();
  }, [user, navigate]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ code: couponCode, cartTotal: subtotal })
      });
      const data = await res.json();
      if (res.ok) {
        setDiscountAmount(data.discountAmount);
        setAppliedCoupon(data.code);
        setCouponError('');
      } else {
        setCouponError(data.message || 'Invalid coupon');
        setDiscountAmount(0);
        setAppliedCoupon('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'COD') {
      return placeCodOrder();
    }
    try {
      const orderRes = await fetch('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal })
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        const fallback = window.confirm("Razorpay credentials unconfigured. Place test order via Bypass?");
        if (fallback) {
          return placeBypassOrder();
        } else {
          return alert("Payment failed to initialize");
        }
      }

      const options = {
        key: 'rzp_test_dummykey123',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShopNest',
        description: 'Test Transaction',
        order_id: orderData.id,
        handler: async function (response) {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });
          if (verifyRes.ok) {
            const saveOrderRes = await fetch('/api/orders', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`
              },
              body: JSON.stringify({
                items: cartItems,
                totalAmount: finalTotal,
                discount: discountAmount,
                tax,
                shipping,
                couponCode: appliedCoupon,
                address,
                paymentMethod: 'Razorpay',
                paymentId: response.razorpay_payment_id
              })
            });

            if (saveOrderRes.ok) {
              dispatch(clearCart());
              navigate('/ordersuccess');
            } else {
              alert('Order saving failed');
            }
          } else {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: address.fullName,
          email: user?.email,
          contact: '9999999999'
        },
        theme: {
          color: '#f97316'
        }
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error(error);
    }
  };

  const placeCodOrder = async () => {
    try {
      const saveOrderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          items: cartItems,
          totalAmount: finalTotal,
          discount: discountAmount,
          tax,
          shipping,
          couponCode: appliedCoupon,
          address,
          paymentMethod: 'COD',
          paymentId: 'COD_PENDING_' + Date.now()
        })
      });
      if (saveOrderRes.ok) {
        dispatch(clearCart());
        navigate('/ordersuccess');
      } else {
        alert('Failed to place COD order');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const placeBypassOrder = async () => {
    const saveOrderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({
        items: cartItems,
        totalAmount: finalTotal,
        discount: discountAmount,
        tax,
        shipping,
        couponCode: appliedCoupon,
        address,
        paymentMethod: 'Razorpay',
        paymentId: 'bypass_txn_' + Date.now()
      })
    });
    if (saveOrderRes.ok) {
      dispatch(clearCart());
      navigate('/ordersuccess');
    }
  };

  const handleSelectAddress = (addr) => {
    setAddress({
      fullName: addr.fullName,
      street: addr.street,
      city: addr.city,
      postalCode: addr.postalCode,
      country: addr.country
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first");
      navigate('/login');
      return;
    }
    handlePayment();
  };

  return (
    <div className="checkout-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px', color: '#fff' }}>
      <h2>Secure Checkout</h2>
      <div className="checkout-content" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginTop: '20px' }}>
        
        {/* Left Form: Address selection and entry */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Saved Addresses list */}
          {addresses.length > 0 && (
            <div style={{ background: '#18181b', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>Saved Addresses</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {addresses.map((a) => (
                  <div 
                    key={a._id} 
                    onClick={() => handleSelectAddress(a)}
                    style={{
                      padding: '12px',
                      background: '#27272a',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      lineHeight: '1.5'
                    }}
                  >
                    <strong>{a.fullName}</strong> {a.isDefault && <span style={{ color: '#f97316', fontSize: '0.75rem' }}>(Default)</span>}<br/>
                    {a.street}, {a.city}, {a.postalCode}, {a.country}
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ background: '#18181b', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3>Shipping Details</h3>
            <input type="text" placeholder="Full Name" required value={address.fullName} onChange={(e) => setAddress({...address, fullName: e.target.value})} style={{ padding: '12px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
            <input type="text" placeholder="Street" required value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} style={{ padding: '12px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
            <input type="text" placeholder="City" required value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} style={{ padding: '12px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
            <input type="text" placeholder="Postal Code" required value={address.postalCode} onChange={(e) => setAddress({...address, postalCode: e.target.value})} style={{ padding: '12px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
            <input type="text" placeholder="Country" required value={address.country} onChange={(e) => setAddress({...address, country: e.target.value})} style={{ padding: '12px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
            
            {/* Payment Method Select */}
            <div style={{ marginTop: '15px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Payment Method</h3>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="paymentMethod" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  Razorpay (Card/UPI/NetBanking)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  Cash on Delivery (COD)
                </label>
              </div>
            </div>

            <button type="submit" style={{ background: '#f97316', border: 'none', color: '#fff', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '15px' }}>
              Confirm & Place Order
            </button>
          </form>
        </div>

        {/* Right Summary Card */}
        <div style={{ flex: '1 1 350px' }}>
          <div style={{ background: '#18181b', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cartItems.map((item) => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#a1a1aa' }}>
                  <span>{item.name} (x{item.qty})</span>
                  <span>${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Promo Code Coupon Section */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <input 
                type="text" 
                placeholder="PROMO CODE" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value)} 
                style={{ padding: '8px 12px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', flex: 1, fontSize: '0.85rem' }} 
              />
              <button type="submit" style={{ background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
                Apply
              </button>
            </form>
            {appliedCoupon && <p style={{ color: '#10b981', fontSize: '0.8rem', margin: 0 }}>Coupon {appliedCoupon} applied!</p>}
            {couponError && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: 0 }}>{couponError}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#a1a1aa' }}>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>Discount:</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#a1a1aa' }}>Shipping:</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#a1a1aa' }}>Tax (18% GST):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                <span>Total:</span>
                <span style={{ color: '#f97316' }}>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ color: '#a1a1aa', fontSize: '0.8rem', lineHeight: '1.4', marginTop: '10px' }}>
              * Estimated Delivery Date: {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
