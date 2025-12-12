import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./PublicLayout";

// Lazy load pages
const Home = lazy(() => import("./Components/Pages/Home/Home"));
const Category = lazy(() => import("./Components/Pages/Categories/Category"));
const CategoryDetail = lazy(() => import("./Components/Pages/Categories/CategoryDetail"));
const Wishlist = lazy(() => import("./Components/Pages/Wishlist/Wishlist"));
const Cart = lazy(() => import("./Components/Pages/Cart/Cart"));
const Checkout = lazy(() => import("./Components/Pages/Checkout/Checkout.jsx"));
const Login = lazy(() => import("./Components/Pages/Login/Login"));
const Signup = lazy(() => import("./Components/Pages/Signup/Signup"));
const ForgotPassword = lazy(() => import("./Components/Pages/Login/ForgotPassword"));
const Profile = lazy(() => import("./Components/Pages/Profile/Profile"));
const MyOrders = lazy(() => import("./Components/Pages/Profile/MyOrders"));
const ProductDetail = lazy(() => import("./Components/Pages/ProductDetail/ProductDetail"));
const SearchResults = lazy(() => import("./Components/Pages/Search/SearchResults"));
const OrderDetail = lazy(() => import("./Components/Pages/Order/OrderDetail"));

// Admin Components (Lazy load)
const AdminLayout = lazy(() => import("./Components/Admin/AdminLayout"));
const DashboardData = lazy(() => import("./Components/Admin/DashboardData"));
const UserList = lazy(() => import("./Components/Admin/UserList"));
const OrderList = lazy(() => import("./Components/Admin/OrderList"));
const ProductListAdmin = lazy(() => import("./Components/Admin/ProductListAdmin"));
const ProductEdit = lazy(() => import("./Components/Admin/ProductEdit"));
const AdminRoute = lazy(() => import("./Components/Admin/AdminRoute"));

import { AuthProvider } from "./Context/AuthContext";
import { CartProvider } from "./Context/CartContext";
import { WishlistProvider } from "./Context/WishlistContext";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              // Default style for ALL toasts
              style: {
                background: "#01579b",
                color: "#fff",
              },
              success: {
                duration: 1500,
              },
              error: {
                duration: 1500,
              },
            }}
          />
          <Suspense fallback={<div className="loading-container"><div className="spinner"></div></div>}>
            <Routes>
              {/* Public Routes - Wrapped in PublicLayout */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/Category" element={<Category />} />
                <Route
                  path="/category/:categoryName"
                  element={<CategoryDetail />}
                />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/Wishlist" element={<Wishlist />} />
                <Route path="/Cart" element={<Cart />} />
                <Route path="/Checkout" element={<Checkout />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/order/:id" element={<OrderDetail />} />
              </Route>

              {/* Admin Routes - Isolated from Public Layout */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardData />} />
                  <Route path="users" element={<UserList />} />
                  <Route path="orders" element={<OrderList />} />
                  <Route path="products" element={<ProductListAdmin />} />
                  <Route path="product/new" element={<ProductEdit />} />
                  <Route path="product/:id/edit" element={<ProductEdit />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
