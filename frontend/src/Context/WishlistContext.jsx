import { createContext, useReducer, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

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

  // Load and merge wishlist on mount or user change
  useEffect(() => {
    if (user && user.email) {
      const userKey = `wishlist_${user.email}`;
      let userWishlist = [];
      try {
        userWishlist = JSON.parse(localStorage.getItem(userKey)) || [];
      } catch {
        userWishlist = [];
      }

      // Merge guest wishlist
      let guestWishlist = [];
      try {
        guestWishlist = JSON.parse(localStorage.getItem("wishlist_guest")) || [];
      } catch {
        guestWishlist = [];
      }

      if (guestWishlist.length > 0) {
        guestWishlist.forEach((guestItem) => {
          if (!userWishlist.some((i) => String(i.id) === String(guestItem.id))) {
            userWishlist.push(guestItem);
          }
        });
        localStorage.removeItem("wishlist_guest");
        localStorage.setItem(userKey, JSON.stringify(userWishlist));
      }

      dispatch({ type: "LOAD_WISHLIST", payload: userWishlist });
    } else {
      // Guest mode
      let guestWishlist = [];
      try {
        guestWishlist = JSON.parse(localStorage.getItem("wishlist_guest")) || [];
      } catch {
        guestWishlist = [];
      }
      dispatch({ type: "LOAD_WISHLIST", payload: guestWishlist });
    }
  }, [user]);

  // Persist wishlist whenever it changes
  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`wishlist_${user.email}`, JSON.stringify(wishlist));
    } else {
      localStorage.setItem("wishlist_guest", JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const addToWishlist = (product) => {
    dispatch({ type: "ADD_TO_WISHLIST", payload: product });
  };

  const removeFromWishlist = (id) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: id });
  };

  const clearWishlist = () => {
    dispatch({ type: "CLEAR_WISHLIST" });
    if (user && user.email) {
      localStorage.removeItem(`wishlist_${user.email}`);
    } else {
      localStorage.removeItem("wishlist_guest");
    }
  };

  const isWishlisted = (productId) => {
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
