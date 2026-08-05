import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Star, Trash2, Edit, ShoppingCart } from 'lucide-react';
import '../styles/product.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingComment, setEditingComment] = useState('');
  const [editingRating, setEditingRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeImg, setActiveImg] = useState('');

  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
        setActiveImg(data.imageUrl);

        // Fetch Reviews
        const reviewsRes = await fetch(`/api/products/${id}/reviews`);
        const reviewsData = await reviewsRes.json();
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);

        // Fetch Related Products
        const relatedRes = await fetch(`/api/products/${id}/related`);
        const relatedData = await relatedRes.json();
        setRelated(Array.isArray(relatedData) ? relatedData : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(
        addToCart({
          productId: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          qty: 1,
          stock: product.stock
        })
      );
      alert('Successfully added to your cart!');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();
      if (res.ok) {
        setReviews([...reviews, { ...data, userId: { _id: user._id, name: user.name } }]);
        setComment('');
        setRating(5);
        alert('Review submitted successfully!');
        
        // Refresh product stats
        const prodRes = await fetch(`/api/products/${id}`);
        const prodData = await prodRes.json();
        setProduct(prodData);
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/products/${id}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      if (res.ok) {
        setReviews(reviews.filter((r) => r._id !== reviewId));
        alert('Review deleted.');
        
        // Refresh product stats
        const prodRes = await fetch(`/api/products/${id}`);
        const prodData = await prodRes.json();
        setProduct(prodData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/products/${id}/reviews/${editingReviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ rating: editingRating, comment: editingComment })
      });
      const data = await res.json();
      if (res.ok) {
        setReviews(reviews.map((r) => (r._id === editingReviewId ? { ...r, rating: editingRating, comment: editingComment } : r)));
        setEditingReviewId(null);
        alert('Review updated.');
        
        // Refresh product stats
        const prodRes = await fetch(`/api/products/${id}`);
        const prodData = await prodRes.json();
        setProduct(prodData);
      } else {
        alert(data.message || 'Failed to update review');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', margin: '100px', color: '#f97316' }}>Loading Product Details...</div>;
  if (!product) return <div style={{ textAlign: 'center', margin: '100px', color: '#ef4444' }}>Product Not Found</div>;

  return (
    <div className="product-detail-wrapper" style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
      
      {/* Breadcrumbs */}
      <div style={{ color: '#a1a1aa', marginBottom: '20px', fontSize: '0.9rem' }}>
        <Link to="/" style={{ color: '#f97316', textDecoration: 'none' }}>Home</Link> /{' '}
        <Link to="/shop" style={{ color: '#f97316', textDecoration: 'none' }}>Shop</Link> /{' '}
        <span style={{ color: '#a1a1aa' }}>{product.category}</span> /{' '}
        <span style={{ color: '#fff' }}>{product.name}</span>
      </div>

      {/* Main product display */}
      <div className="product-detail" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* Left Side: Images */}
        <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', overflow: 'hidden', background: '#18181b', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <img 
              src={activeImg} 
              alt={product.name} 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'transform 0.3s ease', cursor: 'zoom-in' }} 
              onMouseMove={(e) => {
                const { left, top, width, height } = e.target.getBoundingClientRect();
                const x = ((e.clientX - left) / width) * 100;
                const y = ((e.clientY - top) / height) * 100;
                e.target.style.transformOrigin = `${x}% ${y}%`;
                e.target.style.transform = 'scale(1.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            />
          </div>
          
          {/* Thumbnails Gallery */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <img 
              src={product.imageUrl} 
              alt="thumbnail 1" 
              onClick={() => setActiveImg(product.imageUrl)} 
              style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: activeImg === product.imageUrl ? '2px solid #f97316' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
            />
            {/* Mocking secondary images */}
            <img 
              src="https://images.unsplash.com/photo-1484704849700-f032a568e944?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300" 
              alt="thumbnail 2" 
              onClick={() => setActiveImg("https://images.unsplash.com/photo-1484704849700-f032a568e944?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300")} 
              style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: activeImg === "https://images.unsplash.com/photo-1484704849700-f032a568e944?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300" ? '2px solid #f97316' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Right Side: Details */}
        <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <span style={{ color: '#f97316', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 'bold' }}>{product.brand || 'Generic'}</span>
          <h2 style={{ fontSize: '2.5rem', color: '#fff', margin: 0 }}>{product.name}</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} fill={s <= Math.round(product.ratings || 0) ? '#fbbf24' : 'none'} color="#fbbf24" />
              ))}
            </div>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>{product.ratings?.toFixed(1) || '0.0'}</span>
            <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>({product.numReviews} user reviews)</span>
          </div>

          <p style={{ fontSize: '2rem', color: '#f97316', fontWeight: 'bold', margin: 0 }}>${product.price.toFixed(2)}</p>
          
          <div>
            <h4 style={{ color: '#fff', marginBottom: '8px' }}>Description</h4>
            <p style={{ color: '#a1a1aa', lineHeight: '1.6', margin: 0 }}>{product.description}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
            <button 
              onClick={handleAddToCart} 
              disabled={product.stock <= 0}
              style={{
                background: product.stock > 0 ? '#f97316' : '#27272a',
                color: '#fff',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s'
              }}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
          </div>

          <p style={{ color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '0.9rem', margin: 0 }}>
            {product.stock > 0 ? `● In Stock (${product.stock} left)` : `● Out of Stock`}
          </p>
        </div>
      </div>

      {/* Review Management Blocks */}
      <section style={{ marginTop: '50px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '30px' }}>
        <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '20px' }}>Customer Reviews ({reviews.length})</h3>

        {/* Add / Edit Form */}
        {user ? (
          editingReviewId ? (
            <form onSubmit={handleReviewUpdate} style={{ background: '#18181b', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '30px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#fff' }}>Edit Your Review</h4>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => setEditingRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Star size={24} fill={star <= editingRating ? '#fbbf24' : 'none'} color="#fbbf24" />
                  </button>
                ))}
              </div>
              <textarea 
                value={editingComment} 
                onChange={(e) => setEditingComment(e.target.value)} 
                rows="4" 
                placeholder="Update your feedback..." 
                style={{ width: '100%', padding: '12px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', marginBottom: '15px', resize: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ background: '#f97316', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                <button type="button" onClick={() => setEditingReviewId(null)} style={{ background: '#27272a', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReviewSubmit} style={{ background: '#18181b', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '30px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#fff' }}>Leave a Review</h4>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => setRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Star size={24} fill={star <= rating ? '#fbbf24' : 'none'} color="#fbbf24" />
                  </button>
                ))}
              </div>
              <textarea 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
                rows="3" 
                placeholder="Share your thoughts about this product..." 
                style={{ width: '100%', padding: '12px', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', marginBottom: '15px', resize: 'none', boxSizing: 'border-box' }}
              />
              <button type="submit" disabled={submittingReview} style={{ background: '#f97316', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )
        ) : (
          <p style={{ color: '#a1a1aa', margin: '0 0 30px 0' }}>Please <Link to="/login" style={{ color: '#f97316' }}>Login</Link> to write a product review.</p>
        )}

        {/* Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reviews.length === 0 ? (
            <p style={{ color: '#a1a1aa', margin: 0 }}>No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} style={{ background: '#18181b', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{rev.userId?.name || rev.name}</span>
                  <span style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} fill={s <= rev.rating ? '#fbbf24' : 'none'} color="#fbbf24" />
                  ))}
                </div>

                <p style={{ color: '#d4d4d8', margin: '5px 0 0 0', fontSize: '0.95rem' }}>{rev.comment}</p>

                {/* Edit / Delete Options */}
                {user && rev.userId?._id === user._id && (
                  <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <button 
                      onClick={() => {
                        setEditingReviewId(rev._id);
                        setEditingComment(rev.comment);
                        setEditingRating(rev.rating);
                      }} 
                      style={{ background: 'none', border: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => handleReviewDelete(rev._id)} 
                      style={{ background: 'none', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products Section */}
      {related.length > 0 && (
        <section style={{ marginTop: '60px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '30px' }}>
          <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '25px' }}>Related Products</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }}>
            {related.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
