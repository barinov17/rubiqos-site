// rubiqos.com · proforma data and card rendering, shared by /proforma/ (all cards) and /entity/?id=… (one entity's page).
// Every product and service is an entity with an id, an operator, what it produces, what it consumes, and a live block fed by
// the simulation (the demo page running headless in a hidden frame, window.__live). 2026-10-19.
const Z = { Z01: '#E8D9B0', Z02: '#C9B27C', Z03: '#D98C5F', Z04: '#6FA8C9', Z05: '#9CC58A', Z06: '#7FB8A6', Z07: '#9C83BE', Z08: '#8FA6BA', Z09: '#9C9890', Z10: '#E3D3BC', Z11: '#C97A52' };
const ZONE_NAME = { Z01: 'Beach Hotel', Z02: 'Central hill', Z03: 'Marina Village', Z04: 'Marina', Z05: 'East villas', Z06: 'Wellness and sport', Z07: 'Events', Z08: 'Arrivals and fleet', Z09: 'Back of house', Z10: 'Residences', Z11: 'Beach Club' };
const OCC = 0.70;   // average occupancy applied to every product
// Operators: one manager per object. `id` is the variable the system (and later the agent) is addressed by.
const OPERATORS = [
  { id: 'hotels', name: 'Hotels manager', note: 'Both hotels: rooms, housekeeping, arrivals and departures.' },
  { id: 'villas', name: 'Villas manager', note: 'All villas: butlers, housekeeping, villa breakfasts.' },
  { id: 'residences', name: 'Residences manager', note: 'Both towers: owners, the rental pool, concierge.' },
  { id: 'marina', name: 'Marina manager', note: 'Berths, AIS matching, the guest dock, shore power and water.' },
  { id: 'village', name: 'Marina Village manager', note: 'F&B outlets, shops, the market and the village square.' },
  { id: 'restaurant', name: 'Restaurant manager', note: 'The Restaurant: covers, the wine tasting.' },
  { id: 'spa', name: 'Spa manager', note: 'Treatments and the wellness programme.' },
  { id: 'events', name: 'Events manager', note: 'The programme at the Events Rotunda.' },
  { id: 'beachclub', name: 'Beach Club manager', note: 'Sunbeds, beach F&B, the DJ sunset; the Members Club.' },
  { id: 'sport', name: 'Sports club manager', note: 'Gym, courts, classes and clinics.' },
  { id: 'excursions', name: 'Excursions manager', note: 'Snorkelling and sunset trips by the programme; the excursion dock.' },
  { id: 'fleet', name: 'Fleet manager', note: 'Pods, shuttles, carts, trucks, robots and boats: dispatch, charging, maintenance.' },
  { id: 'stores', name: 'Warehouses and laundry manager', note: 'Receives the supply vessel, stores and issues to the kitchens; linen in and out; the dark store.' },
  { id: 'staffacc', name: 'Staff accommodation manager', note: 'Beds, canteen and the shift changes at 07:00, 15:00 and 23:00.' },
  { id: 'waste', name: 'Waste management manager', note: 'Collection rounds, sorting, the night waste run, the transfer station at the dock.' },
  { id: 'infra', name: 'Infrastructure manager', note: 'Power, desalination, sewage, the network and the operator console.' },
  { id: 'guestservices', name: 'Guest services manager', note: 'Concierge, butlers and the guest-app desk.' },
  { id: 'medical', name: 'Medical officer', note: 'The clinic, the ambulance pod, evacuations.' },
  { id: 'security', name: 'Safety and security manager', note: 'Control room, patrols, lifeguards, fire crew.' },
];
const OP = Object.fromEntries(OPERATORS.map(o => [o.id, o]));
// Products.  capacity = most people at once; turns = visits a day per place (lodging 1); objects = what the capacity is made of;
// staff = positions (FTE); per = per guest-day or visit: water L, energy kWh, food kg, laundry kg, waste kg; sewage = 85 % of water.
// live = the product names the simulation counts guests under (several for a card that spans two towers).
const PRODUCTS = [
  { id: 'beach-hotel', name: 'Beach Hotel', zone: 'Z01', op: 'hotels', unit: 'guests', live: ['Beach Hotel'], what: 'The main hotel on the beach: three room blocks and a restaurant.',
    produces: 'Room nights · breakfast and the hotel restaurant · the beach in front', capacity: 528, objects: { 'Deluxe rooms': 140, 'Premier sea-view rooms': 60, 'One-bedroom suites': 32, 'Signature suites': 8 }, staff: 270, per: { water: 500, energy: 42, food: 2.0, laundry: 4, waste: 2.5 } },
  { id: 'hill-hotel', name: 'Hill Hotel', zone: 'Z02', op: 'hotels', unit: 'guests', live: ['Hill Hotel'], what: 'Boutique hotel of low blocks over the central hill; large rooms, views.',
    produces: 'Room nights · suites with terraces', capacity: 280, objects: { 'Hillside rooms': 56, 'Terrace rooms': 36, 'One-bedroom suites': 22, 'Two-bedroom suites': 6 }, staff: 135, per: { water: 500, energy: 42, food: 2.0, laundry: 4, waste: 2.5 } },
  { id: 'villas', name: 'East Villas', zone: 'Z05', op: 'villas', unit: 'guests', live: ['Villas'], what: 'Private villas on the eastern cape, owned or let, served by butlers.',
    produces: 'Villa nights · butler service · villa breakfasts', capacity: 144, objects: { 'Four-bedroom villas': 18 }, staff: 40, per: { water: 600, energy: 50, food: 1.5, laundry: 4, waste: 2.5 } },
  { id: 'residences', name: 'Branded Residences', zone: 'Z10', op: 'residences', unit: 'residents', live: ['Residences BR1', 'Residences BR2'], what: 'Apartment towers by the village; most units in the hotel rental pool.',
    produces: 'Apartment nights (rental pool) · owner services · concierge', capacity: 812, objects: { 'One-bedroom apartments': 62, 'Two-bedroom apartments': 94, 'Three-bedroom apartments': 42, 'Penthouses': 10 }, staff: 95, per: { water: 300, energy: 25, food: 1.0, laundry: 1.5, waste: 2.0 } },
  { id: 'village', name: 'Marina Village', zone: 'Z03', op: 'village', unit: 'people at once', turns: 3, live: ['Marina Village'], what: 'Pedestrian heart: cafes, restaurants, shops, the market, an apart-hotel.',
    produces: 'Covers at four F&B outlets · retail · the island market', capacity: 600, objects: { 'Restaurant seats': 240, 'Shops': 17, 'Market stalls': 20, 'Apart-hotel units': 40 }, staff: 85, per: { water: 25, energy: 6, food: 0.7, laundry: 0.1, waste: 0.5 } },
  { id: 'restaurant', name: 'Restaurant', zone: 'Z02', op: 'restaurant', unit: 'people at once', turns: 4, live: ['Restaurant'], what: 'Signature round pavilion on the hill: dinner service, the wine tasting.',
    produces: 'Covers · the wine programme', capacity: 220, objects: { 'Seats': 220, 'Private dining rooms': 2 }, staff: 60, per: { water: 30, energy: 8, food: 0.9, laundry: 0.3, waste: 0.6 } },
  { id: 'beach-club', name: 'Beach Club', zone: 'Z11', op: 'beachclub', unit: 'people at once', turns: 1.5, live: ['Beach Club'], what: 'Day club on the south beach: sunbeds, cabanas, restaurant, bar, DJ.',
    produces: 'Sunbed days · covers · the DJ sunset', capacity: 320, objects: { 'Sunbeds': 180, 'Cabanas': 12, 'Restaurant seats': 90, 'Bar seats': 40 }, staff: 40, per: { water: 60, energy: 8, food: 0.9, laundry: 1.0, waste: 0.6 } },
  { id: 'members-club', name: 'Members Club', zone: 'Z01', op: 'beachclub', unit: 'people at once', turns: 2, live: ['Members Club'], what: 'Beach club west of the hotel for mainland members and residents.',
    produces: 'Memberships · covers · the club beach', capacity: 260, objects: { 'Dining seats': 100, 'Lounge and bar seats': 60, 'Pavilion seats': 40, 'Pool deck places': 60 }, staff: 30, per: { water: 40, energy: 8, food: 0.8, laundry: 0.8, waste: 0.5 } },
  { id: 'spa', name: 'Spa & Wellness', zone: 'Z06', op: 'spa', unit: 'people at once', turns: 4, live: ['Spa & Wellness'], what: 'Spa on the second hill: treatment rooms, thermal area, longevity clinic.',
    produces: 'Treatments · thermal passes · the longevity programme', capacity: 90, objects: { 'Treatment rooms': 16, 'Couple suites': 6, 'Longevity clinic rooms': 2, 'Thermal area places': 40, 'Relaxation lounge places': 20 }, staff: 32, per: { water: 180, energy: 12, food: 0.2, laundry: 2.0, waste: 0.3 } },
  { id: 'sport', name: 'GYM & Sports', zone: 'Z06', op: 'sport', unit: 'people at once', turns: 4, live: ['GYM & Sports'], what: 'Gyms, a studio, tennis and pickleball courts, a clubhouse; classes.',
    produces: 'Sessions · court hours · classes and clinics', capacity: 130, objects: { 'Gym places': 40, 'Studio places': 20, 'Tennis courts': 3, 'Pickleball courts': 6, 'Clubhouse seats': 34 }, staff: 15, per: { water: 40, energy: 5, food: 0.1, laundry: 0.5, waste: 0.2 } },
  { id: 'marina', name: 'Marina', zone: 'Z04', op: 'marina', unit: 'people aboard', live: ['Marina'], what: 'Yacht marina behind the breakwater, three berth sizes; the guest dock.',
    produces: 'Berth nights · shore power and water · the guest dock', units: [ { name: 'Berths for boats to 15 m', n: 50, pax: 4, per: { water: 200, energy: 60, food: 5, laundry: 2, waste: 8 } },
             { name: 'Berths for boats to 35 m', n: 32, pax: 8, per: { water: 1000, energy: 400, food: 15, laundry: 6, waste: 20 } },
             { name: 'Berths for boats to 80 m', n: 8, pax: 14, per: { water: 5000, energy: 2400, food: 40, laundry: 15, waste: 50 } } ],
    objects: {}, staff: 28, capLabel: '90 berths · 50 S, 32 M, 8 L', avgLabel: '63 berths occupied · ≈ 360 people aboard' },
  { id: 'events', name: 'Events Rotunda', zone: 'Z07', op: 'events', unit: 'people at once', turns: 1.5, live: ['Events Rotunda'], what: 'Ring hall around a courtyard: exhibitions, talks, concerts, dinners.',
    produces: 'Events (3 a day) · tickets and buyouts · catering', capacity: 540, objects: { 'Hall places': 300, 'Courtyard places': 120, 'Pavilion places': 120 }, staff: 10, per: { water: 15, energy: 4, food: 0.4, laundry: 0.1, waste: 0.3 } },
];
// Services: produces = output a day as sized in the plan; consumes = inputs a day (industry ratios, stated); key/capacity feed the balance.
// liveFn builds the live block from the snapshot; loadBase = plan load (%) scaled by the guests on the island when there is no balance key.
const SERVICES = [
  { id: 'power', name: 'Power plant', zone: 'Z09', op: 'infra', what: 'Gas generators plus solar on the back-of-house roofs; battery buffer.',
    produces: { 'Peak power': '9 MW', 'Energy a day': '95,000 kWh', 'Solar share': '18 %' }, consumes: { 'Gas a day': '≈ 19,000 m³ (0.24 m³/kWh generated)', 'Fuel autonomy': '14 days' }, key: 'energy', capacity: 95000 },
  { id: 'desal', name: 'Desalination (RO)', zone: 'Z09', op: 'infra', what: 'Reverse-osmosis plant with potable storage tanks.',
    produces: { 'Potable water a day': '900 m³', 'Potable storage': '1,200 m³' }, consumes: { 'Energy': '≈ 3,150 kWh a day (3.5 kWh/m³)', 'Sea water intake': '≈ 2,250 m³ a day (40 % recovery)' }, key: 'water', capacity: 900 },
  { id: 'sewage', name: 'Sewage treatment', zone: 'Z09', op: 'infra', what: 'Treatment plant; reclaimed water goes to irrigation.',
    produces: { 'Treated a day': '700 m³', 'Reclaimed for irrigation': '450 m³' }, consumes: { 'Energy': '≈ 420 kWh a day (0.6 kWh/m³)' }, key: 'sewage', capacity: 700 },
  { id: 'network', name: 'Network and connectivity', zone: 'Z09', op: 'infra', what: 'Two masts (not on the plan yet): private 5G, Wi-Fi, fibre ring.',
    produces: { 'Masts': 2, 'Coverage': 'the island and the marina basin', 'Backbone': '10 Gbit fibre ring', 'Devices served (plan)': '≈ 6,000' }, consumes: { 'Energy': '≈ 900 kWh a day', 'Mainland link': 'submarine fibre, microwave backup' },
    liveFn: L => { const F = L.fleet; const veh = Object.values(F).reduce((a, r) => a + r.n, 0); const guests = Object.values(L.products).reduce((a, b) => a + b, 0);
      const dev = Math.round(guests * 2.2 + L.onShift * 1.1 + veh * 3 + 400); const a = Math.round(100 * dev * 0.55 / 3300), b = Math.round(100 * dev * 0.45 / 2700);   // 400 fixed sensors and cameras; mast A serves the west (marina, village, back of house), mast B the east
      return [['Load', Math.round(100 * dev / 6000) + ' %'], ['Devices online', dev.toLocaleString('en-US')], ['Mast A (west)', a + ' %'], ['Mast B (east)', b + ' %']]; } },
  { id: 'stores', name: 'Warehouse and cold chain', zone: 'Z09', op: 'stores', what: 'Warehouse bar: prep kitchen, cold and dry stores; receives the vessel.',
    produces: { 'Food throughput a day': '4.5 t', 'Meals prepared a day': '4,100', 'Cold storage': '600 m²', 'Dry storage': '900 m²' }, consumes: { 'Supply calls a week': 2, 'Energy (cold rooms)': '≈ 1,800 kWh a day' }, key: 'food', capacity: 4.5,
    liveFn: L => [['Supply vessel', L.reception.vesselDocked ? 'at the dock, unloading' : (L.reception.vessel || '').replace(/^At the mainland port · /, '') || '—']] },
  { id: 'darkstore', name: 'Dark Store', zone: 'Z09', op: 'stores', what: 'Guest-app orders picked and packed for delivery; in the warehouse for now.',
    produces: { 'Orders a day (plan)': '≈ 600', 'SKUs': '1,200', 'Pick to door': '≤ 30 min' }, consumes: { 'Stock': 'from the warehouse, daily', 'Energy': '≈ 600 kWh a day' }, loadBase: 70,
    liveFn: L => [['Orders fulfilled today', L.ops.deliveries]] },
  { id: 'laundry', name: 'Laundry', zone: 'Z09', op: 'stores', what: 'Central laundry in the warehouse bar; linen out and back daily.',
    produces: { 'Linen a day': '5,000 kg', 'Turnaround': '6 h' }, consumes: { 'Water': '≈ 75 m³ a day (15 L/kg)', 'Energy': '≈ 5,000 kWh a day (1 kWh/kg)' }, key: 'laundry', capacity: 5000 },
  { id: 'staffacc', name: 'Staff accommodation', zone: 'Z09', op: 'staffacc', what: 'Four-floor block with 420 beds; the rest commute by staff shuttle.',
    produces: { 'Beds': 420, 'Staff shuttle': 'mainland, 3 runs a shift' }, consumes: { 'Water': '≈ 48 m³ a day', 'Energy': '≈ 2,150 kWh a day' }, key: 'staff', capacity: 900,
    liveFn: L => [['Staff on shift', L.onShift], ['Shift', L.hour >= 7 && L.hour < 15 ? 'morning 07–15' : L.hour >= 15 && L.hour < 23 ? 'evening 15–23' : 'night 23–07'], ['Load', Math.round(100 * L.onShift / 330) + ' %']] },
  { id: 'canteen', name: 'Staff canteen', zone: 'Z09', op: 'staffacc', what: 'Staff canteen in the accommodation block: three meals at the shift changes.',
    produces: { 'Meals a day': '1,000', 'Seats': 160, 'Service windows': '06:00–08:00 · 14:00–16:00 · 22:00–24:00' }, consumes: { 'Food': '≈ 0.4 t a day (from the prep kitchen)', 'Water': '≈ 12 m³ a day', 'Energy': '≈ 350 kWh a day' },
    liveFn: L => { const h = L.hour, open = (h >= 6 && h < 8) || (h >= 14 && h < 16) || (h >= 22); const p = open ? Math.min(100, Math.round(100 * L.onShift * 0.5 / 160)) : 10;
      return [['Load', p + ' %'], ['Service', open ? 'open · shift meal' : 'closed · next ' + (h < 6 ? '06:00' : h < 14 ? '14:00' : h < 22 ? '22:00' : '06:00')], ['Staff on the island', L.onShift]]; } },
  { id: 'waste', name: 'Waste management', zone: 'Z09', op: 'waste', what: 'Sorting, compactors and the night run to the dock transfer station.',
    produces: { 'Waste handled a day': '5 t', 'Recycled': '40 %', 'Night run': '23:00–05:00' }, consumes: { 'Energy': '≈ 400 kWh a day' }, key: 'waste', capacity: 5,
    liveFn: L => [['Night run', L.hour >= 23 || L.hour < 5 ? 'running' : 'from 23:00']] },
  { id: 'dock', name: 'Service dock', zone: 'Z04', op: 'stores', what: 'Supply vessel berth with crane; containers go straight onto trucks.',
    produces: { 'Vessel capacity': '9 t', 'Unloading': '2 h', 'Fuel bunkering': 'yes' }, consumes: { 'Calls a week': 'Monday and Thursday 08:00' },
    liveFn: L => [['Vessel', L.reception.vesselDocked ? 'docked, unloading' : 'at sea / mainland'], ['Next call', (L.reception.vessel.match(/next call (.+)$/) || [, '—'])[1]]] },
  { id: 'guestservices', name: 'Guest services', zone: 'Z08', op: 'guestservices', what: 'Concierge, butlers and the guest-app desk: the human layer on call.',
    produces: { 'Requests a day (plan)': '≈ 1,500', 'Butlers': 24, 'Concierge desks': 3, 'Answer time': '≤ 2 min' }, consumes: { 'Energy': '≈ 150 kWh a day' }, loadBase: 65,
    liveFn: L => [['Pod calls today', L.ops.buggyRides], ['Guests on the island', fmt(Object.values(L.products).reduce((a, b) => a + b, 0))]] },
  { id: 'medical', name: 'Medical service', zone: 'Z08', op: 'medical', what: 'Island clinic 24 h, ambulance pod, helicopter evacuation agreement.',
    produces: { 'Clinic': '24 h, doctor + 2 nurses', 'Consultations a day (plan)': '≈ 25', 'Evacuation': 'helicopter, 20 min to the mainland' }, consumes: { 'Energy': '≈ 200 kWh a day', 'Water': '≈ 3 m³ a day' }, loadBase: 35,
    liveFn: L => [['On duty', L.hour >= 8 && L.hour < 20 ? 'doctor, 2 nurses' : 'doctor on call, nurse'], ['Cases today (plan rate)', Math.round(25 * Math.min(1, Math.max(0, (L.hour - 6) / 18)))]] },
  { id: 'security', name: 'Safety and security', zone: 'Z08', op: 'security', what: 'Control room, patrols, lifeguards and fire crew; face and key access.',
    produces: { 'Control room': '24 h', 'Patrols': '2 land, 1 marine', 'Lifeguards': '4 by day', 'Fire crew': 6 }, consumes: { 'Energy': '≈ 400 kWh a day', 'Cameras and sensors': '≈ 400 devices' }, loadBase: 45,
    liveFn: L => [['Lifeguards', L.hour >= 8 && L.hour < 19 ? 'on both beaches' : 'off duty, beaches closed'], ['Events watched', L.events.length ? L.events.map(e => e.split(' · ')[0]).join(', ') : '—']] },
  // the marina's own infrastructure (founder 2026-10-19): shown in the Marina category with the berths
  { id: 'marina-support', name: 'Marina support building', zone: 'Z04', op: 'marina', what: 'Harbour office, shore power and water distribution, fuel, pump-out, crew facilities, chandlery.',
    produces: { 'Shore power connections': 90, 'Fuel': 'diesel and petrol', 'Pump-out and water': 'every berth', 'Harbour office': '24 h' }, consumes: { 'Energy (distributed to berths)': '≈ 30,000 kWh a day at full occupancy', 'Water (to berths)': '≈ 60 m³ a day' }, loadBase: 60,
    liveFn: L => { const M = L.marina; return [['Load', Math.round(100 * M.moored / M.berths) + ' %'], ['Berths on shore power', `${M.moored} of ${M.berths}`], ['Movements left today', `${M.arrivalsLeft} in · ${M.departuresLeft} out`]]; } },
  { id: 'guest-dock', name: 'Guest arrivals dock', zone: 'Z04', op: 'hotels', what: 'The shuttle pier and the arrivals pavilion: face check-in, digital key, luggage to the room.',
    produces: { 'Arrivals a day (plan)': '≈ 500', 'Shuttle landings a day': 24, 'Check-in': 'face check-in, digital key' }, consumes: { 'Water': '≈ 5 m³ a day', 'Energy': '≈ 300 kWh a day' }, loadBase: 55,
    liveFn: L => [['Arrivals today', L.ops.arrivals], ['Departures today', L.ops.departures]] },
  { id: 'excursion-terminal', name: 'Excursion terminal', zone: 'Z04', op: 'excursions', what: 'Pier and booking desk for the snorkelling and sunset trips; departures by the event programme.',
    produces: { 'Trips a day': 2, 'Seats a trip': 12, 'Booking': 'in the guest app, weather cancels' }, consumes: { 'Energy': '≈ 60 kWh a day' }, loadBase: 40,
    liveFn: L => [['Now', (L.reception.excursion || '—').replace(/^Excursion boat · /, '')]] },
];
// Categories (founder 2026-10-19): the cards are grouped, not listed by zone
const PRODUCT_GROUPS = [
  { title: 'Accommodation', ids: ['beach-hotel', 'hill-hotel', 'villas', 'residences'] },
  { title: 'Marina', ids: ['marina', 'marina-support', 'guest-dock', 'excursion-terminal'] },
  { title: 'Food and beverage', ids: ['restaurant', 'village', 'beach-club', 'members-club'] },
  { title: 'Venues: events, wellness, sport', ids: ['events', 'spa', 'sport'] },
];
const SERVICE_GROUPS = [
  { title: 'Utilities', ids: ['power', 'desal', 'sewage', 'network'] },
  { title: 'Back of house', ids: ['stores', 'darkstore', 'laundry', 'dock', 'waste', 'staffacc', 'canteen'] },
  { title: 'Guest care', ids: ['guestservices', 'medical', 'security'] },
];
// Fleet Hub: its own block (founder 2026-10-19): the vehicles belong to no other card
const FLEET_HUB = { id: 'fleet', name: 'Fleet Hub', zone: 'Z08', op: 'fleet', what: 'Charging, parking and workshop for the whole fleet; dispatch by RubiqOS.',
  produces: { 'Pod trips a day (plan)': '≈ 1,200', 'Charging posts': 30 }, consumes: { 'Energy (charging)': '≈ 2,400 kWh a day' } };
const FLEET_TITLES = { L1: 'L1 · Guest pod', L2: 'L2 · Guest shuttle', L3: 'L3 · Service cart', L4: 'L4 · Service truck', L5: 'L5 · Delivery robot', W1: 'W1 · Shuttle boat', W2: 'W2 · Supply vessel', W3: 'W3 · Excursion boat', A1: 'A1 · Helicopter' };
const FLEET_PLAN = { L1: 40, L2: 5, L3: 16, L4: 6, L5: 24, W1: 3, W2: 1, W3: 3, A1: 1 };
// Event programme: venue = the entity the event happens at (null = the promenade, no entity)
const EVENTS = [
  { time: '06:30–07:30', venue: null, venueName: 'Promenade', name: 'Guided run with a trainer', who: 'all', cap: 20, ops: '—' },
  { time: '07:00–08:00', venue: 'beach-club', name: 'Sunrise yoga on the sand', who: 'hotel, residents', cap: 40, ops: 'mats and water' },
  { time: '07:30–08:30', venue: 'sport', name: 'Group HIIT', who: 'all', cap: 25, ops: 'trainer' },
  { time: '08:00–09:00', venue: 'spa', name: 'Breathwork and cold plunge', who: 'all', cap: 20, ops: '—' },
  { time: '09:00–12:00', venue: 'marina', name: 'Snorkelling excursion', who: 'all', cap: 20, ops: 'excursion boat, lifeguard' },
  { time: '10:00–12:00', venue: 'beach-club', name: 'Kids beach games', who: 'families', cap: 30, ops: 'animators, lifeguard' },
  { time: '10:00–13:00', venue: 'village', name: 'Island market', who: 'all, day visitors', cap: 200, ops: 'truck with goods 09:00, +2 buggies' },
  { time: '11:00–13:00', venue: 'events', name: 'Art exhibition opening', who: 'all', cap: 120, ops: 'catering, security' },
  { time: '15:00–16:30', venue: 'spa', name: 'Longevity workshop', who: 'residents', cap: 24, ops: 'doctor' },
  { time: '16:00–17:30', venue: 'events', name: 'Public talk: Ocean futures', who: 'all', cap: 200, ops: '+3 buggies at 15:40' },
  { time: '16:30–18:00', venue: 'sport', name: 'Tennis clinic', who: 'all', cap: 18, ops: 'trainer, water' },
  { time: '17:00–19:00', venue: 'marina', name: 'Sunset sailing regatta', who: 'boat owners', cap: 40, ops: 'duty RIB' },
  { time: '17:30–19:30', venue: 'marina', name: 'Sunset cruise', who: 'all', cap: 20, ops: 'excursion boat' },
  { time: '17:30–20:00', venue: 'beach-club', name: 'DJ sunset', who: 'all', cap: 180, ops: 'bar, +4 buggies, security' },
  { time: '18:00–19:30', venue: 'restaurant', name: 'Wine tasting', who: 'hotel', cap: 40, ops: 'sommelier' },
  { time: '18:00–19:30', venue: 'sport', name: 'Padel social', who: 'all', cap: 16, ops: '—' },
  { time: '19:30–22:30', venue: 'village', name: 'Chef residency dinner', who: 'all', cap: 60, ops: 'kitchen; robot delivery off for the outlet' },
  { time: '20:30–22:00', venue: 'events', name: 'Chamber concert', who: 'all', cap: 300, ops: '+6 buggies, dispersal 22:00–22:20' },
];
const ENTITY_URL = id => `entity.html?id=${id}`;   // build_site.py rewrites entity.html?id= to /entity/?id= on the site
const entityOf = id => PRODUCTS.find(c => c.id === id) || SERVICES.find(c => c.id === id) || (id === 'fleet' ? FLEET_HUB : null);
const kindOf = c => PRODUCTS.includes(c) ? 'product' : c === FLEET_HUB ? 'fleet' : 'service';
// --- numbers
const fmt = (v, d = 0) => Number(v).toLocaleString('en-US', { maximumFractionDigits: d });
const capacityOf = c => c.units ? c.units.reduce((a, u) => a + u.n * u.pax, 0) : c.capacity;
function needs(c, occ) {
  let w = 0, e = 0, f = 0, l = 0, ws = 0;
  if (c.units) for (const u of c.units) { const n = u.n * occ; w += n * u.per.water; e += n * u.per.energy; f += n * u.per.food; l += n * u.per.laundry; ws += n * u.per.waste; }
  else { const n = c.capacity * occ * (c.turns || 1); w = n * c.per.water; e = n * c.per.energy; f = n * c.per.food; l = n * c.per.laundry; ws = n * c.per.waste; }
  return { water: w / 1000, energy: e, sewage: 0.85 * w / 1000, food: f / 1000, laundry: l, waste: ws / 1000 };
}
const people = (c, occ) => Math.round(capacityOf(c) * occ * (c.turns || 1));
const sum = (k, occ) => PRODUCTS.reduce((a, c) => a + needs(c, occ)[k], 0);
// balance (plan): products' needs against the services' capacity; LOAD = average-day load per service key, % (feeds the utility cards)
const staffTotal = PRODUCTS.reduce((a, c) => a + c.staff, 0) + 120;   // + administration, utilities, security, landscape
const capOf = k => SERVICES.find(s => s.key === k).capacity;
const BALANCE_ROWS = [['Water, m³', 'water', 150, 0, '+150 m³ staff housing and back of house'], ['Energy, kWh', 'energy', 12000, 0, '+12,000 kWh utilities, back of house and fleet charging'], ['Sewage, m³', 'sewage', 120, 0, '+120 m³ staff housing and back of house'], ['Food and beverage, t', 'food', 0.4, 2, '+0.4 t staff canteen'], ['Laundry, kg', 'laundry', 600, 0, '+600 kg uniforms'], ['Waste, t', 'waste', 0.3, 2, '+0.3 t back of house'], ['Staff positions', 'staff', 0, 0, 'plan 900 positions; 330 on the peak shift']];
const LOAD = {};
for (const [, k, extra] of BALANCE_ROWS) { const avg = k === 'staff' ? staffTotal : sum(k, OCC) + extra; LOAD[k] = Math.round(100 * avg / capOf(k)); }
// --- card html
const opTag = id => `<span class="op"><b>Operator</b>${OP[id].name}</span>`;
const kv = o => Object.entries(o).map(([k, v]) => `<span>${k}</span><span>${v}</span>`).join('');
const hdHtml = (c, link = true) => `<div class="hd"><h3>${link ? `<a href="${ENTITY_URL(c.id)}">${c.name}</a>` : c.name}</h3><span class="zone" title="${ZONE_NAME[c.zone] || ''}"><i style="background:${Z[c.zone]}"></i></span></div>`;   // zone = colour dot only (founder 2026-10-19: the Z ids confused)
const cardOf = c => (PRODUCTS.includes(c) ? productCard(c) : serviceCard(c));
const groupsHtml = groups => groups.map(g => `<h3 class="grp">${g.title}</h3><div class="cards">${g.ids.map(id => cardOf(entityOf(id))).join('')}</div>`).join('');
function productCard(c, link = true) {
  const d = needs(c, OCC); const objs = c.units ? Object.fromEntries([...c.units.map(u => [u.name, u.n]), ...Object.entries(c.objects)]) : c.objects;
  return `<div class="con" id="${c.id}">${hdHtml(c, link)}${opTag(c.op)}<p>${c.what}</p>
  <div class="live"><div class="cap"><i></i>Now</div><div class="kv" data-live="${c.id}"><span>Guests</span><span>—</span><span>Staff on shift</span><span>—</span></div></div>
  <div class="sec"><div class="cap">Produces</div><p>${c.produces}</p><div class="kv">${kv(objs)}<span>Capacity</span><span>${c.capLabel || `${fmt(capacityOf(c))} ${c.unit}`}</span><span>Average day at ${Math.round(OCC * 100)} %</span><span>${c.avgLabel || `${fmt(people(c, OCC))} ${c.turns ? 'visits' : c.unit}`}</span></div></div>
  <div class="sec"><div class="cap">Consumes a day</div><div class="kv"><span>Water</span><span>${fmt(d.water)} m³</span><span>Energy</span><span>${fmt(d.energy)} kWh</span><span>Food and beverage</span><span>${fmt(d.food, 2)} t</span><span>Clean linen</span><span>${fmt(d.laundry)} kg</span><span>Staff positions</span><span>${c.staff}</span></div></div>
  <div class="sec"><div class="cap">Returns a day</div><div class="kv"><span>Sewage</span><span>${fmt(d.sewage)} m³</span><span>Waste</span><span>${fmt(d.waste, 2)} t</span><span>Used linen</span><span>${fmt(d.laundry)} kg</span></div></div></div>`;
}
const serviceCard = (c, link = true) => `<div class="con svc" id="${c.id}">${hdHtml(c, link)}${opTag(c.op)}<p>${c.what}</p>
  <div class="live"><div class="cap"><i></i>Now</div><div class="kv" data-live="${c.id}"><span>Load</span><span>—</span></div></div>
  <div class="sec"><div class="cap">Produces</div><div class="kv">${kv(c.produces)}</div></div>
  <div class="sec"><div class="cap">Consumes</div><div class="kv">${kv(c.consumes)}</div></div></div>`;
const fleetCard = (link = true) => `<div class="con wide" id="fleetCard"><div class="col">${hdHtml(FLEET_HUB, link)}${opTag(FLEET_HUB.op)}<p>${FLEET_HUB.what}</p>
  <div class="live"><div class="cap"><i></i>Now</div><div class="kv" data-live="fleet"><span>Load</span><span>—</span></div></div>
  <div class="sec"><div class="cap">Produces</div><div class="kv">${kv(FLEET_HUB.produces)}</div></div>
  <div class="sec"><div class="cap">Consumes</div><div class="kv">${kv(FLEET_HUB.consumes)}</div></div></div>
  <div class="col"><div class="cap">Fleet · plan vs demo, live</div><div class="scroll"><table class="t"><thead><tr><th>Type</th><th class="num">Plan</th><th class="num">Demo</th><th class="num">Moving</th><th class="num">Charging</th><th class="num">Battery</th></tr></thead><tbody id="fleetRows"></tbody></table></div></div></div>`;
// --- the event programme as a schedule (founder 2026-10-19): the event, its time, its venue, its bookings against capacity. Nothing else.
EVENTS.forEach((e, i) => { e.i = i; const [a, b] = e.time.split('–').map(t => { const [h, m] = t.split(':').map(Number); return h + m / 60; }); e.start = a; e.end = b; });
const SCHED = { h0: 6, h1: 24 };
const hhmm = h => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
// bookings: the plan fills from 35 % a day ahead to full at the start; while the event runs the booked guests attend; after it, done
function bookings(e, h) {
  if (h === undefined) return { n: Math.round(e.cap * 0.8), state: 'plan', label: 'booked' };
  if (h < e.start) { const f = Math.max(0.35, Math.min(1, 1 - (e.start - h) / 12)); return { n: Math.round(e.cap * f), state: 'ahead', label: `booked · starts ${hhmm(e.start)}` }; }
  if (h < e.end) return { n: e.cap, state: 'now', label: 'attending now' };
  return { n: e.cap, state: 'done', label: 'attended' };
}
const schedVenues = () => { const out = []; for (const e of EVENTS) { const k = e.venue || e.venueName; if (!out.some(v => v.k === k)) out.push({ k, name: e.venue ? entityOf(e.venue).name : e.venueName, id: e.venue }); } return out; };
function scheduleHtml(list = EVENTS) {
  const span = SCHED.h1 - SCHED.h0, pct = h => (100 * (h - SCHED.h0) / span).toFixed(2) + '%';
  const venues = schedVenues().filter(v => list.some(e => (e.venue || e.venueName) === v.k));
  const ticks = []; for (let h = SCHED.h0; h <= SCHED.h1; h += 2) ticks.push(`<span style="left:${pct(h)}">${hhmm(h)}</span>`);
  const rows = venues.map(v => { const evs = list.filter(e => (e.venue || e.venueName) === v.k);
    return `<div class="srow"><div class="svenue">${v.id ? `<a href="${ENTITY_URL(v.id)}">${v.name}</a>` : v.name}</div><div class="slane">${evs.map(e => `<div class="sev" data-ev="${e.i}" title="${e.name} · ${e.time} · capacity ${e.cap}" style="left:${pct(e.start)};width:${pct(e.end).slice(0, -1) - pct(e.start).slice(0, -1)}%"><b>${e.name}</b><small>${e.time} · <span class="bk">${bookings(e).n}</span> of ${e.cap} <span class="bl">booked</span></small><i class="sbar"><u style="width:80%"></u></i></div>`).join('')}</div></div>`; }).join('');
  return `<div class="sched"><div class="srow shead"><div class="svenue"></div><div class="slane sticks">${ticks.join('')}</div></div>${rows}<div class="snow" id="schedNow" style="display:none"></div></div>`;
}
function refreshSchedule(h) {
  const span = SCHED.h1 - SCHED.h0; const now = document.getElementById('schedNow');
  if (now) { const inside = h >= SCHED.h0 && h <= SCHED.h1; now.style.display = inside ? '' : 'none'; if (inside) now.style.left = `calc(var(--svw) + (100% - var(--svw)) * ${(h - SCHED.h0) / span})`; }
  for (const el of document.querySelectorAll('.sev')) { const e = EVENTS[+el.dataset.ev], b = bookings(e, h); el.dataset.state = b.state;
    el.querySelector('.bk').textContent = b.n; el.querySelector('.bl').textContent = b.label; el.querySelector('.sbar u').style.width = Math.round(100 * b.n / e.cap) + '%'; }
}
const eventRow = e => `<tr><td>${e.time}</td><td>${e.venue ? `<a href="${ENTITY_URL(e.venue)}">${entityOf(e.venue).name}</a>` : e.venueName}</td><td>${e.name}</td><td class="num" data-evrow="${e.i}">${bookings(e).n} of ${e.cap}</td></tr>`;
const eventsTable = list => `<table class="t"><thead><tr><th>Time</th><th>Venue</th><th>Event</th><th class="num">Booked / capacity</th></tr></thead><tbody>${list.map(eventRow).join('')}</tbody></table>`;
// --- live: the simulation runs headless in the hidden frame (#sim); its window.__live is read once a second. Every [data-live] on the page is filled.
const bar = (p, over = 98) => `<div class="bar"><i class="${p >= over ? 'over' : ''}" style="width:${Math.min(100, p)}%"></i></div>`;
const setLive = (id, rows) => { const el = document.querySelector(`[data-live="${id}"]`); if (!el) return;   // a bar spans both columns, so it keeps the label / value parity; it is drawn right under its row
  el.innerHTML = rows.map(([k, v]) => k === 'bar' ? v : `<span>${k}</span><span>${v}</span>`).join(''); };
let L = null;
function refreshLive() {
  const sim = document.getElementById('sim'); try { L = sim && sim.contentWindow && sim.contentWindow.__live || null; } catch (e) { L = null; }
  document.body.classList.toggle('off', !L);
  if (!L) return;
  const guestsNow = Object.values(L.products).reduce((a, b) => a + b, 0);
  const clock = document.getElementById('clock'); if (clock) clock.textContent = L.clock;
  const st = document.getElementById('stLine'); if (st) st.innerHTML = `${L.day} · simulated time, 1 s = 1 min · <b>${fmt(Object.values(L.people).reduce((a, b) => a + b, 0) - (L.people.staff || 0))}</b> guests in the simulation, shown at the plan's scale (× ${L.scale}) · <b>${L.onShift}</b> staff on shift · ${L.events.length ? 'now: ' + L.events.join(', ') : 'no event running'}`;
  refreshSchedule(L.hour); for (const td of document.querySelectorAll('[data-evrow]')) { const e = EVENTS[+td.dataset.evrow], b = bookings(e, L.hour); td.textContent = `${b.n} of ${e.cap} · ${b.label}`; }
  for (const c of PRODUCTS) {
    const g = c.live.reduce((a, n) => a + (L.products[n] || 0), 0), stf = Math.round(c.staff * L.shiftShare), cap = capacityOf(c);
    const rows = [['Guests now', `${fmt(g)} <small style="color:var(--muted);font-weight:400">of ${fmt(cap)} · ${Math.round(100 * g / cap)} %</small>`], ['bar', bar(Math.round(100 * g / cap), 101)], ['Staff on shift', stf]];   // the bar = share of the product's own capacity (founder 2026-10-19)
    if (c.id === 'marina') {                                                 // the marina's capacity is berths, by boat class (founder 2026-10-19)
      const M = L.marina, cls = { S: 'to 15 m', M: 'to 35 m', L: 'to 80 m' }; rows.length = 0;
      rows.push(['Berths occupied', `${M.moored} <small style="color:var(--muted);font-weight:400">of ${M.berths} · ${Math.round(100 * M.moored / M.berths)} %</small>`], ['bar', bar(Math.round(100 * M.moored / M.berths), 101)]);
      for (const k of ['S', 'M', 'L']) { const b = M.byCls[k] || { moored: 0, berths: 0 }; rows.push([`${k} · boats ${cls[k]}`, `${b.moored} <small style="color:var(--muted);font-weight:400">of ${b.berths}</small>`], ['bar', bar(Math.round(100 * b.moored / Math.max(1, b.berths)), 101)]); }
      rows.push(['Under way', M.underway], ['Expected today', `${M.arrivalsLeft} in · ${M.departuresLeft} out`], ['Next', M.next], ['Staff on shift', stf]); }
    if (c.id === 'events') rows.push(['Running', L.events.filter(e => /Rotunda/.test(e)).map(e => e.split(' · ')[0]).join(', ') || '—']);
    setLive(c.id, rows);
  }
  for (const c of SERVICES) {
    const rows = c.liveFn ? c.liveFn(L) : [];
    const base = c.key && LOAD[c.key] !== undefined ? LOAD[c.key] : c.loadBase;
    if (base !== undefined && !rows.some(r => r[0] === 'Load')) { const p = Math.round(base * Math.max(0.5, Math.min(1.3, guestsNow / 700))); rows.unshift(['Load now', p + ' %'], ['bar', bar(p)]); }   // plan load scaled by the guests on the island now (700 = average day)
    else if (rows.some(r => r[0] === 'Load')) { const p = parseInt(rows.find(r => r[0] === 'Load')[1]); rows.push(['bar', bar(p)]); }
    setLive(c.id, rows);
  }
  { const F = L.fleet; const land = ['L1', 'L2', 'L3', 'L4', 'L5'].map(k => F[k] || { n: 0, mv: 0, ch: 0 }); const n = land.reduce((a, r) => a + r.n, 0), mv = land.reduce((a, r) => a + r.mv, 0), ch = land.reduce((a, r) => a + r.ch, 0), p = Math.round(100 * mv / Math.max(1, n));
    setLive('fleet', [['Load now', p + ' %'], ['bar', bar(p)], ['Land fleet moving', `${mv} of ${n}`], ['Charging', ch], ['Pod trips today', L.ops.buggyTrips], ['Deliveries today', L.ops.deliveries], ['Truck runs today', L.ops.truckRuns], ['Riders waiting · aboard', `${L.reception.podsWaiting} · ${L.reception.podsAboard}`]]);
    const fr = document.getElementById('fleetRows'); if (fr) fr.innerHTML = Object.keys(FLEET_PLAN).map(k => { const r = F[k] || { n: 0, mv: 0, ch: 0, bat: null }; return `<tr><td>${FLEET_TITLES[k]}</td><td class="num">${FLEET_PLAN[k]}</td><td class="num">${r.n}</td><td class="num">${r.mv}</td><td class="num">${r.ch}</td><td class="num">${r.bat === null ? '—' : r.bat + ' %'}</td></tr>`; }).join(''); }
}
setInterval(refreshLive, 1000);
