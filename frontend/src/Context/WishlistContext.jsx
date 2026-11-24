import { createContext, useReducer, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { wishlistAPI } from "../services/api";
import { toast } from "react-hot-toast";

export const WishlistContext = createContext();

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_WISHLIST": {
      const exists = state.some((item) => String(item.id) === String(action.payload.id));
      if (!exists) {
        return [...state, action.payload];
      }
      return state;
    }

    case "REMOVE_FROM_WISHLIST":
      return state.filter((item) => String(item.id) !== String(action.payload));

    case "CLEAR_WISHLIST":
      return [];

    case "LOAD_WISHLIST":
      return Array.isArray(action.payload) ? action.payload : [];

    default:
      return state;
  }
};

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlist, dispatch] = useReducer(wishlistReducer, []);

  // Sync wishlist with backend and user session
  useEffect(() => {
    if (user && user.email) {
      const userKey = `wishlist_${user.email}`;
      let cached = [];
      try {
        cached = JSON.parse(localStorage.getItem(userKey)) || [];
      } catch {
        cached = [];
      }
      if (cached.length > 0) {
        dispatch({ type: "LOAD_WISHLIST", payload: cached });
      }

      // Fetch official wishlist from backend
      wishlistAPI.getWishlist()
        .then((res) => {
          if (Array.isArray(res.data)) {
            dispatch({ type: "LOAD_WISHLIST", payload: res.data });
            localStorage.setItem(userKey, JSON.stringify(res.data));
          }
        })
        .catch(() => {
          // If offline, fallback to cached
        });
    } else {
      // Unauthenticated users have NO wishlist access
      dispatch({ type: "LOAD_WISHLIST", payload: [] });
      localStorage.removeItem("wishlist_guest");
    }
  }, [user]);

  // Persist wishlist whenever it changes when logged in
  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`wishlist_${user.email}`, JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const addToWishlist = async (product) => {
    if (!user) {
      toast.error("Please sign in to add items to your wishlist");
      return false;
    }

    dispatch({ type: "ADD_TO_WISHLIST", payload: product });

    try {
      await wishlistAPI.addToWishlist({
        id: product.id || product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        rating: product.rating,
        stock: product.stock,
      });
    } catch (err) {
      console.warn("Backend wishlist sync error:", err.message);
    }
    return true;
  };

  const removeFromWishlist = async (id) => {
    if (!user) return;
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: id });

    try {
      await wishlistAPI.removeFromWishlist(id);
    } catch (err) {
      console.warn("Backend wishlist remove error:", err.message);
    }
  };

  const clearWishlist = async () => {
    dispatch({ type: "CLEAR_WISHLIST" });
    if (user && user.email) {
      localStorage.removeItem(`wishlist_${user.email}`);
      try {
        await wishlistAPI.clearWishlist();
      } catch (err) {
        console.warn("Backend wishlist clear error:", err.message);
      }
    }
  };

  const isWishlisted = (productId) => {
    if (!user) return false;
    return wishlist.some((item) => String(item.id) === String(productId));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
