#!/usr/bin/env zsh
# Generates the Plazzaa photography set with OpenAI gpt-image-1.
# Editorial lifestyle direction per the Plazzaa design system section 8:
# genuine environments, people actually interacting, natural light,
# slightly imperfect framing. No text, logos or watermarks in frame.

set -u
OUT="/Users/admin/Desktop/Claude Projects/Plazzaa Local/client/src/assets/plazzaa"
GEN="/Users/admin/Desktop/Claude Projects/Plazzaa Local/scripts/generate-image.js"
mkdir -p "$OUT"

STYLE="Editorial lifestyle photograph, shot on 35mm film, natural available light, slightly imperfect candid framing, documentary feel, rich true-to-life skin tones, subtle grain, no text, no logos, no watermark, not over-retouched, not stock-photo posed."

gen() {
  local name="$1" size="$2" prompt="$3"
  if [ -f "$OUT/$name.png" ]; then
    echo "SKIP $name (already exists)"
    return 0
  fi
  echo "GEN  $name ($size)"
  node "$GEN" --prompt "$prompt $STYLE" --out "$OUT/$name.png" --size "$size" --quality medium --n 1 \
    && echo "DONE $name" || echo "FAIL $name"
}

# ---------- Landing collage (Telescope-style scattered cards) ----------
gen "vi-rooftop-dinner" "1024x1536" \
  "Two Nigerian friends in their late twenties sharing dinner on a rooftop terrace in Victoria Island, Lagos at dusk, warm string lights overhead, the city skyline and lagoon behind them, glasses of wine and small plates on the table, one of them mid-laugh."

gen "suya-grill" "1024x1024" \
  "Close-up of a Nigerian suya grill at a Lagos night market, a vendor's hands turning spiced beef skewers over glowing charcoal, smoke catching the light, red onions and yaji pepper in the foreground, deep night background with bokeh."

gen "spa-treatment" "1024x1536" \
  "A calm massage treatment room in a Lagos wellness spa, a Nigerian woman lying on a treatment bed under a soft white towel while a therapist works, warm neutral walls, folded linen, a small bowl of oil, soft window light."

gen "lagos-nightlife" "1536x1024" \
  "Interior of a stylish Lagos lounge late at night, young Nigerian crowd dancing, a DJ silhouetted behind decks, warm amber and deep shadow, motion blur in the dancers, drinks catching the light."

gen "abuja-jabi-lake" "1536x1024" \
  "A young Nigerian couple walking along the Jabi Lake waterfront boardwalk in Abuja at golden hour, calm water, boats moored, palm trees and modern buildings across the lake, long warm shadows."

gen "art-gallery" "1024x1536" \
  "A Nigerian woman in a contemporary art gallery in Lagos standing before a large colourful abstract painting, polished concrete floor, white walls, daylight from clerestory windows, seen slightly from behind."

gen "beach-club" "1536x1024" \
  "A group of Nigerian friends at a Lagos beach club on the Atlantic coast in the afternoon, palm-thatch umbrellas, white sand, ocean waves behind, one pouring a drink, relaxed and unposed."

gen "brunch-table" "1024x1024" \
  "Overhead photograph of a Nigerian brunch spread on a marble table: jollof rice, fried plantain, small chops, grilled fish, chapman cocktails in tall glasses, two pairs of hands reaching in, bright daylight."

# ---------- Marketplace cards ----------
gen "ikoyi-garden-restaurant" "1536x1024" \
  "An elegant open-air garden restaurant in Ikoyi, Lagos in the early evening, tables under mature trees strung with warm lights, Nigerian diners seated and talking, waiter crossing the frame."

gen "padel-court" "1536x1024" \
  "Two Nigerian players mid-rally on a floodlit padel court in Lekki, Lagos at night, glass walls, blue court surface, motion in the swing, spectators sitting courtside."

gen "boutique-hotel-room" "1536x1024" \
  "A boutique hotel room in Lagos with warm wood furniture, cream linen bedding, woven raffia wall art, a rattan chair by a tall window with sheer curtains and late afternoon light."

gen "abuja-rooftop-lounge" "1536x1024" \
  "A rooftop lounge in Maitama, Abuja at blue hour, low seating around a fire feature, Nigerian friends in conversation, the quiet Abuja skyline and hills in the distance."

# ---------- Merchant side ----------
gen "salon-owner" "1024x1536" \
  "A Nigerian hair salon owner in her thirties braiding a client's hair in her Lagos salon, focused on the work, mirrors and products behind her, her phone face-up on the counter beside her, warm daylight."

gen "spa-reception" "1024x1536" \
  "A Nigerian spa owner standing at her reception desk with a tablet in hand, calm minimal interior with plants and warm wood, morning light through the entrance, looking up as if greeting someone."

gen "restaurant-owner" "1536x1024" \
  "A Nigerian restaurant owner in his forties standing in his small Lagos dining room before service, chairs neatly set, checking his phone, aprons on a hook, soft daylight through the window."

gen "barber-shop" "1024x1024" \
  "A Nigerian barber giving a young man a fade in a Lagos barbershop, clippers in hand, focused expression, mirrors and a row of empty chairs behind, natural light from a shopfront window."

echo "ALL IMAGE JOBS FINISHED"
ls -la "$OUT" | tail -20
