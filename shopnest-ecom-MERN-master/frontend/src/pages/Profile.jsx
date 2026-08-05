import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Trash2, ShieldAlert, CheckCircle, FileText } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Address form state
  const [addresses, setAddresses] = useState([]);
  const [newAddr, setNewAddr] = useState({
    fullName: '', street: '', city: '', postalCode: '', country: '', isDefault: false
  });

  const fetchMyOrders = async () => {
    try {
      const res = await fetch('/api/orders/myorders', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(Array.isArray(data) ? data : []);
      } else {
        if (res.status === 401) {
          logout();
          navigate('/login');
        }
        setOrders([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/auth/addresses', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyOrders();
    fetchAddresses();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(newAddr)
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
        setNewAddr({ fullName: '', street: '', city: '', postalCode: '', country: '', isDefault: false });
        alert('Address added successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await fetch(`/api/auth/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        alert('Order cancelled successfully.');
        fetchMyOrders();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReturnOrder = async (orderId) => {
    if (!window.confirm('Request return for this delivered order?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        alert('Return request submitted.');
        fetchMyOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert('Could not download invoice');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderTimeline = (status) => {
    const steps = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
    
    if (status === 'Cancelled') {
      return (
        <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>
          <ShieldAlert size={16} /> Order Cancelled
        </div>
      );
    }
    if (status === 'Returned') {
      return (
        <div style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>
          <CheckCircle size={16} /> Order Returned (Refund Pending)
        </div>
      );
    }

    const currentIndex = steps.indexOf(status);

    return (
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px', alignItems: 'center' }}>
        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: '12px',
                background: isCurrent ? '#f97316' : isDone ? 'rgba(16,185,129,0.15)' : '#27272a',
                color: isCurrent ? '#fff' : isDone ? '#10b981' : '#71717a',
                fontWeight: 'bold',
                border: isCurrent ? '1px solid #f97316' : '1px solid transparent'
              }}>
                {step}
              </span>
              {idx < steps.length - 1 && <span style={{ color: '#3f3f46' }}>➔</span>}
            </div>
          );
        })}
      </div>
    );
  };

  const containerStyle = { maxWidth: '1000px', margin: '40px auto', padding: '30px', background: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', color: '#fafafa' };
  const badgeStyle = { background: 'rgba(249,115,22,0.1)', color: '#f97316', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-block' };

  if (!user) return null;

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '30px', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: '2.2rem', marginBottom: '10px' }}>My Profile</h2>
          <p style={{ color: '#a1a1aa', fontSize: '1.2rem', marginBottom: '5px' }}><strong>Name:</strong> {user.name}</p>
          <p style={{ color: '#a1a1aa', fontSize: '1.2rem', marginBottom: '15px' }}><strong>Email:</strong> {user.email}</p>
          <span style={badgeStyle}>Account Type: {user.role.toUpperCase()}</span>
        </div>
        <button onClick={handleLogout} className="btn" style={{ background: '#ef4444', boxShadow: 'none' }}>Logout</button>
      </div>

      {/* Address Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '40px' }}>
        <div>
          <h3 style={{ color: '#f97316', marginBottom: '20px' }}>Address Book</h3>
          {addresses.length === 0 ? (
            <p style={{ color: '#a1a1aa' }}>No saved addresses yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {addresses.map((a) => (
                <div key={a._id} style={{ padding: '15px', background: '#09090b', borderRadius: '8px', border: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{a.fullName}</strong> {a.isDefault && <span style={{ color: '#f97316', fontSize: '0.75rem' }}>(Default)</span>}<br/>
                    <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>{a.street}, {a.city}, {a.postalCode}, {a.country}</span>
                  </div>
                  <button onClick={() => handleDeleteAddress(a._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Address Form */}
        <form onSubmit={handleAddAddress} style={{ background: '#09090b', padding: '20px', borderRadius: '12px', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ margin: 0, color: '#fff' }}>Add New Address</h4>
          <input type="text" required placeholder="Full Name" value={newAddr.fullName} onChange={(e) => setNewAddr({...newAddr, fullName: e.target.value})} style={{ padding: '8px 12px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
          <input type="text" required placeholder="Street Address" value={newAddr.street} onChange={(e) => setNewAddr({...newAddr, street: e.target.value})} style={{ padding: '8px 12px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
          <input type="text" required placeholder="City" value={newAddr.city} onChange={(e) => setNewAddr({...newAddr, city: e.target.value})} style={{ padding: '8px 12px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
          <input type="text" required placeholder="Postal Code" value={newAddr.postalCode} onChange={(e) => setNewAddr({...newAddr, postalCode: e.target.value})} style={{ padding: '8px 12px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
          <input type="text" required placeholder="Country" value={newAddr.country} onChange={(e) => setNewAddr({...newAddr, country: e.target.value})} style={{ padding: '8px 12px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#a1a1aa' }}>
            <input type="checkbox" checked={newAddr.isDefault} onChange={(e) => setNewAddr({...newAddr, isDefault: e.target.checked})} />
            Set as default address
          </label>

          <button type="submit" style={{ background: '#f97316', border: 'none', color: '#fff', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Address</button>
        </form>
      </div>

      {/* Orders list */}
      <h3 style={{ color: '#f97316', marginBottom: '20px', fontSize: '1.5rem' }}>Order History</h3>
      {loading ? (
        <p style={{ color: '#a1a1aa' }}>Fetching your orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ background: '#09090b', padding: '30px', borderRadius: '8px', textAlign: 'center', border: '1px solid #27272a' }}>
          <p style={{ color: '#a1a1aa', marginBottom: '15px' }}>You haven't placed any orders yet.</p>
          <Link to="/shop" className="btn">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div key={order._id} style={{ background: '#09090b', padding: '20px', borderRadius: '12px', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                <div>
                  <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: '0 0 4px 0' }}>Order ID: <span style={{ color: '#fff', fontWeight: 'bold' }}>{order._id}</span></p>
                  <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: 0 }}>Placed On: <span style={{ color: '#fff' }}>{new Date(order.createdAt).toLocaleDateString()}</span></p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: '0 0 4px 0' }}>Total Amount</p>
                  <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>${order.totalAmount.toFixed(2)}</strong>
                </div>
              </div>

              {/* Status Tracker timeline */}
              <div>
                <span style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'block', marginBottom: '5px' }}>Tracking Status</span>
                {renderTimeline(order.status)}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                <button 
                  onClick={() => handleDownloadInvoice(order._id)}
                  style={{
                    background: '#27272a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}
                >
                  <FileText size={16} /> Invoice PDF
                </button>

                {(order.status === 'Placed' || order.status === 'Confirmed') && (
                  <button 
                    onClick={() => handleCancelOrder(order._id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}
                  >
                    Cancel Order
                  </button>
                )}

                {order.status === 'Delivered' && (
                  <button 
                    onClick={() => handleReturnOrder(order._id)}
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid #f59e0b',
                      color: '#f59e0b',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}
                  >
                    Return Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
