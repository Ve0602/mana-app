import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const ACTIONS = {
  ADD:      'ADD',
  REMOVE:   'REMOVE',
  UPDATE:   'UPDATE',
  CLEAR:    'CLEAR',
  RESTORE:  'RESTORE',
};

function cartReducer(state, action) {
  switch (action.type) {

    case ACTIONS.RESTORE:
      return action.payload;

    case ACTIONS.ADD: {
      const { dish, cookId, kitchenName } = action.payload;

      // Prevent mixing cooks
      if (state.cookId && state.cookId !== cookId) {
        if (!window.confirm(
          `Your cart has items from "${state.kitchenName}". ` +
          `Start a new cart for "${kitchenName}"?`
        )) return state;
        // Clear and start fresh
        return {
          cookId,
          kitchenName,
          items: [{ ...dish, quantity: 1 }],
        };
      }

      const existing = state.items.find(i => i.dishId === dish.dishId);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.dishId === dish.dishId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }

      return {
        cookId,
        kitchenName,
        items: [...state.items, { ...dish, quantity: 1 }],
      };
    }

    case ACTIONS.REMOVE:
      return {
        ...state,
        items: state.items.filter(i => i.dishId !== action.payload),
        cookId:      state.items.length <= 1 ? null : state.cookId,
        kitchenName: state.items.length <= 1 ? ''   : state.kitchenName,
      };

    case ACTIONS.UPDATE: {
      const { dishId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(i => i.dishId !== dishId),
        };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.dishId === dishId ? { ...i, quantity } : i
        ),
      };
    }

    case ACTIONS.CLEAR:
      return { cookId: null, kitchenName: '', items: [] };

    default:
      return state;
  }
}

const INITIAL = { cookId: null, kitchenName: '', items: [] };

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, INITIAL);

  // Persist to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mana_cart');
      if (saved) dispatch({ type: ACTIONS.RESTORE, payload: JSON.parse(saved) });
    } catch (_) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('mana_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart   = (dish, cookId, kitchenName) =>
    dispatch({ type: ACTIONS.ADD, payload: { dish, cookId, kitchenName } });

  const removeFromCart = (dishId) =>
    dispatch({ type: ACTIONS.REMOVE, payload: dishId });

  const updateQuantity = (dishId, quantity) =>
    dispatch({ type: ACTIONS.UPDATE, payload: { dishId, quantity } });

  const clearCart = () =>
    dispatch({ type: ACTIONS.CLEAR });

  const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      totalItems, totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
