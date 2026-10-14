import SmoothScroll from '../lib/SmoothScroll';
import TopNav from '../components/TopNav';
import GatewayBar from '../components/GatewayBar';
import SiteFooter from '../components/SiteFooter';
import HeroStage from '../stages/HeroStage';
import BudgetStage from '../stages/BudgetStage';
import ExperiencesStage from '../stages/ExperiencesStage';
import CompareStage from '../stages/CompareStage';
import MerchantStage from '../stages/MerchantStage';

/**
 * plazzaa.com — one continuous, scroll-linked story rather than a stack of
 * sections.
 *
 * Each stage pins a screen and runs the same underlying grammar — elements
 * converge, one thing expands, the composition disperses, and it hands over to
 * the next — but each expresses it differently so the page never repeats
 * itself:
 *
 *   hero         cinematic   photographs gather, one opens across the screen
 *   budget       interactive places converge on an amount you control
 *   experiences  photographic four occasions stack, one opens, they deal out
 *   compare      functional  cards align into a live comparison
 *   merchant     transformative the customer story turns into the product
 *
 * Scrubbing back up reverses every one of them.
 */
export default function Landing() {
  return (
    <SmoothScroll>
      <div className="plz-root min-h-screen bg-white">
        <TopNav />

        <main>
          <HeroStage />
          <BudgetStage />
          <ExperiencesStage />
          <CompareStage />
          <MerchantStage />
        </main>

        <SiteFooter />
        <GatewayBar revealAfter="#hero" />
      </div>
    </SmoothScroll>
  );
}
