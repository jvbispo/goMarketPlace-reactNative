import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const items = await AsyncStorage.getItem('@cart');

      if (items) {
        setProducts(JSON.parse(items));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExistsInCart = products.find(item => item.id === product.id);
      if (productExistsInCart) {
        const filteredProducts = products.filter(
          item => item.id !== product.id,
        );

        setProducts([
          ...filteredProducts,
          {
            ...productExistsInCart,
            quantity: productExistsInCart.quantity
              ? productExistsInCart.quantity + 1
              : 1,
          },
        ]);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem('@goMarketPlace', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const product = products.find(item => item.id === id);
      const filteredProducts = products.filter(item => item.id !== id);

      if (product) {
        product.quantity += 1;
        setProducts([...filteredProducts, product]);
      }

      await AsyncStorage.setItem('@goMarketPlace', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.find(item => item.id === id);
      const filteredProducts = products.filter(item => item.id !== id);

      if (product) {
        if (product.quantity === 1) {
          setProducts([...filteredProducts]);
        } else {
          product.quantity -= 1;
          setProducts([...filteredProducts, product]);
        }
      }
      await AsyncStorage.setItem('@goMarketPlace', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
