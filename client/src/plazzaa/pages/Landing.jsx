import { useState } from 'react';
import TopNav from '../components/TopNav';
import HeroCollage from '../components/HeroCollage';
import BudgetPlanner from '../components/BudgetPlanner';
import OccasionPicker from '../components/OccasionPicker';
import CompareShowcase from '../components/CompareShowcase';
import MerchantBreak from '../components/MerchantBreak';
import SiteFooter from '../components/SiteFooter';
import GatewayBar from '../components/GatewayBar';

/**
 * plazzaa.com — a series of questions, each one answered by the page moving
 * rather than by a paragraph explaining the feature. The two doors (explore /
 * for business) stay reachable the whole way down.
 */
export default function Landing() {
  const [category, setCategory] = useState('food');
  const [city, setCity] = useState('Lagos');

  return (
    <div className="plz-root min-h-screen bg-white">
      <TopNav />

      <main>
        <HeroCollage
          category={category}
          setCategory={setCategory}
          city={city}
          setCity={setCity}
        />
        <BudgetPlanner />
        <OccasionPicker />
        <CompareShowcase />
        <MerchantBreak />
      </main>

      <SiteFooter />
      <GatewayBar emphasis="customer" />
    </div>
  );
}
