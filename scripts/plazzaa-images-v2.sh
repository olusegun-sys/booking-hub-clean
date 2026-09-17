#!/usr/bin/env zsh
# Plazzaa photography, take two.
#
# Every prompt follows the same recipe so the results read as photographs
# rather than renders:
#   subject + natural imperfections + signs of use + environmental
#   irregularities + believable action or moment + directional lighting +
#   camera position + lens behaviour + photography genre + realism constraints
#
# Business-side imagery is restaurants, spas and beauty, per the brief.

set -u
OUT="/Users/admin/Desktop/Claude Projects/Plazzaa Local/client/src/assets/plazzaa"
GEN="/Users/admin/Desktop/Claude Projects/Plazzaa Local/scripts/generate-image.js"
mkdir -p "$OUT"

REAL="Shot on 35mm colour negative film, grain visible in the shadows, slight halation on highlights, mixed colour temperature left uncorrected, one plane of focus with everything else falling off, minor motion blur where people move. Unposed documentary editorial photography. No text, no logos, no watermark, no captions. Skin keeps its real texture: pores, shine, uneven tone, stray hairs. Nothing is styled to perfection."

gen() {
  local name="$1" size="$2" quality="$3" prompt="$4"
  if [ -f "$OUT/$name.jpg" ] && [ "${FORCE:-0}" != "1" ]; then
    echo "SKIP $name"
    return 0
  fi
  echo "GEN  $name ($size, $quality)"
  node "$GEN" --prompt "$prompt $REAL" --out "$OUT/$name.png" --size "$size" --quality "$quality" --n 1 \
    && sips -s format jpeg -s formatOptions 76 -Z 1600 "$OUT/$name.png" --out "$OUT/$name.jpg" >/dev/null 2>&1 \
    && rm -f "$OUT/$name.png" \
    && echo "DONE $name" || echo "FAIL $name"
}

# ---------------------------------------------------------------
# Full-bleed moments for the landing page
# ---------------------------------------------------------------
gen "vi-rooftop-dinner" "1536x1024" "high" \
  "Two friends in their late twenties at a rooftop restaurant table in Victoria Island, Lagos, one leaning back mid-laugh with a hand half-covering her mouth. Water rings and a spilled drop of red wine on the table, a bent straw, one napkin fallen to the floor, fingerprints on the glasses. The string lights above have two dead bulbs and the cable sags; a plastic chair is stacked against the parapet behind them; an air conditioning unit and a drying rack are visible on the next roof. Golden hour sun comes low from camera right, raking across the table and blowing out one edge of the frame, the lagoon skyline hazy behind. Camera at seated eye level, slightly off to one side, 35mm at f/2, shallow focus on her hands with the skyline soft, mild lens flare bleeding in from the right."

gen "suya-grill" "1024x1024" "high" \
  "A suya vendor's hands turning spiced beef skewers over a charcoal drum at a Lagos roadside stand at night. His fingers are stained with yaji pepper, one knuckle scarred, the grill grate warped and crusted with old fat, the drum rusted through in places and patched with wire. Onion skins, a torn newspaper wrapper and a bottle cap litter the plywood counter; a hand-held cardboard fan rests beside it. He is lifting one skewer to check the underside. The only light is the charcoal glow from below and a bare bulb hanging off to camera left, so his face is half lost in shadow and smoke drifts through the beam. Camera close, just above the grill looking down at a slight angle, 50mm at f/1.8, smoke softening the background into black."

gen "spa-treatment" "1024x1536" "high" \
  "A massage therapist working the shoulder of a client lying face down in a small Lagos day spa room. The towel is creased and slightly off-centre, one corner hanging; the oil bottle is half empty with a drip down its side; the vinyl treatment bed has a taped repair at the edge; the wall paint is scuffed near the floor and a socket hangs loose. The therapist is mid-press, weight through her forearm, the client's face relaxed in the cradle. Warm light comes through a slatted window from camera left, laying stripes across the client's back, the far corner of the room in near darkness. Camera at standing height at the head of the bed looking down the body, 50mm at f/2.5, focus on the therapist's hands."

gen "lagos-nightlife" "1536x1024" "high" \
  "A crowd dancing in a small Lagos lounge just after midnight, arms up, one woman caught mid-turn with her braids swinging. Condensation rings and a knocked-over cup on the nearest table, a phone face-up recording, scuffed floor, a speaker stack with gaffer tape over a cracked corner, a fire extinguisher visible on the wall. The DJ is a silhouette behind the decks. Light is a single warm wash from the back of the room plus a cold phone screen underlighting one face; everything else falls into shadow. Camera shooting from inside the crowd at shoulder height, 28mm at f/2, visible motion blur in the hands and a slight tilt to the frame."

gen "abuja-jabi-lake" "1536x1024" "high" \
  "A couple walking the Jabi Lake waterfront in Abuja late in the afternoon, one carrying a takeaway cup, the other checking his phone, half a step apart. Cracked and repaired paving with weeds in the joints, a faded railing with rust bleeding down the concrete, a flyer taped to a post curling at the corner, litter caught against a kerb. Two moored boats with worn paint sit low in the water. The sun is behind them, low and hazy, rimming their shoulders and flaring across the lens, the foreground in cool shade. Camera behind and below them at hip height, 35mm at f/4, focus on their feet and the paving, the far bank soft."

gen "beach-club" "1536x1024" "high" \
  "Friends around a low table at a Lagos beach bar in the afternoon, one pouring from a bottle, another brushing sand off her leg, the third half out of frame reaching for a plate. Sand on everything, a wobbly table leg propped with a folded coaster, the thatch umbrella patchy with a section missing, a faded plastic chair with a cracked arm, cigarette ends and a bottle cap in the sand. Hard overhead sun leaves harsh dappled shadows through the thatch, the sea a bright overexposed band behind them. Camera low, almost at table height on the sand, 35mm at f/5.6, a fingerprint smudge softening one corner of the frame."

gen "brunch-table" "1024x1024" "high" \
  "Overhead view of a Nigerian weekend brunch mid-meal: jollof rice with a spoon left in it, fried plantain with one piece already gone, grilled fish picked at from one side, a chapman with condensation running down the glass onto a paper napkin that has gone translucent. Crumbs and a smear of pepper sauce on the marble, a chipped plate edge, mismatched cutlery, a phone face-down beside a set of keys. Two hands reach in from opposite sides, one serving, one holding a fork. Window light from camera left with a hard shadow line falling across the table. Camera directly above, 50mm at f/4, the far edge of the table slipping out of focus."

gen "ikoyi-garden-restaurant" "1536x1024" "high" \
  "An open-air garden restaurant in Ikoyi, Lagos in the early evening, a waiter crossing the frame with a tray and motion blur on his arm, diners at two tables in conversation. Mismatched chairs, a cloth clipped down against the wind, leaf litter and fallen blossom on the paving, an extension cable taped along a tree trunk feeding the lights, one lamp out. Warm bulb light from above mixed with the last cold daylight, so the two colour temperatures fight each other across the frame. Camera at standing height at the edge of the terrace looking in, 35mm at f/2.8, focus on the middle table."

gen "padel-court" "1536x1024" "high" \
  "Two players mid-rally on a floodlit padel court in Lekki at night, one lunging low with the ball just off the strings. Scuff marks and shoe skids across the blue surface, dust in the corners, the glass wall smeared with handprints and a chip in one panel, a water bottle and towel dumped by the door, the net sagging slightly at one side. Floodlights from the top corners throw double shadows and blow out the top of the glass; insects swarm in the beams. Camera outside the glass shooting through it at chest height, 50mm at f/2.8, reflections partially obscuring the near player."

gen "boutique-hotel-room" "1536x1024" "high" \
  "A small boutique hotel room in Lagos in the morning, bed slept in and roughly pulled together, one pillow still dented, a towel over the chair back, a suitcase open on the floor with clothes spilling. Scuffed skirting, a picture hanging a few degrees off level, a cable running along the wall to a socket, a water glass with a lip mark on the nightstand. Hard morning sun comes through a gap in the curtains in a single bright slab across the bed, the rest of the room in shadow. Camera from the doorway at standing height, 35mm at f/4, slight wide-angle stretch at the frame edges."

gen "abuja-rooftop-lounge" "1536x1024" "high" \
  "A rooftop lounge in Maitama, Abuja at blue hour, four people around a low fire table, one leaning in to say something, another laughing with her head back. Cushions flattened and slightly grubby, a cigarette burn on the arm of a couch, a tray of empties not yet cleared, a cable tie holding a heat lamp to the railing. Fire light from below on their faces, the sky a deep cold blue behind, a security light glaring white from the stairwell at frame left. Camera seated among them at the table, 28mm at f/2, one person's shoulder soft in the immediate foreground."

gen "art-gallery" "1024x1536" "high" \
  "A woman standing close to a large abstract painting in a Lagos gallery, head tilted, weight on one hip, bag strap slipping off her shoulder. Scuffs along the base of the white wall, a patched and repainted section catching the light differently, a laminated wall label with a bubble under the film, a folding chair left by the doorway. Daylight from a high window falls in one hard shaft across the painting, leaving her mostly in shade with a bright edge along her arm. Camera behind and to the side at eye level, 35mm at f/2.8, focus on the canvas texture with her softly out of focus."

# ---------------------------------------------------------------
# Business side: restaurants, spas, beauty
# ---------------------------------------------------------------
gen "salon-owner" "1024x1536" "high" \
  "A Lagos salon owner in her thirties parting a client's hair for braids, a rat-tail comb held in her teeth, edge gel drying on the back of her hand, clipped hair on the floor around the chair. The mirror is cloudy at the edges with tape residue in one corner, product bottles crowded and half-used with labels peeling, a hairdryer cable taped at the join, a handwritten price list curling on the wall. Her phone is propped face-up on the counter beside her. Late afternoon light rakes in from a shopfront window at camera left, hard-edged across the mirror, the back of the salon dim. Camera at eye level just behind the client's shoulder, 35mm at f/2.8, focus on her hands."

gen "spa-reception" "1024x1536" "high" \
  "A spa owner behind her reception counter in Lekki, mid-morning, looking up from a tablet as someone comes in, one hand still resting on the screen. A ring stain on the counter, a pen on a string, an appointment book open with pencil corrections, a dying plant with two yellow leaves, a stack of towels not quite square, a cardboard box not yet unpacked by her feet. Daylight floods from the glass entrance behind her, blowing out the doorway and leaving her face in soft shadow with a bright rim along her shoulder. Camera at standing height from inside the room, 35mm at f/2.5, slight flare from the doorway."

gen "restaurant-owner" "1536x1024" "high" \
  "A restaurant owner in his forties standing in his small Lagos dining room before service, sleeves pushed up, phone in one hand, the other resting on a chairback. Chairs set but two out of line, a cloth with a faint stain, cutlery still wrapped in a napkin bundle at one end, a chalkboard menu half wiped, an apron on a hook with the strings trailing, a mop bucket just inside the kitchen door. Morning light from a side window makes a hard band across the tables while the kitchen doorway stays dark. Camera at standing height from the far side of the room, 35mm at f/2.8, focus on him with the foreground table soft."

gen "nail-studio" "1024x1024" "high" \
  "A nail technician finishing a gel manicure in a small Lagos studio, her client's hand under the lamp, a smudge of polish on the tech's own thumb. Polish drips dried down two bottle necks, a dusty desk fan, cotton pads and a used file on the table, a cracked phone screen playing a video propped against a jar, a plug adapter stacked two deep. A desk lamp from camera right is the main light, throwing a hard shadow of both hands across the table, the room behind falling to dark. Camera close over the table at a low angle, 50mm at f/2, focus on the fingertips."

gen "barber-shop" "1024x1024" "high" \
  "A barber cutting a young man's fade in a Lagos shop, clippers in one hand, the other steadying the client's head, hair clippings on the cape and floor. The mirror has a crack in one corner taped over, the counter is crowded with half-empty bottles and a talc-dusted brush, a fan cage is furred with dust, an old calendar hangs two years out of date. A shopfront window at camera left gives hard afternoon light across the client's shoulder while the back of the shop stays dim under a flickering tube. Camera at eye level over the barber's shoulder, 35mm at f/2.8, focus on the clipper line."

gen "makeup-studio" "1024x1536" "high" \
  "A makeup artist working on a client's cheek with a brush in a small Lagos studio, the client's eyes closed, shoulders draped with a tissue-tucked cape. Palettes open and swatched, a brush roll unfurled with bristles splayed, fingerprints and powder dust on the mirror, ring light stand with gaffer tape on the base, a wig on a stand slightly askew. The ring light is on but the strongest light is daylight from a window at camera right, splitting the client's face into bright and shadow. Camera beside them at seated eye level, 50mm at f/2, focus on the brush tip touching skin."

gen "restaurant-kitchen" "1536x1024" "high" \
  "A cook plating in a tight Lagos restaurant kitchen during service, one hand steadying the plate, the other wiping the rim with a cloth. Splatter marks up the wall tiles, a scorched cloth, a ticket rail with curling dockets, pans stacked unevenly, a taped-up fridge handle, a floor mat with a turned-up corner. Steam rises through a hard overhead strip light while the pass beyond glows warmer, leaving the near counter in contrast. Camera across the pass at chest height, 35mm at f/2.8, steam softening the far end of the kitchen."

echo "ALL IMAGE JOBS FINISHED"
ls "$OUT" | wc -l
