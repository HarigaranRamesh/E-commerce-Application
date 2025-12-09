import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../../Context/CartContext";
import { toast } from "react-hot-toast";
import "./Cart.css";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } =
    useContext(CartContext);

  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty 🛒");
      return;
    }

    // Redirect to checkout page and pass cart data
    navigate("/checkout", { state: { cart } });
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    toast("Removed from Cart", {
      icon: "❌",
    });
  };

  const handleClearCart = () => {
    if (cart.length === 0) {
      toast.error("Cart is already empty!");
      return;
    }
    clearCart();
    toast.success("Cart cleared 🗑️");
  };

  return (
    <div className="cart-page">
      <h2>Shopping Cart</h2>
      {cart.length === 0 ? (
        <div className="empty-cart-state" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🛒</div>
          <h3>Your cart is empty</h3>
          <p style={{ marginBottom: "30px" }}>Looks like you haven't added anything yet.</p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "12px 30px",
              background: "#01579b",
              color: "white",
              border: "none",
              borderRadius: "50px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(1, 87, 155, 0.3)"
            }}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          <ul>
            {cart.map((item) => (
              <li key={item.itemKey} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-image" />
                <div className="cart-details">
                  <h3>{item.name}</h3>
                  {item.size && <p className="item-size">Size: {item.size}</p>}
                  <p>₹{item.price}</p>

                  <div className="quantity-control">
                    <button
                      onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(item.itemKey)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <h3>Total: ₹{getTotalPrice()}</h3>
          <button className="clear-cart" onClick={handleClearCart}>
            Clear Cart
          </button>
          <button className="checkout-button" onClick={handleCheckout}>
            Checkout
          </button>
        </>
      )}
    </div>
  );
};

export default CartPage;
