import { createContext, useReducer, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { cartAPI } from "../services/api";
import { toast } from "react-hot-toast";

export const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { id, size, stock, countInStock } = action.payload;
      const availableStock = Number(stock ?? countInStock ?? 99);
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

  // Sync cart with backend and user session
  useEffect(() => {
    if (user && user.email) {
      const userKey = `cart_${user.email}`;
      let cached = [];
      try {
        cached = JSON.parse(localStorage.getItem(userKey)) || [];
      } catch {
        cached = [];
      }
      if (cached.length > 0) {
        dispatch({ type: "LOAD_CART", payload: cached });
      }

      // Fetch official cart from backend
      cartAPI.getCart()
        .then((res) => {
          if (Array.isArray(res.data)) {
            dispatch({ type: "LOAD_CART", payload: res.data });
            localStorage.setItem(userKey, JSON.stringify(res.data));
          }
        })
        .catch(() => {
          // If offline or network error, fallback to cached
        });
    } else {
      // Unauthenticated users have NO cart access
      dispatch({ type: "LOAD_CART", payload: [] });
      localStorage.removeItem("cart_guest");
    }
  }, [user]);

  // Persist cart to local storage when logged in
  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  // Actions
  const addToCart = async (product, size = "M", quantity = 1) => {
    if (!user) {
      toast.error("Please sign in to add items to your cart");
      return false;
    }

    const payload = { ...product, size, quantity };
    dispatch({ type: "ADD_TO_CART", payload });

    try {
      await cartAPI.addToCart({
        id: product.id || product._id,
        size,
        quantity,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock,
      });
    } catch (err) {
      console.warn("Backend cart sync error:", err.message);
    }
    return true;
  };

  const removeFromCart = async (itemKey) => {
    if (!user) return;
    dispatch({ type: "REMOVE_FROM_CART", payload: itemKey });
    try {
      await cartAPI.removeFromCart(itemKey);
    } catch (err) {
      console.warn("Backend cart remove error:", err.message);
    }
  };

  const updateQuantity = async (itemKey, quantity) => {
    if (!user) return;
    dispatch({ type: "UPDATE_QUANTITY", payload: { itemKey, quantity } });
    try {
      await cartAPI.updateQuantity(itemKey, quantity);
    } catch (err) {
      console.warn("Backend cart update error:", err.message);
    }
  };

  const clearCart = async () => {
    dispatch({ type: "CLEAR_CART" });
    if (user && user.email) {
      localStorage.removeItem(`cart_${user.email}`);
      try {
        await cartAPI.clearCart();
      } catch (err) {
        console.warn("Backend cart clear error:", err.message);
      }
    }
  };

  const getTotalPrice = () => {
    return cart
      .reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0)
      .toFixed(2);
  };

  const isInCart = (id, size) => {
    if (!user) return false;
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
