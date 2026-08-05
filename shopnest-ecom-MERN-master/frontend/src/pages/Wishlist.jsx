import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCart } from '../redux/cartSlice';
import { removeFromWishlist } from '../redux/wishlistSlice';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

const Wishlist = () => {
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();

  const handleAddToCart = (product) => {
    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        qty: 1,
        stock: product.stock,
      })
    );
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '30px',
    marginTop: '30px',
  };

  const cardStyle = {
    background: '#18181b',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  };

  const imageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '12px',
  };

  const btnStyle = {
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
        <Heart fill="#f97316" color="#f97316" /> My Wishlist
      </h2>

      {wishlistItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#a1a1aa', fontSize: '1.2rem', marginBottom: '20px' }}>Your wishlist is empty!</p>
          <Link
            to="/shop"
            style={{
              display: 'inline-block',
              background: '#f97316',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div style={gridStyle}>
          {wishlistItems.map((product) => (
            <div key={product._id} style={cardStyle}>
              <button
                onClick={() => dispatch(removeFromWishlist(product._id))}
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ef4444',
                }}
                title="Remove from Wishlist"
              >
                <Trash2 size={18} />
              </button>
              <img src={product.imageUrl} alt={product.name} style={imageStyle} />
              <h3 style={{ fontSize: '1.1rem', margin: '15px 0 5px 0', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {product.name}
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '15px' }}>{product.brand || 'Generic'}</p>
              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f97316' }}>${product.price}</span>
                  <span style={{ color: product.stock > 0 ? '#10b981' : '#ef4444', fontSize: '0.85rem' }}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  style={{
                    ...btnStyle,
                    background: product.stock > 0 ? '#f97316' : '#27272a',
                    color: '#fff',
                  }}
                >
                  <ShoppingCart size={16} /> Add To Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
