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

  const handleRemove = (id, name) => {
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
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cart.map((item) => (
              <li key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-image" />
                <div>
                  <h3>{item.name}</h3>
                  <p>₹{item.price}</p>

                  <div className="quantity-control">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(item.id, item.name)}
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
