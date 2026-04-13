#!/bin/bash

BASE="http://localhost:3000/api/adventure-image"

declare -A ADVENTURES=(
  ["1|Wind Sports Adventure"]="Luxury catamaran sailing at speed in crystal-clear Greek Aegean waters, person windsurfing in foreground, vivid blue sea, sunny day, professional travel photography"
  ["2|Family Sailing School"]="Happy family of parents and children learning to sail together on a luxury catamaran in calm Greek waters, certified instructor on deck, sunny Mediterranean day, lifestyle photography"
  ["3|Yoga & Wellness Retreat"]="Woman doing a yoga warrior pose on the deck of a luxury sailing catamaran at golden sunrise, calm Aegean Sea, Greek islands in background, wellness lifestyle photography"
  ["4|Cleansing & Renewal"]="Serene spa retreat aboard a luxury yacht anchored in a turquoise Greek cove, woman meditating on deck, holistic wellness, soft morning light, travel photography"
  ["5|Greek Heritage Explorer"]="Luxury sailing catamaran anchored in front of ancient Greek temple ruins on a rocky island, crystal blue Aegean Sea, cultural heritage, golden hour light, professional travel photography"
  ["6|Culinary Traditions"]="Professional chef preparing fresh Mediterranean seafood on a luxury yacht deck in Greece, colourful ingredients, Greek islands background, culinary travel photography"
  ["7|Family Bonding Adventure"]="Joyful family laughing and playing on the bow of a luxury catamaran at sunset, Greek islands silhouette in background, golden light, warm family travel photography"
  ["8|Island Nightlife"]="Vibrant Greek island harbour at night, luxury yacht moored at illuminated waterfront, lively open-air tavernas and bars, festive atmosphere, nightlife travel photography"
  ["9|Sephardic Heritage Sailing"]="Sailing catamaran approaching Thessaloniki harbour at sunrise, historic White Tower visible, cultural heritage journey, calm sea, professional travel photography"
  ["10|Mediterranean Flavors"]="Elegant outdoor dining table on a luxury yacht deck, beautiful spread of Greek meze, fresh seafood, wine, sunset backdrop over Greek islands, food and travel photography"
  ["11|Greek Cooking Masters"]="Cooking class on a luxury sailing catamaran, local Greek chef teaching guests to prepare traditional dishes, vibrant ingredients, Mediterranean sea background, lifestyle photography"
  ["12|Greek Islands Family Bike Adventure"]="Family cycling along a scenic coastal path on a Greek island with a luxury catamaran visible in the bay below, sunny day, adventure travel photography"
  ["13|Ionian Fishing & Island Discovery"]="Fisherman hauling in a catch from a luxury yacht in the turquoise Ionian Sea near Zakynthos, cliffs and blue sea, golden light, adventure travel photography"
  ["14|Romantic Aegean Cruise"]="Romantic couple sharing a candle-lit dinner on the deck of a luxury sailing catamaran, dramatic Aegean sunset over Greek islands, rose petals, honeymoon travel photography"
)

SUCCESS=0
FAIL=0

for KEY in "${!ADVENTURES[@]}"; do
  ID="${KEY%%|*}"
  NAME="${KEY##*|}"
  PROMPT="${ADVENTURES[$KEY]}"

  ENCODED_NAME=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$NAME'))")
  ENCODED_PROMPT=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$PROMPT'''))")

  echo "Generating: $NAME (id=$ID)..."
  RESPONSE=$(curl -s "${BASE}?adventureId=${ID}&name=${ENCODED_NAME}&prompt=${ENCODED_PROMPT}")
  URL=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('url','ERROR'))" 2>/dev/null)

  if [[ "$URL" == /adventures/* ]]; then
    echo "  ✅ Saved: $URL"
    ((SUCCESS++))
  else
    ERROR=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('details', d.get('error','unknown')))" 2>/dev/null)
    echo "  ❌ Failed: $ERROR"
    ((FAIL++))
  fi
done

echo ""
echo "Done — $SUCCESS generated, $FAIL failed."
