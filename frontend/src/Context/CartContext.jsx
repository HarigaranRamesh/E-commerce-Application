import { createContext, useReducer, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { id, size } = action.payload;
      // Unique item key combines ID and Size (e.g., "1-M")
      const itemKey = size ? `${id}-${size}` : `${id}`;

      const existingItem = state.find((item) => item.itemKey === itemKey);

      if (existingItem) {
        return state.map((item) =>
          item.itemKey === itemKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...state, { ...action.payload, itemKey, quantity: 1 }];
      }
    }

    case "REMOVE_FROM_CART":
      return state.filter((item) => item.itemKey !== action.payload);

    case "UPDATE_QUANTITY":
      return state.map((item) =>
        item.itemKey === action.payload.itemKey
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );

    case "CLEAR_CART":
      return [];

    case "LOAD_CART":
      return action.payload;

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, dispatch] = useReducer(cartReducer, []);

  // Load cart for the current user
  useEffect(() => {
    if (user) {
      const savedCart =
        JSON.parse(localStorage.getItem(`cart_${user.email}`)) || [];
      dispatch({ type: "LOAD_CART", payload: savedCart });
    } else {
      dispatch({ type: "LOAD_CART", payload: [] });
    }
  }, [user]);

  // Save cart whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  // Actions
  const addToCart = (product, size = null) => {
    if (!user) {
      alert("Please login to add products to cart");
      return;
    }
    dispatch({ type: "ADD_TO_CART", payload: { ...product, size } });
  };

  const removeFromCart = (itemKey) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: itemKey });
  };

  const updateQuantity = (itemKey, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { itemKey, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
    if (user) localStorage.removeItem(`cart_${user.email}`);
  };

  const getTotalPrice = () => {
    return cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
