import { createContext, useReducer, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { id, size, stock, countInStock } = action.payload;
      const availableStock = Number(stock ?? countInStock ?? 99);
      // Unique item key combines ID and Size (e.g., "1-M")
      const itemKey = size ? `${id}-${size}` : `${id}`;

      const existingItem = state.find((item) => item.itemKey === itemKey);

      if (existingItem) {
        const newQty = existingItem.quantity + (action.payload.quantity || 1);
        return state.map((item) =>
          item.itemKey === itemKey
            ? { ...item, quantity: Math.min(newQty, availableStock > 0 ? availableStock : 99) }
            : item
        );
      } else {
        const initialQty = Math.min(action.payload.quantity || 1, availableStock > 0 ? availableStock : 99);
        return [...state, { ...action.payload, itemKey, quantity: initialQty }];
      }
    }

    case "REMOVE_FROM_CART":
      return state.filter((item) => item.itemKey !== action.payload);

    case "UPDATE_QUANTITY":
      return state.map((item) => {
        if (item.itemKey === action.payload.itemKey) {
          const maxStock = Number(item.stock ?? item.countInStock ?? 99);
          const requestedQty = Math.max(1, action.payload.quantity);
          return {
            ...item,
            quantity: maxStock > 0 ? Math.min(requestedQty, maxStock) : requestedQty,
          };
        }
        return item;
      });

    case "CLEAR_CART":
      return [];

    case "LOAD_CART":
      return Array.isArray(action.payload) ? action.payload : [];

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, dispatch] = useReducer(cartReducer, []);

  // Load and merge cart on mount or user state change
  useEffect(() => {
    if (user && user.email) {
      const userKey = `cart_${user.email}`;
      let userCart = [];
      try {
        userCart = JSON.parse(localStorage.getItem(userKey)) || [];
      } catch (e) {
        userCart = [];
      }

      // Check if there was a guest cart to merge
      let guestCart = [];
      try {
        guestCart = JSON.parse(localStorage.getItem("cart_guest")) || [];
      } catch (e) {
        guestCart = [];
      }

      if (guestCart.length > 0) {
        // Merge guest cart items into user cart
        guestCart.forEach((guestItem) => {
          const existingIdx = userCart.findIndex((i) => i.itemKey === guestItem.itemKey);
          if (existingIdx > -1) {
            userCart[existingIdx].quantity += guestItem.quantity;
          } else {
            userCart.push(guestItem);
          }
        });
        localStorage.removeItem("cart_guest");
        localStorage.setItem(userKey, JSON.stringify(userCart));
      }

      dispatch({ type: "LOAD_CART", payload: userCart });
    } else {
      // Guest mode
      let guestCart = [];
      try {
        guestCart = JSON.parse(localStorage.getItem("cart_guest")) || [];
      } catch (e) {
        guestCart = [];
      }
      dispatch({ type: "LOAD_CART", payload: guestCart });
    }
  }, [user]);

  // Persist cart whenever it changes
  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));
    } else {
      localStorage.setItem("cart_guest", JSON.stringify(cart));
    }
  }, [cart, user]);

  // Actions
  const addToCart = (product, size = "M") => {
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
    if (user && user.email) {
      localStorage.removeItem(`cart_${user.email}`);
    } else {
      localStorage.removeItem("cart_guest");
    }
  };

  const getTotalPrice = () => {
    return cart
      .reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0)
      .toFixed(2);
  };

  const isInCart = (id, size) => {
    const itemKey = size ? `${id}-${size}` : `${id}`;
    return cart.some((item) => item.itemKey === itemKey || item.id === id);
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
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
