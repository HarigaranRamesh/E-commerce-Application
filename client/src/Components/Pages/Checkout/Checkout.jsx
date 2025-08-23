import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "./Checkout.css";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cart = location.state?.cart || [];

  const totalAmount = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    toast.success(`Order placed successfully! Total: ₹${totalAmount}`);
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="checkout-list">
            {cart.map((item) => (
              <li key={item.id} className="checkout-item">
                <img
                  src={item.image}
                  alt={item.name}
                  className="checkout-image"
                />
                <div className="checkout-details">
                  <h3>{item.name}</h3>
                  <p>
                    ₹{item.price} x {item.quantity} = ₹
                    {item.price * item.quantity}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <h3 className="cart-total">Total: ₹{totalAmount}</h3>
          <button className="checkout-button" onClick={handlePlaceOrder}>
            Place Order
          </button>
        </>
      )}
    </div>
  );
};

export default Checkout;
