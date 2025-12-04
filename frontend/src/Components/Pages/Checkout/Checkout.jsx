import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AuthContext } from "../../../Context/AuthContext";
import { CartContext } from "../../../Context/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { paymentAPI, ordersAPI } from "../../../services/api";
import "./Checkout.css";

const CheckoutForm = ({ cart, totalAmount, shippingInfo, onSuccess, user }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      // Create payment intent
      const { data } = await paymentAPI.createPaymentIntent(totalAmount);

      // Confirm payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user?.name,
            email: user?.email,
          },
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        // Create order
        const orderData = {
          orderItems: cart.map(item => ({
            product: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
          shippingAddress: shippingInfo,
          paymentMethod: "stripe",
          totalPrice: totalAmount,
          itemsPrice: totalAmount,
          taxPrice: 0,
          shippingPrice: 0,
        };

        const { data: createdOrder } = await ordersAPI.create(orderData);

        // Update order to paid
        if (result.paymentIntent.status === 'succeeded') {
          const paymentResult = {
            id: result.paymentIntent.id,
            status: result.paymentIntent.status,
            update_time: new Date().toISOString(),
            email_address: user?.email,
          };
          await ordersAPI.updateToPaid(createdOrder._id, paymentResult);
        }

        toast.success("Payment successful! Order placed.");
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="card-element-wrapper">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': { color: '#aab7c4' },
            },
          },
        }} />
      </div>
      <button type="submit" disabled={!stripe || processing} className="pay-button">
        {processing ? "Processing..." : "Place Order"}
      </button>
    </form>
  );
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const cart = location.state?.cart || [];
  const [stripePromise, setStripePromise] = useState(null);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    const getStripeKey = async () => {
      const { data } = await paymentAPI.getConfig();
      setStripePromise(loadStripe(data.publishableKey));
    };
    getStripeKey();
  }, []);

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleSuccess = () => {
    clearCart();
    setTimeout(() => navigate("/myorders"), 2000);
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
          <div className="shipping-form">
            <input type="text" name="fullName" placeholder="Full Name" value={shippingInfo.fullName} onChange={handleInputChange} required />
            <input type="text" name="address" placeholder="Address" value={shippingInfo.address} onChange={handleInputChange} required />
            <input type="text" name="city" placeholder="City" value={shippingInfo.city} onChange={handleInputChange} required />
            <input type="text" name="postalCode" placeholder="Postal Code" value={shippingInfo.postalCode} onChange={handleInputChange} required />
            <input type="text" name="country" placeholder="Country" value={shippingInfo.country} onChange={handleInputChange} required />
            <input type="tel" name="phone" placeholder="Phone" value={shippingInfo.phone} onChange={handleInputChange} required />
          </div>

          <h2 className="mt-4">Payment Details</h2>
          {stripePromise ? (
            <Elements stripe={stripePromise}>
              <CheckoutForm cart={cart} totalAmount={totalAmount} shippingInfo={shippingInfo} onSuccess={handleSuccess} user={user} />
            </Elements>
          ) : (
            <div className="loading-stripe">Loading payment system...</div>
          )}
        </div>

        <div className="checkout-right">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cart.map((item) => (
              <div key={item.id} className="order-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <h4>{item.name}</h4>
                  <p>${item.price} x {item.quantity}</p>
                </div>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="order-total">
            <h3>Total: ${totalAmount.toFixed(2)}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
