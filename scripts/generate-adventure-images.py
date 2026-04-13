#!/usr/bin/env python3
import urllib.request
import urllib.parse
import json
import sys

BASE = "http://localhost:3000/api/adventure-image"

ADVENTURES = [
    ("1",  "Wind Sports Adventure",
     "Luxury catamaran sailing at speed in crystal-clear Greek Aegean waters, person windsurfing in foreground, vivid blue sea, sunny day, professional travel photography"),
    ("2",  "Family Sailing School",
     "Happy family of parents and children learning to sail together on a luxury catamaran in calm Greek waters, certified instructor on deck, sunny Mediterranean day, lifestyle photography"),
    ("3",  "Yoga Wellness Retreat",
     "Woman doing a yoga warrior pose on the deck of a luxury sailing catamaran at golden sunrise, calm Aegean Sea, Greek islands in background, wellness lifestyle photography"),
    ("4",  "Cleansing Renewal",
     "Serene spa retreat aboard a luxury yacht anchored in a turquoise Greek cove, woman meditating on deck, holistic wellness, soft morning light, travel photography"),
    ("5",  "Greek Heritage Explorer",
     "Luxury sailing catamaran anchored in front of ancient Greek temple ruins on a rocky island, crystal blue Aegean Sea, cultural heritage, golden hour light, professional travel photography"),
    ("6",  "Culinary Traditions",
     "Professional chef preparing fresh Mediterranean seafood on a luxury yacht deck in Greece, colourful ingredients, Greek islands background, culinary travel photography"),
    ("7",  "Family Bonding Adventure",
     "Joyful family laughing and playing on the bow of a luxury catamaran at sunset, Greek islands silhouette in background, golden light, warm family travel photography"),
    ("8",  "Island Nightlife",
     "Vibrant Greek island harbour at night, luxury yacht moored at illuminated waterfront, lively open-air tavernas and bars, festive atmosphere, nightlife travel photography"),
    ("9",  "Sephardic Heritage Sailing",
     "Sailing catamaran approaching Thessaloniki harbour at sunrise, historic White Tower visible, cultural heritage journey, calm sea, professional travel photography"),
    ("10", "Mediterranean Flavors",
     "Elegant outdoor dining table on a luxury yacht deck, beautiful spread of Greek meze, fresh seafood, wine, sunset backdrop over Greek islands, food and travel photography"),
    ("11", "Greek Cooking Masters",
     "Cooking class on a luxury sailing catamaran, local Greek chef teaching guests to prepare traditional dishes, vibrant ingredients, Mediterranean sea background, lifestyle photography"),
    ("12", "Greek Islands Family Bike Adventure",
     "Family cycling along a scenic coastal path on a Greek island with a luxury catamaran visible in the bay below, sunny day, adventure travel photography"),
    ("13", "Ionian Fishing Island Discovery",
     "Fisherman hauling in a catch from a luxury yacht in the turquoise Ionian Sea near Zakynthos, cliffs and blue sea, golden light, adventure travel photography"),
    ("14", "Romantic Aegean Cruise",
     "Romantic couple sharing a candle-lit dinner on the deck of a luxury sailing catamaran, dramatic Aegean sunset over Greek islands, honeymoon travel photography"),
]

success = 0
fail = 0

for adventure_id, name, prompt in ADVENTURES:
    params = urllib.parse.urlencode({
        "adventureId": adventure_id,
        "name": name,
        "prompt": prompt,
    })
    url = f"{BASE}?{params}"
    print(f"Generating: {name} (id={adventure_id})...")
    try:
        with urllib.request.urlopen(url, timeout=60) as resp:
            data = json.loads(resp.read())
            img_url = data.get("url", "")
            if img_url.startswith("/adventures/"):
                print(f"  ✅  Saved → {img_url}")
                success += 1
            else:
                print(f"  ❌  Unexpected response: {data}")
                fail += 1
    except Exception as e:
        print(f"  ❌  Error: {e}")
        fail += 1

print(f"\nDone — {success} generated, {fail} failed.")
