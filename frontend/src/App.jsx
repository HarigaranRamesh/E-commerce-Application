import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Home from "./Components/Pages/Home/Home";
import Category from "./Components/Pages/Categories/Category";
import CategoryDetail from "./Components/Pages/Categories/CategoryDetail";
import Wishlist from "./Components/Pages/Wishlist/Wishlist";
import Cart from "./Components/Pages/Cart/Cart";
import Checkout from "./Components/Pages/Checkout/Checkout.jsx";
import Login from "./Components/Pages/Login/Login";
import Signup from "./Components/Pages/Signup/Signup";
import Profile from "./Components/Pages/Profile/Profile";
import Footer from "./Components/Footer/Footer";
import { AuthProvider } from "./Context/AuthContext";
import { CartProvider } from "./Context/CartContext";
import { WishlistProvider } from "./Context/WishlistContext";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Navbar />
          <Toaster
            position="top-right"
            toastOptions={{
              // Default style for ALL toasts
              style: {
                background: "#01579b",
                color: "#fff",
              },
              success: {
                duration: 3000,
              },
              error: {
                duration: 3000,
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Category" element={<Category />} />
            <Route
              path="/category/:categoryName"
              element={<CategoryDetail />}
            />
            <Route path="/Wishlist" element={<Wishlist />} />
            <Route path="/Cart" element={<Cart />} />
            <Route path="/Checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <Footer />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
