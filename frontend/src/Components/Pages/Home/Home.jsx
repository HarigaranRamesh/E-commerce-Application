import React from "react";
import ProductList from "../../Main/ProductList";
import Slides from "../../Main/Slides";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Home() {
  return (
    <div>
      <Slides />
      <ProductList />
      <ToastContainer />
    </div>
  );
}

export default Home;
