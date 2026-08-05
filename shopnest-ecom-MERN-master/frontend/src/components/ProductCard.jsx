import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../redux/wishlistSlice';
import { Heart, Star } from 'lucide-react';
import '../styles/product.css';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const isWishlisted = wishlistItems.some((x) => x._id === product._id);

  const toggleWishlist = (e) => {
    e.preventDefault();
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  return (
    <div className="product-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <button
        onClick={toggleWishlist}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(24, 24, 27, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isWishlisted ? '#f97316' : '#fff',
          zIndex: 10,
          transition: 'all 0.3s ease'
        }}
        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <Heart size={18} fill={isWishlisted ? '#f97316' : 'none'} />
      </button>
      
      <img src={product.imageUrl} alt={product.name} className="product-image" />
      
      <div className="product-info">
        <p style={{ color: '#a1a1aa', fontSize: '0.8rem', margin: '0 0 5px 0' }}>{product.brand || 'Generic'}</p>
        <h3 style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', margin: '0 0 8px 0' }}>{product.name}</h3>
        
        {/* Rating stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
          <Star size={14} fill="#fbbf24" color="#fbbf24" />
          <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>{product.ratings?.toFixed(1) || '0.0'}</span>
          <span style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>({product.numReviews || 0})</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <span className="price" style={{ margin: 0 }}>${product.price}</span>
          <Link to={`/product/${product._id}`} className="btn" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Details</Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
