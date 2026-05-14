import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ProductGrid } from '../components/ProductGrid';
import { CartDrawer } from '../components/CartDrawer';
import { OrderModal } from '../components/OrderModal';
import { Footer } from '../components/Footer';
import { useBusinessInfo } from '../hooks/useBusinessInfo';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCart } from '../contexts/CartContext';
import type { Product } from '../lib/types';

export function Store() {
    const { slug } = useParams();
    const { business } = useBusinessInfo(slug);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { products, loading: productsLoading } = useProducts(selectedCategory || undefined, slug);
    const { categories, loading: categoriesLoading } = useCategories(slug);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const {
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
    } = useCart();

    const handleAddToCart = (product: Product, quantity: number) => {
        addToCart(product, quantity);
    };

    const handleCheckout = () => {
        setIsCartOpen(false);
        setIsCheckoutOpen(true);
    };

    const handleCheckoutSuccess = () => {
        clearCart();
        setIsCheckoutOpen(false);
    };

    const isLoading = productsLoading || categoriesLoading;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar
                business={business}
                cartItemsCount={getTotalItems()}
                onCartClick={() => setIsCartOpen(true)}
            />
            <Hero business={business} />
            <ProductGrid
                products={products}
                categories={categories}
                loading={isLoading}
                onAddToCart={handleAddToCart}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={items}
                totalPrice={getTotalPrice()}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onCheckout={handleCheckout}
            />
            <OrderModal
                items={items}
                business={business}
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                onSuccess={handleCheckoutSuccess}
            />
            <Footer business={business} />
        </div>
    );
}
