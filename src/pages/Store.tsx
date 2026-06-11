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
    const { business, loading: businessLoading } = useBusinessInfo(slug);
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

    if (businessLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand-steel/20 border-b-brand-cream"></div>
            </div>
        );
    }

    if (!business) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white p-6 text-center">
                <div>
                    <h1 className="text-2xl font-bold font-display">Store Not Found</h1>
                    <p className="text-brand-slate mt-2">The store you are looking for does not exist or has been removed.</p>
                </div>
            </div>
        );
    }

    const isTrialActive = business.trial_ends_at ? new Date(business.trial_ends_at) > new Date() : false;
    const isSubscriptionActive = business.subscription_status === 'active' || isTrialActive;

    if (!isSubscriptionActive) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white p-6 text-center">
                <div className="bg-brand-steel/10 border border-brand-steel/15 p-8 md:p-12 rounded-3xl max-w-lg w-full backdrop-blur-md shadow-xl">
                    <div className="w-16 h-16 bg-brand-cream/10 border border-brand-cream/20 text-brand-cream rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold font-display text-white">Store Temporarily Unavailable</h1>
                    <p className="text-brand-slate text-sm leading-relaxed mt-4">
                        This store is currently undergoing system updates or is temporarily offline. Please come back and check again later.
                    </p>
                </div>
            </div>
        );
    }

    const isLoading = productsLoading || categoriesLoading;

    return (
        <div className="min-h-screen bg-brand-dark text-brand-gray flex flex-col">
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
