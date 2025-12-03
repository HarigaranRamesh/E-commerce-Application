import { createContext, useReducer, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const WishlistContext = createContext();

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_WISHLIST":
      if (!state.find((item) => item.id === action.payload.id)) {
        return [...state, action.payload];
      }
      return state;

    case "REMOVE_FROM_WISHLIST":
      return state.filter((item) => item.id !== action.payload);

    case "CLEAR_WISHLIST":
      return [];

    case "LOAD_WISHLIST":
      return action.payload;

    default:
      return state;
  }
};

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlist, dispatch] = useReducer(wishlistReducer, []);

  // Load wishlist for the current user
  useEffect(() => {
    if (user) {
      const savedWishlist =
        JSON.parse(localStorage.getItem(`wishlist_${user.email}`)) || [];
      dispatch({ type: "LOAD_WISHLIST", payload: savedWishlist });
    } else {
      dispatch({ type: "LOAD_WISHLIST", payload: [] });
    }
  }, [user]);

  // Save wishlist whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`wishlist_${user.email}`, JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const addToWishlist = (product) => {
    if (!user) {
      alert("Please login to add products to wishlist");
      return;
    }
    dispatch({ type: "ADD_TO_WISHLIST", payload: product });
  };

  const removeFromWishlist = (id) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: id });
  };

  const clearWishlist = () => {
    dispatch({ type: "CLEAR_WISHLIST" });
    if (user) localStorage.removeItem(`wishlist_${user.email}`);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
