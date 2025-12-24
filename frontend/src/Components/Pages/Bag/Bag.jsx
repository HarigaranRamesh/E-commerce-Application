import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../../Context/CartContext";
import { AuthContext } from "../../../Context/AuthContext";
import { toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";
import "./Bag.css";

const Bag = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate("/checkout", { state: { cart } });
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    toast.success("Removed from bag");
  };

  return (
    <div className="bag-page">
      <div className="bag-header">
        <h1 className="bag-title">SHOPPING BAG</h1>
      </div>

      <div className="promo-banner">
        NEED A GIFT? PICK UP IN-STORE TODAY WHEN YOU ORDER BY 1PM ET.
      </div>

      {cart.length === 0 ? (
        /* EMPTY STATE */
        <div className="bag-empty-grid">
          <div className="empty-message">
            <h3>YOUR SHOPPING BAG IS EMPTY.</h3>
            {!user && <p>Sign in to save or access saved items in your shopping bag.</p>}
          </div>

          <div className="bag-sidebar">
            <div className="summary-section">
              <div className="summary-row" style={{ marginBottom: '1rem' }}>
                <span>DISCOUNTS</span>
                <span className="summary-link">ADD</span>
              </div>
              <div className="summary-row" style={{ marginTop: '2rem', fontWeight: 700 }}>
                <span>TOTAL</span>
                <div></div> {/* Total hidden when empty */}
              </div>
            </div>

            <button className="checkout-btn-disabled" disabled>
              CONTINUE TO CHECKOUT
            </button>

            {!user && (
              <button className="signin-btn" onClick={() => navigate('/login')}>
                SIGN IN
              </button>
            )}

            {/* Klarna text removed */}
          </div>
        </div>
      ) : (
        /* ACTIVE CART STATE */
        <div className="active-cart-grid">
          <div className="cart-items-section">
            <ul className="cart-items-list">
              {cart.map((item) => (
                <li key={item.itemKey} className="cart-item">
                  <div className="item-image-col">
                    <img src={item.image} alt={item.name} className="cart-image" />
                  </div>
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <div className="item-meta">Size: {item.size || 'N/A'}</div>
                    <div className="item-meta">Art. no. 0987654321</div>
                    <div className="item-meta">Total: ₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>

                    <div className="quantity-controls">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="item-price-col">
                    <button className="remove-link" onClick={() => handleRemove(item.itemKey)}>
                      <Trash2 size={16} style={{ marginRight: '4px' }} />
                      Remove
                    </button>
                    <div>₹{item.price.toLocaleString("en-IN")}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bag-sidebar">
            <div className="summary-section">
              <div className="summary-row" style={{ marginBottom: '1rem' }}>
                <span>DISCOUNTS</span>
                <span className="summary-link">ADD</span>
              </div>
              <div className="summary-row">
                <span>Order value</span>
                <span>₹{getTotalPrice().toLocaleString("en-IN")}</span>
              </div>
              <div className="summary-row" style={{ marginTop: '1rem', fontWeight: 700, fontSize: '1.2rem' }}>
                <span>TOTAL</span>
                <span>₹{getTotalPrice().toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              className="checkout-btn-black"
              onClick={handleCheckout}
            >
              CONTINUE TO CHECKOUT
            </button>

            {/* Klarna text removed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Bag;
