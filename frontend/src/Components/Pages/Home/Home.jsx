import React from "react";
import ProductList from "../../Main/ProductList";
import Hero from "../../Main/Hero";
import ServiceFeatures from "../../Main/ServiceFeatures";
import Newsletter from "../../Main/Newsletter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Home() {
  return (
    <div>
      <Hero />
      <ServiceFeatures />

      <div className="container mt-4 mb-4">
        <div className="text-center mb-4" style={{ position: "relative" }}>
          <h2>Featured Products</h2>
          <p className="text-muted">Handpicked selections just for you</p>
          {/* Decorative line or simple spacing */}
          <div style={{ width: "60px", height: "3px", background: "#01579b", margin: "10px auto" }}></div>
        </div>
        <ProductList />
      </div>

      <Newsletter />
      <ToastContainer />
    </div>
  );
}

export default Home;
