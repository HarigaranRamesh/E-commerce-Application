import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Truck } from "lucide-react";
import { AuthContext } from "../../../Context/AuthContext";
import { CartContext } from "../../../Context/CartContext";
import { ordersAPI } from "../../../services/api";
import "./CheckoutStyles.css";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const cart = location.state?.cart || [];



  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handlePlaceOrderCOD = async (e) => {
    e.preventDefault();
    if (!shippingInfo.address || !shippingInfo.phone) {
      toast.error("Please fill in all shipping details");
      return;
    }

    try {
      const orderData = {
        orderItems: cart.map(item => ({
          product: item.id, // Sending numeric ID
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          size: item.size
        })),
        shippingAddress: shippingInfo,
        paymentMethod: "cod",
        totalPrice: totalAmount,
        // Backend expects these but we can send 0/calc them later
        itemsPrice: totalAmount,
        taxPrice: 0,
        shippingPrice: 0
      };

      await ordersAPI.create(orderData); // Call Backend API

      clearCart();
      toast.success("Order placed successfully! Will be delivered soon 🚚");
      setTimeout(() => navigate("/"), 2500);

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to place order");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <h2>Your cart is empty</h2>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-left">
          <h2>Shipping Information</h2>
          <form id="cod-form" onSubmit={handlePlaceOrderCOD} className="shipping-form">
            <input type="text" name="fullName" placeholder="Full Name" value={shippingInfo.fullName} onChange={handleInputChange} required />
            <input type="text" name="address" placeholder="Address" value={shippingInfo.address} onChange={handleInputChange} required />
            <input type="text" name="city" placeholder="City" value={shippingInfo.city} onChange={handleInputChange} required />
            <input type="text" name="postalCode" placeholder="Postal Code" value={shippingInfo.postalCode} onChange={handleInputChange} required />
            <input type="text" name="country" placeholder="Country" value={shippingInfo.country} onChange={handleInputChange} required />
            <input type="tel" name="phone" placeholder="Phone" value={shippingInfo.phone} onChange={handleInputChange} required />
          </form>

          <h2 className="mt-4">Payment Method</h2>
          <div className="payment-options">
            <label className="payment-option selected">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={true}
                readOnly
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} />
                Cash on Delivery (COD)
              </span>
            </label>
            {/* Stripe option removed */}
          </div>

          <div className="mt-4">
            <button type="submit" form="cod-form" className="pay-button cod-btn">
              Place Order (COD)
            </button>
          </div>
        </div>

        <div className="checkout-right">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cart.map((item) => (
              <div key={item.itemKey || item.id} className="order-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <h4>{item.name}</h4>
                  <p>₹{item.price} x {item.quantity}</p>
                </div>
                <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
          <div className="order-total">
            <h3>Total: ₹{totalAmount.toLocaleString("en-IN")}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
