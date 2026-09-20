// Demo content for the Plazzaa marketing surfaces.
// Venues are fictional so nothing here implies a real business.
// Prices are in naira and sized to real Lagos / Abuja spending.

import viRooftop from '../../assets/plazzaa/vi-rooftop-dinner.jpg';
import suyaGrill from '../../assets/plazzaa/suya-grill.jpg';
import spaTreatment from '../../assets/plazzaa/spa-treatment.jpg';
import nightlife from '../../assets/plazzaa/lagos-nightlife.jpg';
import jabiLake from '../../assets/plazzaa/abuja-jabi-lake.jpg';
import artGallery from '../../assets/plazzaa/art-gallery.jpg';
import beachClub from '../../assets/plazzaa/beach-club.jpg';
import brunchTable from '../../assets/plazzaa/brunch-table.jpg';
import ikoyiGarden from '../../assets/plazzaa/ikoyi-garden-restaurant.jpg';
import padelCourt from '../../assets/plazzaa/padel-court.jpg';
import hotelRoom from '../../assets/plazzaa/boutique-hotel-room.jpg';
import abujaLounge from '../../assets/plazzaa/abuja-rooftop-lounge.jpg';
import salonOwner from '../../assets/plazzaa/salon-owner.jpg';
import spaReception from '../../assets/plazzaa/spa-reception.jpg';
import restaurantOwner from '../../assets/plazzaa/restaurant-owner.jpg';
import barberShop from '../../assets/plazzaa/barber-shop.jpg';
import nailStudio from '../../assets/plazzaa/nail-studio.jpg';
import makeupStudio from '../../assets/plazzaa/makeup-studio.jpg';
import restaurantKitchen from '../../assets/plazzaa/restaurant-kitchen.jpg';

export const images = {
  viRooftop, suyaGrill, spaTreatment, nightlife, jabiLake, artGallery,
  beachClub, brunchTable, ikoyiGarden, padelCourt, hotelRoom, abujaLounge,
  salonOwner, spaReception, restaurantOwner, barberShop,
  nailStudio, makeupStudio, restaurantKitchen
};

// Plazzaa for Business leads with the trades that live on DM bookings:
// restaurants, spas, beauty.
export const merchantTrades = [
  { id: 'salon', label: 'Hair & braiding', image: salonOwner, service: 'Knotless braids', price: 35000, minutes: 180 },
  { id: 'spa', label: 'Spas & massage', image: spaReception, service: 'Deep tissue, 60 mins', price: 25000, minutes: 60 },
  { id: 'nails', label: 'Nails', image: nailStudio, service: 'Gel manicure', price: 12000, minutes: 45 },
  { id: 'makeup', label: 'Makeup', image: makeupStudio, service: 'Full glam', price: 40000, minutes: 90 },
  { id: 'barber', label: 'Barbering', image: barberShop, service: 'Cut and line-up', price: 7000, minutes: 40 },
  { id: 'restaurant', label: 'Restaurants', image: restaurantKitchen, service: 'Table for four', price: 0, minutes: 120 }
];

/**
 * Every trade a merchant can pick at sign-up, grouped the way people describe
 * their own work rather than the way a database would file it.
 *
 * `merchantTrades` above stays the marketing shortlist — the six with
 * photography behind them. This is the full list the sign-up sheet offers,
 * with the popular few shown up front and the rest a tap away.
 */
export const tradeGroups = [
  {
    group: 'Beauty & grooming',
    trades: [
      { id: 'salon', label: 'Hair & braiding' },
      { id: 'barber', label: 'Barbering' },
      { id: 'nails', label: 'Nails' },
      { id: 'makeup', label: 'Makeup' },
      { id: 'lashes', label: 'Lashes & brows' },
      { id: 'locs', label: 'Locs & twists' },
      { id: 'wigs', label: 'Wigs & installs' },
      { id: 'piercing', label: 'Piercing & tattoo' }
    ]
  },
  {
    group: 'Health & wellness',
    trades: [
      { id: 'spa', label: 'Spas & massage' },
      { id: 'physio', label: 'Physiotherapy' },
      { id: 'clinic', label: 'Clinics & consultations' },
      { id: 'dental', label: 'Dental' },
      { id: 'optical', label: 'Optical' },
      { id: 'therapy', label: 'Therapy & counselling' },
      { id: 'nutrition', label: 'Nutrition & diet' }
    ]
  },
  {
    group: 'Fitness & sport',
    trades: [
      { id: 'gym', label: 'Gyms' },
      { id: 'trainer', label: 'Personal training' },
      { id: 'yoga', label: 'Yoga & pilates' },
      { id: 'dance', label: 'Dance studios' },
      { id: 'pitch', label: 'Pitches & courts' },
      { id: 'swim', label: 'Swimming' }
    ]
  },
  {
    group: 'Food & drink',
    trades: [
      { id: 'restaurant', label: 'Restaurants' },
      { id: 'lounge', label: 'Lounges & bars' },
      { id: 'cafe', label: 'Cafés' },
      { id: 'catering', label: 'Catering' },
      { id: 'private-chef', label: 'Private chefs' },
      { id: 'bakery', label: 'Cakes & bakery' }
    ]
  },
  {
    group: 'Events & hospitality',
    trades: [
      { id: 'event-centre', label: 'Event centres' },
      { id: 'hotel', label: 'Hotels & shortlets' },
      { id: 'photography', label: 'Photography' },
      { id: 'video', label: 'Videography' },
      { id: 'dj', label: 'DJs & live music' },
      { id: 'event-planning', label: 'Event planning' },
      { id: 'rentals', label: 'Equipment rentals' }
    ]
  },
  {
    group: 'Home & auto',
    trades: [
      { id: 'cleaning', label: 'Cleaning' },
      { id: 'laundry', label: 'Laundry & dry cleaning' },
      { id: 'repairs', label: 'Repairs & handyman' },
      { id: 'electrician', label: 'Electrical' },
      { id: 'plumbing', label: 'Plumbing' },
      { id: 'interiors', label: 'Interiors & decor' },
      { id: 'car-wash', label: 'Car wash & detailing' },
      { id: 'mechanic', label: 'Auto repair' }
    ]
  },
  {
    group: 'Professional & learning',
    trades: [
      { id: 'tutoring', label: 'Tutoring & lessons' },
      { id: 'driving', label: 'Driving school' },
      { id: 'legal', label: 'Legal services' },
      { id: 'accounting', label: 'Accounting & tax' },
      { id: 'consulting', label: 'Consulting' },
      { id: 'tailoring', label: 'Tailoring & fashion' },
      { id: 'coworking', label: 'Coworking & studios' },
      { id: 'pet-care', label: 'Pet care' }
    ]
  }
];

/** The eight offered before the sheet asks you to go looking. */
export const popularTradeIds = [
  'salon', 'spa', 'barber', 'nails', 'makeup', 'restaurant', 'event-centre', 'cleaning'
];

export const allTrades = tradeGroups.flatMap((g) => g.trades);

export const findTrade = (id) => allTrades.find((t) => t.id === id) || null;

export const naira = (value) =>
  '₦' + Math.round(value).toLocaleString('en-NG');

// Compact naira for cards: ₦35k
export const nairaShort = (value) => {
  if (value >= 1000000) return '₦' + (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  if (value >= 1000) return '₦' + Math.round(value / 1000) + 'k';
  return '₦' + value;
};

export const cities = ['Lagos', 'Abuja'];

export const categories = [
  { id: 'food', label: 'Food' },
  { id: 'spa', label: 'Spa' },
  { id: 'activities', label: 'Activities' },
  { id: 'nightlife', label: 'Nightlife' },
  { id: 'stays', label: 'Stays' }
];

export const venues = [
  {
    id: 'kofa',
    name: 'Kofa Rooftop',
    area: 'Victoria Island',
    city: 'Lagos',
    category: 'food',
    kind: 'Rooftop dining',
    from: 16000,
    forTwo: 32000,
    rating: 4.8,
    reviews: 214,
    image: viRooftop,
    blurb: 'Small plates and a lagoon view, best just before sunset.',
    tags: ['Date night', 'Outdoor', 'Sunset']
  },
  {
    id: 'yaji',
    name: 'Yaji Yard',
    area: 'Yaba',
    city: 'Lagos',
    category: 'food',
    kind: 'Suya and grills',
    from: 6500,
    forTwo: 14000,
    rating: 4.6,
    reviews: 389,
    image: suyaGrill,
    blurb: 'Charcoal suya until 2am. Go hungry, go late.',
    tags: ['Late night', 'Group hangout', 'Under ₦20k']
  },
  {
    id: 'ruwa',
    name: 'Ruwa Spa',
    area: 'Lekki Phase 1',
    city: 'Lagos',
    category: 'spa',
    kind: 'Day spa',
    from: 25000,
    forTwo: 50000,
    rating: 4.9,
    reviews: 132,
    image: spaTreatment,
    blurb: 'Deep tissue, hot stone, and a very quiet room.',
    tags: ['Calm', 'Self care', 'Weekday']
  },
  {
    id: 'bassline',
    name: 'Bassline',
    area: 'Victoria Island',
    city: 'Lagos',
    category: 'nightlife',
    kind: 'Live music lounge',
    from: 20000,
    forTwo: 45000,
    rating: 4.5,
    reviews: 501,
    image: nightlife,
    blurb: 'Afrobeats sets Thursday to Sunday, table service from 10pm.',
    tags: ['Group hangout', 'Live music']
  },
  {
    id: 'jabi',
    name: 'Jabi Boat Club',
    area: 'Jabi',
    city: 'Abuja',
    category: 'activities',
    kind: 'Lakeside boating',
    from: 12000,
    forTwo: 24000,
    rating: 4.4,
    reviews: 96,
    image: jabiLake,
    blurb: 'Sunset boat runs, then dinner on the boardwalk.',
    tags: ['Outdoor', 'Date night']
  },
  {
    id: 'adio',
    name: 'Adio Gallery',
    area: 'Ikoyi',
    city: 'Lagos',
    category: 'activities',
    kind: 'Art gallery',
    from: 5000,
    forTwo: 10000,
    rating: 4.7,
    reviews: 74,
    image: artGallery,
    blurb: 'Rotating shows from West African painters, guided walk-throughs on Saturdays.',
    tags: ['Something different', 'Indoor']
  },
  {
    id: 'ilaje',
    name: 'Ilaje Beach Club',
    area: 'Lekki',
    city: 'Lagos',
    category: 'activities',
    kind: 'Beach day',
    from: 15000,
    forTwo: 30000,
    rating: 4.3,
    reviews: 268,
    image: beachClub,
    blurb: 'Cabanas, grilled fish and a long stretch of sand.',
    tags: ['Group hangout', 'Outdoor', 'Kids day out']
  },
  {
    id: 'ile',
    name: 'Ile Brunch House',
    area: 'Ikeja GRA',
    city: 'Lagos',
    category: 'food',
    kind: 'Brunch',
    from: 9000,
    forTwo: 19000,
    rating: 4.6,
    reviews: 187,
    image: brunchTable,
    blurb: 'Jollof, plantain and chapman from 9am on weekends.',
    tags: ['Brunch', 'Girls night', 'Family']
  },
  {
    id: 'ayaba',
    name: 'Ayaba Garden',
    area: 'Ikoyi',
    city: 'Lagos',
    category: 'food',
    kind: 'Garden restaurant',
    from: 14000,
    forTwo: 29000,
    rating: 4.8,
    reviews: 341,
    image: ikoyiGarden,
    blurb: 'Tables under the trees, West African menu, quiet enough to talk.',
    tags: ['Date night', 'Outdoor', 'Birthday']
  },
  {
    id: 'court24',
    name: 'Court 24 Padel',
    area: 'Lekki',
    city: 'Lagos',
    category: 'activities',
    kind: 'Padel courts',
    from: 18000,
    forTwo: 18000,
    rating: 4.7,
    reviews: 118,
    image: padelCourt,
    blurb: 'Floodlit courts by the hour, racket hire included.',
    tags: ['Group hangout', 'Something different']
  },
  {
    id: 'quiet-room',
    name: 'The Quiet Room',
    area: 'Yaba',
    city: 'Lagos',
    category: 'stays',
    kind: 'Boutique stay',
    from: 85000,
    forTwo: 85000,
    rating: 4.9,
    reviews: 62,
    image: hotelRoom,
    blurb: 'Six rooms, no lobby music, very good coffee.',
    tags: ['Staycation', 'Calm']
  },
  {
    id: 'maitama-sky',
    name: 'Maitama Sky',
    area: 'Maitama',
    city: 'Abuja',
    category: 'nightlife',
    kind: 'Rooftop lounge',
    from: 22000,
    forTwo: 48000,
    rating: 4.6,
    reviews: 154,
    image: abujaLounge,
    blurb: 'Fire pits, low seating and the Abuja hills behind you.',
    tags: ['Date night', 'Birthday']
  }
];

export const occasions = [
  { id: 'date-night', label: 'Date night', venues: ['kofa', 'ayaba', 'maitama-sky'] },
  { id: 'birthday', label: 'Birthday', venues: ['bassline', 'ayaba', 'ilaje'] },
  { id: 'kids', label: 'Kids day out', venues: ['ilaje', 'jabi', 'adio'] },
  { id: 'group', label: 'Group hangout', venues: ['yaji', 'court24', 'bassline'] },
  { id: 'girls-night', label: 'Girls night', venues: ['ruwa', 'ile', 'maitama-sky'] },
  { id: 'different', label: 'Something different', venues: ['adio', 'court24', 'jabi'] }
];

// Budget planner: each plan is priced as a share of the chosen budget,
// so the numbers move as the slider moves instead of sitting static.
export const budgetPlans = [
  {
    id: 'dinner',
    label: 'Dinner for two',
    detail: 'Two courses, no drinks',
    share: [0.62, 0.78],
    venueIds: ['ayaba', 'kofa', 'ile']
  },
  {
    id: 'dinner-drinks',
    label: 'Dinner and drinks',
    detail: 'Dinner, then a lounge after',
    share: [0.78, 0.94],
    venueIds: ['kofa', 'bassline', 'maitama-sky']
  },
  {
    id: 'dinner-activity',
    label: 'Dinner and an activity',
    detail: 'Something to do, then food',
    share: [0.88, 1.05],
    venueIds: ['court24', 'jabi', 'ayaba']
  }
];

export const venueById = (id) => venues.find((v) => v.id === id);

export const venuesByCategory = (categoryId, city) =>
  venues.filter((v) => (!categoryId || v.category === categoryId) && (!city || v.city === city));

// Merchant side
export const merchantServices = [
  { name: 'Swedish massage', price: 25000, minutes: 60 },
  { name: 'Hair treatment', price: 18000, minutes: 45 },
  { name: 'Gel manicure', price: 12000, minutes: 30 }
];

export const merchantHours = [
  { day: 'Fri', hours: '10 - 6' },
  { day: 'Sat', hours: '10 - 8' },
  { day: 'Sun', hours: '12 - 5' }
];

export const dmChaos = [
  { from: 'them', text: 'Are you available Saturday?' },
  { from: 'them', text: 'How much is the massage?' },
  { from: 'them', text: '2pm?' },
  { from: 'them', text: 'Send account number please' },
  { from: 'them', text: 'Hello? Still holding my slot?' }
];
