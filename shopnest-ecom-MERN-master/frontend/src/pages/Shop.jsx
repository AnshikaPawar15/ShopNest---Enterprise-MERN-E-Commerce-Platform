import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/product.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Filters
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [ratings, setRatings] = useState('');
  const [inStock, setInStock] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when other filters change
  useEffect(() => {
    setPage(1);
  }, [category, brand, minPrice, maxPrice, ratings, inStock, sortBy]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/api/products?page=${page}&limit=6&sortBy=${sortBy}`;
        if (debouncedSearch) url += `&keyword=${encodeURIComponent(debouncedSearch)}`;
        if (category) url += `&category=${encodeURIComponent(category)}`;
        if (brand) url += `&brand=${encodeURIComponent(brand)}`;
        if (minPrice) url += `&minPrice=${minPrice}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;
        if (ratings) url += `&ratings=${ratings}`;
        if (inStock) url += `&inStock=true`;

        const res = await fetch(url);
        const data = await res.json();
        
        // Handle paginated structure
        if (data && data.products) {
          setProducts(data.products);
          setPages(data.pages || 1);
          setTotal(data.total || 0);
        } else if (Array.isArray(data)) {
          // Fallback to array if API returns raw array
          setProducts(data);
          setPages(1);
          setTotal(data.length);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, debouncedSearch, category, brand, minPrice, maxPrice, ratings, inStock, sortBy]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setBrand('');
    setMinPrice('');
    setMaxPrice('');
    setRatings('');
    setInStock(false);
    setSortBy('newest');
    setPage(1);
  };

  // Styles
  const pageContainerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
    display: 'flex',
    gap: '30px',
    flexDirection: 'row',
  };

  const sidebarStyle = {
    width: '260px',
    background: '#18181b',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignSelf: 'flex-start',
  };

  const mainStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const filterSectionStyle = {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '15px',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    background: '#27272a',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const priceInputContainer = {
    display: 'flex',
    gap: '10px',
    marginTop: '8px',
  };

  const labelStyle = {
    fontSize: '0.85rem',
    color: '#a1a1aa',
    fontWeight: 'bold',
    marginBottom: '8px',
    display: 'block',
  };

  return (
    <div style={pageContainerStyle} className="shop-layout">
      {/* Sidebar Filters */}
      <aside style={sidebarStyle} className="shop-sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>Filters</h3>
          <button 
            onClick={handleClearFilters} 
            style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
          >
            Clear All
          </button>
        </div>

        {/* Categories */}
        <div style={filterSectionStyle}>
          <label style={labelStyle}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Clothing">Clothing</option>
          </select>
        </div>

        {/* Brands */}
        <div style={filterSectionStyle}>
          <label style={labelStyle}>Brand</label>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} style={selectStyle}>
            <option value="">All Brands</option>
            <option value="Generic">Generic</option>
            <option value="Sony">Sony</option>
            <option value="Bose">Bose</option>
            <option value="Canon">Canon</option>
            <option value="Nike">Nike</option>
          </select>
        </div>

        {/* Price Range */}
        <div style={filterSectionStyle}>
          <label style={labelStyle}>Price Range</label>
          <div style={priceInputContainer}>
            <input 
              type="number" 
              placeholder="Min" 
              value={minPrice} 
              onChange={(e) => setMinPrice(e.target.value)} 
              style={{ ...inputStyle, width: '50%' }} 
            />
            <input 
              type="number" 
              placeholder="Max" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(e.target.value)} 
              style={{ ...inputStyle, width: '50%' }} 
            />
          </div>
        </div>

        {/* Ratings */}
        <div style={filterSectionStyle}>
          <label style={labelStyle}>Minimum Rating</label>
          <select value={ratings} onChange={(e) => setRatings(e.target.value)} style={selectStyle}>
            <option value="">Any Rating</option>
            <option value="4">4★ & above</option>
            <option value="3">3★ & above</option>
            <option value="2">2★ & above</option>
          </select>
        </div>

        {/* Stock Availability */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="checkbox" 
            id="inStockCheck" 
            checked={inStock} 
            onChange={(e) => setInStock(e.target.checked)} 
            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
          />
          <label htmlFor="inStockCheck" style={{ color: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}>In Stock Only</label>
        </div>
      </aside>

      {/* Products list area */}
      <main style={mainStyle}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input 
              type="text" 
              placeholder="Search products by name or details..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, padding: '12px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Sort By:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...selectStyle, width: '160px' }}>
              <option value="newest">Latest Arrivals</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="ratings">Avg. Rating</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>

        {/* Results Banner */}
        <div style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
          Showing {products.length} products of {total} total items.
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0', color: '#a1a1aa' }}>
            Loading Products...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#a1a1aa' }}>
            No products found matching your search options.
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination Section */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
            <button 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)}
              style={{
                background: page === 1 ? '#27272a' : '#f97316',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              Previous
            </button>
            <span style={{ color: '#fff', alignSelf: 'center', fontSize: '0.95rem' }}>
              Page {page} of {pages}
            </span>
            <button 
              disabled={page === pages} 
              onClick={() => setPage(page + 1)}
              style={{
                background: page === pages ? '#27272a' : '#f97316',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: page === pages ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Shop;
