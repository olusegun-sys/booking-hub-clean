import { useState } from 'react';
import SmoothScroll from '../lib/SmoothScroll';
import TopNav from '../components/TopNav';
import GatewayBar from '../components/GatewayBar';
import SiteFooter from '../components/SiteFooter';
import HeroStage from '../stages/HeroStage';
import FullBleedStage from '../stages/FullBleedStage';
import BudgetStage from '../stages/BudgetStage';
import OccasionStatementStage from '../stages/OccasionStatementStage';
import OccasionGridStage from '../stages/OccasionGridStage';
import CompareStage from '../stages/CompareStage';
import MerchantStage from '../stages/MerchantStage';
import { images } from '../lib/data';

/**
 * plazzaa.com — a sequence of held scenes rather than a page of sections.
 *
 * Each stage pins for about three screens of scroll: its scene arrives from
 * outside the frame, settles long enough to be read and used, then flies back
 * out past the camera. The two doors stay reachable the whole way down.
 */
export default function Landing() {
  const [category, setCategory] = useState('food');
  const [city, setCity] = useState('Lagos');

  return (
    <SmoothScroll>
      <div className="plz-root min-h-screen bg-white">
        <TopNav />

        <main>
          <HeroStage
            category={category}
            setCategory={setCategory}
            city={city}
            setCity={setCity}
          />

          <FullBleedStage
            id="tonight"
            image={images.viRooftop}
            alt="Friends at a rooftop table in Victoria Island, Lagos at golden hour"
            kicker="Lagos · Abuja"
            statement="There is always somewhere to go. The hard part is knowing where."
          />

          <BudgetStage />

          <OccasionStatementStage />
          <OccasionGridStage />

          <FullBleedStage
            id="weekend"
            image={images.nightlife}
            alt="A crowd dancing in a small Lagos lounge after midnight"
            kicker="Popular this weekend"
            statement="Same night, three very different answers."
            align="center"
          />

          <CompareStage />
          <MerchantStage />
        </main>

        <SiteFooter />
        <GatewayBar />
      </div>
    </SmoothScroll>
  );
}
