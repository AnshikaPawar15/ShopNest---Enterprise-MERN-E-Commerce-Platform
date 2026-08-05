import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, PlusCircle, AlertTriangle, Settings, RefreshCw, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Coupon state
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: '', discountType: 'percentage', discountValue: '', expiryDate: ''
  });

  // Bulk update state
  const [inventoryList, setInventoryList] = useState([]);
  const [bulkStockMap, setBulkStockMap] = useState({});
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setInventoryList(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      navigate('/');
      return;
    }

    const initDashboard = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchCoupons(), fetchInventory()]);
      setLoading(false);
    };

    initDashboard();
  }, [user, navigate]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(newCoupon)
      });
      if (res.ok) {
        alert('Coupon created successfully!');
        setNewCoupon({ code: '', discountType: 'percentage', discountValue: '', expiryDate: '' });
        fetchCoupons();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create coupon');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        alert('Coupon deleted');
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkStockChange = (productId, val) => {
    setBulkStockMap({
      ...bulkStockMap,
      [productId]: Number(val)
    });
  };

  const handleApplyBulkUpdate = async () => {
    setBulkUpdating(true);
    try {
      for (const prodId of Object.keys(bulkStockMap)) {
        const originalProduct = inventoryList.find(p => p._id === prodId);
        if (!originalProduct) continue;

        const body = {
          name: originalProduct.name,
          description: originalProduct.description,
          price: originalProduct.price,
          category: originalProduct.category,
          stock: bulkStockMap[prodId]
        };

        await fetch(`/api/products/${prodId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify(body)
        });
      }
      alert('Bulk stock update complete!');
      setBulkStockMap({});
      await fetchInventory();
      await fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setBulkUpdating(false);
    }
  };

  const exportCSV = (type) => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (type === 'products') {
      headers = ['ID', 'Name', 'Category', 'Brand', 'Price', 'Stock', 'Ratings'];
      rows = inventoryList.map(p => [p._id, p.name, p.category, p.brand || 'Generic', p.price, p.stock, p.ratings]);
      filename = 'inventory_export.csv';
    } else if (type === 'coupons') {
      headers = ['ID', 'Code', 'Type', 'Value', 'Expiry', 'Active'];
      rows = coupons.map(c => [c._id, c.code, c.discountType, c.discountValue, c.expiryDate, c.isActive]);
      filename = 'coupons_export.csv';
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Styles
  const cardStyle = {
    padding: '20px',
    background: '#18181b',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '8px',
  };

  const tabBtnStyle = (tab) => ({
    padding: '10px 20px',
    background: activeTab === tab ? '#f97316' : '#27272a',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s'
  });

  if (loading) return <div style={{ textAlign: 'center', margin: '100px', color: '#f97316' }}>Loading Dashboard Metrics...</div>;

  return (
    <div style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/ShopNestLogo.png" alt="Logo" style={{ height: '44px', width: '44px', borderRadius: '8px', objectFit: 'cover' }} />
          <h2 style={{ margin: 0 }}>Management Console</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/admin/add-product')} style={{ background: '#f97316', border: 'none', color: '#fff', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}><PlusCircle size={16} /> Add Product</button>
        </div>
      </div>

      <p style={{ color: '#a1a1aa', margin: '0 0 30px 0' }}>Welcome, <strong style={{ color: '#fff' }}>{user?.name}</strong> | Role: <span style={{ textTransform: 'capitalize', color: '#f97316', fontWeight: 'bold' }}>{user?.role}</span></p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
        <button onClick={() => setActiveTab('overview')} style={tabBtnStyle('overview')}>Overview</button>
        <button onClick={() => setActiveTab('inventory')} style={tabBtnStyle('inventory')}>Inventory</button>
        <button onClick={() => setActiveTab('coupons')} style={tabBtnStyle('coupons')}>Manage Coupons</button>
      </div>

      {activeTab === 'overview' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Key KPI Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            <div style={cardStyle}>
              <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Today's Sales</span>
              <strong style={{ fontSize: '1.8rem', color: '#f97316' }}>${stats.todaySales}</strong>
            </div>
            <div style={cardStyle}>
              <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Last 30 Days Sales</span>
              <strong style={{ fontSize: '1.8rem', color: '#f97316' }}>${stats.monthlySales}</strong>
            </div>
            <div style={cardStyle}>
              <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Total Revenue</span>
              <strong style={{ fontSize: '1.8rem', color: '#f97316' }}>${stats.totalRevenue}</strong>
            </div>
            <div style={cardStyle}>
              <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Total Orders</span>
              <strong style={{ fontSize: '1.8rem', color: '#fff' }}>{stats.totalOrders}</strong>
            </div>
            <div style={cardStyle}>
              <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Total Products</span>
              <strong style={{ fontSize: '1.8rem', color: '#fff' }}>{stats.totalProducts}</strong>
            </div>
          </div>

          {/* Sales Trend Visualizer Chart */}
          <div style={{ background: '#18181b', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#fff' }}>Weekly Sales Trends</h3>
            <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '20px', paddingBottom: '10px' }}>
              {stats.salesTrend.map((t, idx) => {
                const maxVal = Math.max(...stats.salesTrend.map(s => s.sales), 10);
                const pct = (t.sales / maxVal) * 100;
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.85rem', color: '#f97316', marginBottom: '5px' }}>${t.sales}</span>
                    <div style={{ width: '100%', height: `${pct}%`, background: 'linear-gradient(to top, #ea580c, #f97316)', borderRadius: '6px 6px 0 0', minHeight: '5px' }} />
                    <span style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '10px' }}>{t.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Grid: Low Stock Alert & Top Selling items */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
            
            {/* Low stock indicators */}
            <div style={{ background: '#18181b', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '20px' }}>
                <AlertTriangle size={18} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Low Stock Warnings ({stats.lowStockItems.length})</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.lowStockItems.length === 0 ? (
                  <p style={{ color: '#a1a1aa' }}>All products are sufficiently stocked.</p>
                ) : (
                  stats.lowStockItems.map(p => (
                    <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#27272a', borderRadius: '8px', fontSize: '0.9rem' }}>
                      <span>{p.name}</span>
                      <strong style={{ color: p.stock === 0 ? '#ef4444' : '#fbbf24' }}>
                        {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                      </strong>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Selling Items Table */}
            <div style={{ background: '#18181b', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem' }}>Top 5 Best Sellers</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', textAlign: 'left' }}>
                    <th style={{ padding: '8px 0' }}>Product</th>
                    <th style={{ padding: '8px 0', textAlign: 'right' }}>Qty Sold</th>
                    <th style={{ padding: '8px 0', textAlign: 'right' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ padding: '15px 0', color: '#a1a1aa', textAlign: 'center' }}>No sales records available yet.</td>
                    </tr>
                  ) : (
                    stats.topProducts.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '10px 0', color: '#fff' }}>{p.name}</td>
                        <td style={{ padding: '10px 0', textAlign: 'right' }}>{p.qty}</td>
                        <td style={{ padding: '10px 0', textAlign: 'right', color: '#f97316' }}>${p.revenue.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Stock Operations</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => exportCSV('products')} style={{ background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}><FileSpreadsheet size={16} /> Export CSV</button>
              <button 
                onClick={handleApplyBulkUpdate} 
                disabled={Object.keys(bulkStockMap).length === 0 || bulkUpdating}
                style={{ background: '#f97316', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={16} className={bulkUpdating ? 'spin' : ''} /> {bulkUpdating ? 'Saving...' : 'Apply Bulk Update'}
              </button>
            </div>
          </div>

          <div style={{ background: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', textAlign: 'left' }}>
                  <th style={{ padding: '12px 10px' }}>Product ID</th>
                  <th style={{ padding: '12px 10px' }}>Name</th>
                  <th style={{ padding: '12px 10px' }}>Category</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Current Stock</th>
                  <th style={{ padding: '12px 10px', width: '120px', textAlign: 'right' }}>Adjust Stock</th>
                </tr>
              </thead>
              <tbody>
                {inventoryList.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 10px', color: '#a1a1aa' }}>{p._id}</td>
                    <td style={{ padding: '12px 10px', color: '#fff', fontWeight: 'bold' }}>{p.name}</td>
                    <td style={{ padding: '12px 10px', color: '#a1a1aa' }}>{p.category}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', color: p.stock < 5 ? '#ef4444' : '#10b981' }}>{p.stock}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <input 
                        type="number" 
                        defaultValue={p.stock} 
                        onChange={(e) => handleBulkStockChange(p._id, e.target.value)}
                        style={{ width: '80px', padding: '6px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', textAlign: 'right' }} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          
          {/* Create Coupon Form */}
          <div style={{ background: '#18181b', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', height: 'fit-content' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#f97316' }}>Create New Coupon</h3>
            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#a1a1aa', display: 'block', marginBottom: '6px' }}>Coupon Code</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. SHOPNEST50" 
                  value={newCoupon.code} 
                  onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value})} 
                  style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#a1a1aa', display: 'block', marginBottom: '6px' }}>Discount Type</label>
                <select 
                  value={newCoupon.discountType} 
                  onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value})} 
                  style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="flat">Flat Cash Discount ($)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#a1a1aa', display: 'block', marginBottom: '6px' }}>Discount Value</label>
                <input 
                  type="number" 
                  required 
                  placeholder="Value (e.g. 15)" 
                  value={newCoupon.discountValue} 
                  onChange={(e) => setNewCoupon({...newCoupon, discountValue: e.target.value})} 
                  style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#a1a1aa', display: 'block', marginBottom: '6px' }}>Expiry Date</label>
                <input 
                  type="date" 
                  required 
                  value={newCoupon.expiryDate} 
                  onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})} 
                  style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', boxSizing: 'border-box' }}
                />
              </div>

              <button type="submit" style={{ background: '#f97316', border: 'none', color: '#fff', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}>
                Save Coupon
              </button>
            </form>
          </div>

          {/* Active Coupons List */}
          <div style={{ background: '#18181b', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Active Coupons ({coupons.length})</h3>
              <button onClick={() => exportCSV('coupons')} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Export CSV</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {coupons.length === 0 ? (
                <p style={{ color: '#a1a1aa' }}>No coupons created yet.</p>
              ) : (
                coupons.map(c => (
                  <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#27272a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <strong style={{ color: '#f97316', fontSize: '1.1rem' }}>{c.code}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '4px' }}>
                        Type: {c.discountType} | Value: {c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '2px' }}>
                        Expires: {new Date(c.expiryDate).toLocaleDateString()}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteCoupon(c._id)} 
                      style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
