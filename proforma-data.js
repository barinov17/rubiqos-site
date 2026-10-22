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
  { id: 'cleaning', name: 'Cleaning manager', note: 'Housekeeping, public areas, beaches, cleaning robots.' },
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
  { id: 'beach-hotel', rooms: true, name: 'Beach Hotel', zone: 'Z01', op: 'hotels', unit: 'guests', live: ['Beach Hotel'], what: 'The main hotel on the beach: three room blocks and a restaurant.',
    produces: 'Room nights · breakfast and the hotel restaurant · the beach in front', capacity: 528, objects: { 'Deluxe rooms': 140, 'Sea-view rooms': 60, '1-BR suites': 32, 'Signature suites': 8 }, staff: 270, per: { water: 500, energy: 42, food: 2.0, laundry: 4, waste: 2.5 } },
  { id: 'hill-hotel', rooms: true, name: 'Hill Hotel', zone: 'Z02', op: 'hotels', unit: 'guests', live: ['Hill Hotel'], what: 'Boutique hotel of low blocks over the central hill; large rooms, views.',
    produces: 'Room nights · suites with terraces', capacity: 280, objects: { 'Hillside rooms': 56, 'Terrace rooms': 36, '1-BR suites': 22, '2-BR suites': 6 }, staff: 135, per: { water: 500, energy: 42, food: 2.0, laundry: 4, waste: 2.5 } },
  { id: 'villas', rooms: true, name: 'East Villas', zone: 'Z05', op: 'villas', unit: 'guests', live: ['Villas'], what: 'Private villas on the eastern cape, owned or let, served by butlers.',
    produces: 'Villa nights · butler service · villa breakfasts', capacity: 144, objects: { '4-BR villas': 18 }, staff: 40, per: { water: 600, energy: 50, food: 1.5, laundry: 4, waste: 2.5 } },
  { id: 'residences', rooms: true, name: 'Branded Residences', zone: 'Z10', op: 'residences', unit: 'residents', live: ['Residences BR1', 'Residences BR2'], what: 'Apartment towers by the village; most units in the hotel rental pool.',
    produces: 'Apartment nights (rental pool) · owner services · concierge', capacity: 812, objects: { '1-BR apartments': 62, '2-BR apartments': 94, '3-BR apartments': 42, 'Penthouses': 10 }, staff: 95, per: { water: 300, energy: 25, food: 1.0, laundry: 1.5, waste: 2.0 } },
  { id: 'apart-hotel', rooms: true, name: 'Apart-hotel', zone: 'Z03', op: 'hotels', unit: 'guests', live: ['Apart-hotel'], what: 'Serviced apartments in two five-storey buildings of Marina Village, for longer stays.',
    produces: 'Apartment nights · kitchenettes · hotel services on call', capacity: 110, objects: { 'Studios': 24, '1-BR apartments': 16, '2-BR apartments': 6 }, staff: 30, per: { water: 350, energy: 30, food: 0.8, laundry: 2, waste: 2.0 } },
  { id: 'village', name: 'Marina Village', zone: 'Z03', op: 'village', unit: 'people at once', turns: 3, live: ['Marina Village'], what: 'Pedestrian heart: cafes, restaurants, shops, the market, an apart-hotel.',
    produces: 'Covers at four F&B outlets · retail · the island market', capacity: 600, objects: { 'Restaurant seats': 240, 'Shops': 17, 'Market stalls': 20 }, staff: 85, per: { water: 25, energy: 6, food: 0.7, laundry: 0.1, waste: 0.5 } },
  { id: 'restaurant', name: 'Restaurant', zone: 'Z02', op: 'restaurant', unit: 'people at once', turns: 4, live: ['Restaurant'], what: 'Signature round pavilion on the hill: dinner service, the wine tasting.',
    produces: 'Covers · the wine programme', capacity: 220, objects: { 'Seats': 220, 'Private dining rooms': 2 }, staff: 60, per: { water: 30, energy: 8, food: 0.9, laundry: 0.3, waste: 0.6 } },
  { id: 'beach-club', name: 'Beach Club', zone: 'Z11', op: 'beachclub', unit: 'people at once', turns: 1.5, live: ['Beach Club'], what: 'Day club on the south beach: sunbeds, cabanas, restaurant, bar, DJ.',
    produces: 'Sunbed days · covers · the DJ sunset', capacity: 320, objects: { 'Sunbeds': 180, 'Cabanas': 12, 'Restaurant seats': 90, 'Bar seats': 40 }, staff: 40, per: { water: 60, energy: 8, food: 0.9, laundry: 1.0, waste: 0.6 } },
  { id: 'members-club', name: 'Members Club', zone: 'Z01', op: 'beachclub', unit: 'people at once', turns: 2, live: ['Members Club'], what: 'Beach club west of the hotel for mainland members and residents.',
    produces: 'Memberships · covers · the club beach', capacity: 260, objects: { 'Dining seats': 100, 'Lounge and bar seats': 60, 'Pavilion seats': 40, 'Pool deck places': 60 }, staff: 30, per: { water: 40, energy: 8, food: 0.8, laundry: 0.8, waste: 0.5 } },
  { id: 'hotel-beach', name: 'Hotel Beach', zone: 'Z01', op: 'hotels', unit: 'guests', live: ['North Beach'], what: 'The north beach in front of the Beach Hotel: sunbeds, cabanas, a beach kiosk and bar.',
    produces: 'Sunbed days · kiosk covers · beach service', capacity: 160, objects: { 'Sunbeds': 120, 'Cabanas': 8, 'Kiosk and bar seats': 32 }, staff: 14, per: { water: 20, energy: 2, food: 0.3, laundry: 1.2, waste: 0.3 } },
  { id: 'club-beach', name: 'Club Beach', zone: 'Z06', op: 'beachclub', unit: 'guests', live: ['South Beach'], what: 'The south beach by the Beach Club: sunbeds on the sand, beach service from the club, the water-sports base.',
    produces: 'Sunbed days · beach service from the club · launch point for water activities', capacity: 120, objects: { 'Sunbeds': 100, 'Beach service points': 2 }, staff: 10, per: { water: 15, energy: 1, food: 0.2, laundry: 1.0, waste: 0.2 } },
  { id: 'water-sports', name: 'Water activities', zone: 'Z11', op: 'beachclub', unit: 'guests at once', turns: 4, live: ['Water activities'], what: 'Water-sports pavilion on the south beach east of the Beach Club: boards, kayaks, dinghies, jet skis, the dive boat.',
    produces: 'Rentals and lessons · dive and snorkel trips · sunset paddles', capacity: 60, objects: { 'SUP boards and kayaks': 20, 'Sailing dinghies': 6, 'Jet skis': 6, 'Dive boat seats': 12, 'Lesson slots a day': 24 }, staff: 12, per: { water: 15, energy: 2, food: 0.05, laundry: 0.3, waste: 0.1 } },
  { id: 'spa', name: 'Spa & Wellness', zone: 'Z06', op: 'spa', unit: 'people at once', turns: 4, live: ['Spa & Wellness'], what: 'Spa on the second hill: treatment rooms, thermal area, longevity clinic.',
    produces: 'Treatments · thermal passes · the longevity programme', capacity: 90, objects: { 'Treatment rooms': 16, 'Couple suites': 6, 'Longevity clinic rooms': 2, 'Thermal area places': 40, 'Relaxation lounge places': 20 }, staff: 32, per: { water: 180, energy: 12, food: 0.2, laundry: 2.0, waste: 0.3 } },
  { id: 'sport', name: 'GYM & Sports', zone: 'Z06', op: 'sport', unit: 'people at once', turns: 4, live: ['GYM & Sports'], what: 'Gyms, a studio, tennis and pickleball courts, a clubhouse; classes.',
    produces: 'Sessions · court hours · classes and clinics', capacity: 130, objects: { 'Gym places': 40, 'Studio places': 20, 'Tennis courts': 3, 'Pickleball courts': 6, 'Clubhouse seats': 34 }, staff: 15, per: { water: 40, energy: 5, food: 0.1, laundry: 0.5, waste: 0.2 } },
  { id: 'marina', name: 'Marina', zone: 'Z04', op: 'marina', unit: 'people aboard', live: ['Marina'], what: 'Yacht marina behind the breakwater, three berth sizes; the guest dock.',
    produces: 'Berth nights · shore power and water · the guest dock', units: [ { name: 'Berths for boats to 15 m', n: 50, pax: 4, per: { water: 200, energy: 60, food: 5, laundry: 2, waste: 8 } },
             { name: 'Berths for boats to 35 m', n: 32, pax: 8, per: { water: 1000, energy: 400, food: 15, laundry: 6, waste: 20 } },
             { name: 'Berths for boats to 80 m', n: 8, pax: 14, per: { water: 5000, energy: 2400, food: 40, laundry: 15, waste: 50 } } ],
    objects: {}, staff: 28, capLabel: '90 berths', avgLabel: '63 berths · ≈ 360 people aboard' },
  { id: 'events', name: 'Events Rotunda', zone: 'Z07', op: 'events', unit: 'people at once', turns: 1.5, live: ['Events Rotunda'], what: 'Ring hall around a courtyard: exhibitions, talks, concerts, dinners.',
    produces: 'Events (3 a day) · tickets and buyouts · catering', capacity: 540, objects: { 'Hall places': 300, 'Courtyard places': 120, 'Pavilion places': 120 }, staff: 10, per: { water: 15, energy: 4, food: 0.4, laundry: 0.1, waste: 0.3 } },
];
// Services: produces = output a day as sized in the plan; consumes = inputs a day (industry ratios, stated); key/capacity feed the balance.
// liveFn builds the live block from the snapshot; loadBase = plan load (%) scaled by the guests on the island when there is no balance key.
const SERVICES = [
  { id: 'power', name: 'Power plant', zone: 'Z09', op: 'infra', what: 'Gas generators plus solar on the back-of-house roofs; battery buffer.',
    produces: { 'Peak power': '9 MW', 'Energy a day': '95,000 kWh', 'Solar share': '18 %' }, consumes: { 'Gas a day': '≈ 19,000 m³ (0.24 m³/kWh generated)', 'Fuel autonomy': '14 days' }, key: 'energy', capacity: 95000 },
  { id: 'desal', name: 'Water production', zone: 'Z09', op: 'infra', what: 'Reverse-osmosis plant: three trains, four potable tanks; 900 m³ a day.',
    produces: { 'Production rate': '40 m³/h · 900 m³ a day', 'RO trains': '3 × 15 m³/h (one in reserve by day)', 'Storage tanks': '4 × 300 m³ = 1,200 m³ (1.3 days)' }, consumes: { 'Energy': '≈ 3,150 kWh a day (3.5 kWh/m³)', 'Sea water intake': '≈ 2,250 m³ a day (40 % recovery)' }, key: 'water', capacity: 900 },
  { id: 'sewage', name: 'Sewage treatment', zone: 'Z09', op: 'infra', what: 'Treatment plant; reclaimed water goes to irrigation.',
    produces: { 'Treated a day': '700 m³', 'Reclaimed for irrigation': '450 m³' }, consumes: { 'Energy': '≈ 420 kWh a day (0.6 kWh/m³)' }, key: 'sewage', capacity: 700 },
  { id: 'network', name: 'Network and connectivity', zone: 'Z09', op: 'infra', what: 'Two masts (not on the plan yet): private 5G, Wi-Fi, fibre ring.',
    produces: { 'Masts': 2, 'Coverage': 'the island and the marina basin', 'Backbone': '10 Gbit fibre ring', 'Devices served (plan)': '≈ 6,000' }, consumes: { 'Energy': '≈ 900 kWh a day', 'Mainland link': 'submarine fibre, microwave backup' },
    liveFn: L => { const F = L.fleet; const veh = Object.values(F).reduce((a, r) => a + r.n, 0); const guests = Object.values(L.products).reduce((a, b) => a + b, 0);
      const dev = Math.round(guests * 2.2 + L.onShift * 1.1 + veh * 3 + 400); const a = Math.round(100 * dev * 0.55 / 3300), b = Math.round(100 * dev * 0.45 / 2700);   // 400 fixed sensors and cameras; mast A serves the west (marina, village, back of house), mast B the east
      return [['Load', Math.round(100 * dev / 6000) + ' %'], ['Devices online', dev.toLocaleString('en-US')], ['Mast A (west)', a + ' %'], ['Mast B (east)', b + ' %']]; } },
  { id: 'stores', name: 'Warehouse and cold chain', zone: 'Z09', op: 'stores', what: 'Warehouse bar: prep kitchen, cold and dry stores; receives the vessel.',
    produces: { 'Food throughput a day': '4.5 t', 'Meals prepared a day': '4,100', 'Dry store': '30 t · 14 days of cover', 'Cold store': '12 t · 3–4 days of cover', 'Beverage store': '15 t · 10 days of cover' }, consumes: { 'Supply calls a week': '4 (two vessels)', 'Energy (cold rooms)': '≈ 1,800 kWh a day' }, key: 'food', capacity: 4.5,
    liveFn: L => { const S = L.supply ? L.supply.store : null; if (!S) return []; const t = k => (S[k].stock / 1000).toFixed(1) + ' t'; const pc = k => Math.round(100 * S[k].stock / S[k].cap);
      return [['Dry store', `${t('dry')} <small style="color:var(--muted)">of 30 t</small>`], ['bar', bar(pc('dry'))], ['Cold store', `${t('cold')} <small style="color:var(--muted)">of 12 t</small>`], ['bar', bar(pc('cold'))], ['Beverages', `${t('bev')} <small style="color:var(--muted)">of 15 t</small>`], ['bar', bar(pc('bev'))], ['Sent to outlets today', (L.supply.truckKg / 1000).toFixed(1) + ' t'], ['Covers served today', fmt(L.supply.meals)],
        ...(L.supply.log || []).slice(0, 5).map(e => [`${e.t} · ${e.from.split(' ')[0]} → ${e.to}`, `${fmt(e.kg)} kg <small style="color:var(--muted)">${e.what.split(' · ')[0]}</small>`])]; } },   /* the latest truck deliveries (2026-10-20) */
  { id: 'darkstore', name: 'Dark Store', zone: 'Z03', op: 'stores', what: 'The convenience store in Marina Village is the dark store: guest-app orders are picked here and delivery robots leave from it.',
    produces: { 'Orders a day (plan)': '≈ 600', 'SKUs': '1,200', 'Pick to door': '≤ 30 min' }, consumes: { 'Stock': 'from the warehouse, daily', 'Energy': '≈ 600 kWh a day' }, loadBase: 70,
    liveFn: L => { const o = L.supply && L.supply.outlets['Dark Store']; return o ? [['Orders out today', fmt(o.orders)], ['Stock', `${Math.round(o.stock)} kg <small style="color:var(--muted)">of ${o.par} par</small>`], ['bar', bar(Math.round(100 * o.stock / o.par), 101)], ['Robot deliveries today (all kitchens)', L.ops.deliveries]] : [['Orders fulfilled today', L.ops.deliveries]]; } },
  { id: 'laundry', name: 'Laundry', zone: 'Z09', op: 'stores', what: 'Central laundry in the warehouse bar; linen out and back daily.',
    produces: { 'Linen a day': '5,000 kg', 'Turnaround': '6 h' }, consumes: { 'Water': '≈ 75 m³ a day (15 L/kg)', 'Energy': '≈ 5,000 kWh a day (1 kWh/kg)' }, key: 'laundry', capacity: 5000,
    liveFn: L => { const h = L.hour; return [['Linen moved by truck today', fmt(L.supply ? L.supply.linenKg : 0) + ' kg'], ['Runs', h >= 8.5 && h < 11.5 ? 'collecting used linen' : h >= 14.5 && h < 17.5 ? 'delivering clean linen' : 'next 08:30 / 14:30']]; } },
  { id: 'office', name: 'Administration office', zone: 'Z03', op: 'infra', what: 'The westmost village building: resort administration and the operator console below, management apartments above.',
    produces: { 'Desks': 60, 'Management apartments': 16, 'Operator console': 'RubiqOS, 24 h' }, consumes: { 'Energy': '≈ 900 kWh a day', 'Water': '≈ 8 m³ a day' }, loadBase: 70,
    liveFn: L => { const h = L.hour, day = h >= 8 && h < 19; return [['Load', (day ? 85 : 30) + ' %'], ['In the office', day ? 'day shift' : 'console only']]; } },
  { id: 'staffacc', name: 'Staff accommodation', zone: 'Z09', op: 'staffacc', what: 'Four-floor block with 420 beds; the rest commute by staff shuttle.',
    produces: { 'Beds': 420, 'Staff shuttle': 'mainland, 3 runs a shift; on the island 4 shuttles to the back-of-house drop-offs' }, consumes: { 'Water': '≈ 48 m³ a day', 'Energy': '≈ 2,150 kWh a day' }, key: 'staff', capacity: 900,
    liveFn: L => [['Staff on shift', L.onShift], ['Shift', L.hour >= 7 && L.hour < 15 ? 'morning 07–15' : L.hour >= 15 && L.hour < 23 ? 'evening 15–23' : 'night 23–07'], ['Load', Math.round(100 * L.onShift / 330) + ' %'],
      ...((L.supply && L.supply.staffShuttle) || []).map((t, i) => [`Staff shuttle ST-${i + 1}`, t.replace(/^Staff shuttle · /, '')])] },
  { id: 'canteen', name: 'Staff canteen', zone: 'Z03', op: 'staffacc', what: 'Staff canteen in the administration building: three meals at the shift changes.',
    produces: { 'Meals a day': '1,000', 'Seats': 160, 'Service windows': '06:00–08:00 · 14:00–16:00 · 22:00–24:00' }, consumes: { 'Food': '≈ 0.4 t a day (from the prep kitchen)', 'Water': '≈ 12 m³ a day', 'Energy': '≈ 350 kWh a day' },
    liveFn: L => { const h = L.hour, open = (h >= 6 && h < 8) || (h >= 14 && h < 16) || (h >= 22); const p = open ? Math.min(100, Math.round(100 * L.onShift * 0.5 / 160)) : 10;
      const o = L.supply && L.supply.outlets['Staff canteen']; return [['Load', p + ' %'], ['Service', open ? 'open · shift meal' : 'closed · next ' + (h < 6 ? '06:00' : h < 14 ? '14:00' : h < 22 ? '22:00' : '06:00')], ['Meals today', o ? fmt(o.meals) : '—'], ['Kitchen stock', o ? Math.round(o.stock) + ' kg of ' + o.par : '—']]; } },
  { id: 'cleaning', name: 'Cleaning', zone: 'Z09', op: 'cleaning', what: 'Housekeeping of every room, villa and apartment, public areas, beaches and the back of house; robots on floors and lawns.',
    produces: { 'Rooms and units a day': '≈ 400 turned, ≈ 300 serviced', 'Public areas': '≈ 60,000 m² a day', 'Beaches': '2, raked daily', 'Housekeepers on shift (plan)': 120 }, consumes: { 'Water': '≈ 40 m³ a day', 'Energy': '≈ 900 kWh a day', 'Chemicals and amenities': 'from the dark store', 'Linen': 'from the laundry' }, loadBase: 70,
    liveFn: L => { const h = L.hour, peak = h >= 9 && h < 15; const guests = Object.values(L.products).reduce((a, b) => a + b, 0); return [['Load', (peak ? Math.min(100, Math.round(55 + guests / 20)) : 25) + ' %'], ['Housekeepers on shift', Math.round(120 * L.shiftShare)], ['Rooms in service now', peak ? Math.round(400 * ((h - 9) / 6)) + ' of 400' : h >= 15 ? '400 of 400' : '0 of 400'], ['Robots on floors and lawns', h >= 22 || h < 6 ? 'night run' : 'daytime rounds']]; } },
  { id: 'landscaping', name: 'Landscaping', zone: 'Z09', op: 'cleaning', what: 'Gardens, lawns, palms and the dunes: gardeners by day, robot mowers and smart irrigation at night.',
    produces: { 'Green area kept': '≈ 180,000 m²', 'Lawns mown a week': '≈ 60,000 m², by robots', 'Irrigation a day': '≈ 450 m³ of reclaimed water', 'Plant nursery': 'in the back of house' }, consumes: { 'Reclaimed water': 'from the sewage plant, all of it', 'Energy': '≈ 300 kWh a day (mowers, pumps)' }, loadBase: 60,
    liveFn: L => { const h = L.hour, night = h >= 22 || h < 6; return [['Load', (night ? 85 : h < 12 ? 70 : 40) + ' %'], ['Robot mowers', night ? '12 mowing' : h < 12 ? '4 on the dunes' : 'docked, charging'], ['Irrigation', night ? 'running' : 'off until 22:00'], ['Gardeners on shift', Math.round(27 * L.shiftShare)]]; } },
  { id: 'waste', name: 'Waste management', zone: 'Z09', op: 'waste', what: 'Sorting and compactors at the W yard; truck rounds at 14:00 and 23:00; compacted containers leave on the supply vessel.',
    produces: { 'Waste handled a day': '5 t', 'Recycled': '40 %', 'Truck rounds': '14:00–15:30 and 23:00–05:00', 'Out to the mainland': 'compacted, on the supply vessel' }, consumes: { 'Energy': '≈ 400 kWh a day' }, key: 'waste', capacity: 5,
    liveFn: L => { const S = L.supply || {}; return [['Rounds', L.hour >= 23 || L.hour < 5 ? 'night round running' : L.hour >= 14 && L.hour < 15.5 ? 'day round running' : 'next ' + (L.hour < 14 ? '14:00' : '23:00')], ['Collected today', fmt(S.wasteKg || 0) + ' kg'], ['At the yard, compacted', ((S.wasteYard || 0) / 1000).toFixed(1) + ' t'], ['Shipped out', ((S.wasteOutKg || 0) / 1000).toFixed(1) + ' t']]; } },
  { id: 'dock', name: 'Service dock', zone: 'Z04', op: 'stores', what: 'Supply vessel berth with crane; containers go straight onto trucks.',
    produces: { 'Supply vessels': '2, autonomous, 9 t each', 'Calls a week': '4 · Mon, Tue, Thu, Fri 08:00', 'Unloading': '2 h, crane to trucks', 'Waste out': 'containers on the return leg' }, consumes: { 'Goods a week': '≈ 36 t (dry 16 · cold 14 · beverages 6)', 'Fuel bunkering': 'yes' },
    liveFn: L => { const V = L.supply ? L.supply.vessels : []; return [['Vessel', L.reception.vesselDocked ? 'docked, unloading' : 'at sea / mainland'], ...V.map((t, i) => [`SV-${i + 1}`, t.replace(/^At the mainland port · /, '').replace(/^Supply call · /, '')]), ['Goods landed', (L.supply ? L.supply.inKg / 1000 : 0).toFixed(0) + ' t'], ['Waste shipped', (L.supply ? L.supply.wasteOutKg / 1000 : 0).toFixed(1) + ' t']]; } },
  { id: 'guestservices', name: 'Guest services', zone: 'Z08', op: 'guestservices', what: 'Concierge, butlers and the guest-app desk, in the administration building: the human layer on call.',
    produces: { 'Requests a day (plan)': '≈ 1,500', 'Butlers': 24, 'Concierge desks': 3, 'Answer time': '≤ 2 min' }, consumes: { 'Energy': '≈ 150 kWh a day' }, loadBase: 65,
    liveFn: L => [['Pod calls today', L.ops.buggyRides], ['Guests on the island', fmt(Object.values(L.products).reduce((a, b) => a + b, 0))]] },
  { id: 'medical', name: 'Medical service', zone: 'Z08', op: 'medical', what: 'The island clinic, 24 h, in the administration building; ambulance pod, helicopter evacuation.',
    produces: { 'Clinic': '24 h, doctor + 2 nurses', 'Consultations a day (plan)': '≈ 25', 'Evacuation': 'helicopter, 20 min to the mainland' }, consumes: { 'Energy': '≈ 200 kWh a day', 'Water': '≈ 3 m³ a day' }, loadBase: 35,
    liveFn: L => [['On duty', L.hour >= 8 && L.hour < 20 ? 'doctor, 2 nurses' : 'doctor on call, nurse'], ['Cases today (plan rate)', Math.round(25 * Math.min(1, Math.max(0, (L.hour - 6) / 18)))]] },
  { id: 'security', name: 'Safety and security', zone: 'Z08', op: 'security', what: 'Control room in the administration building; patrols, lifeguards, fire crew; face and key access.',
    produces: { 'Control room': '24 h', 'Patrols': '2 land, 1 marine', 'Lifeguards': '4 by day', 'Fire crew': 6 }, consumes: { 'Energy': '≈ 400 kWh a day', 'Cameras and sensors': '≈ 400 devices' }, loadBase: 45,
    liveFn: L => [['Lifeguards', L.hour >= 8 && L.hour < 19 ? 'on both beaches' : 'off duty, beaches closed'], ['Events watched', L.events.length ? L.events.map(e => e.split(' · ')[0]).join(', ') : '—']] },
  // the marina's own infrastructure (founder 2026-10-19): shown in the Marina category with the berths
  // the crew lounge and a crew gym are functions of this building, not objects of their own (founder 2026-10-20)
  { id: 'marina-support', name: 'Marina support building', zone: 'Z04', op: 'marina', what: 'Harbour office, chandlery and workshop; the crew lounge and a crew gym for the yacht crews.',
    produces: { 'Harbour office': '24 h', 'Berth services': 'see Yacht services', 'Chandlery and workshop': 'parts, small repairs', 'Crew lounge': '40 seats, 16 showers and lockers, crew laundry 300 kg a day', 'Crew gym': 'for the yacht crews', 'Provisioning orders a day (plan)': 25 },
    consumes: { 'Energy (building)': '≈ 1,150 kWh a day', 'Water (building)': '≈ 20 m³ a day', 'Food (crew canteen)': 'from the dark store' }, loadBase: 60,
    liveFn: L => { const M = L.marina, per = { S: 1, M: 4, L: 12 }; const crew = ['S', 'M', 'L'].reduce((a, k) => a + ((M.byCls[k] || { moored: 0 }).moored) * per[k], 0);
      return [['Load', Math.round(100 * M.moored / M.berths) + ' %'], ['Boats in the harbour', M.moored], ['Crew on the island', crew], ...(L.crewAt ? [['In the crew lounge now', L.crewAt.lounge * L.crewAt.scale], ['In the crew gym now', L.crewAt.gym * L.crewAt.scale]] : [['In the crew lounge now', Math.round(crew * (L.hour >= 11 && L.hour < 23 ? 0.3 : 0.1))]])]; } },   /* live from the simulation's crews (founder 2026-10-20) */   // the berths and the movements are in the marina block, not here
  // services for the boats at the berths (founder 2026-10-19): water, power, pump-out, fuel, plus what a marina operator would not leave out: waste, provisioning, laundry, Wi-Fi, line handling
  { id: 'yacht-services', name: 'Yacht services', zone: 'Z04', op: 'marina', what: 'At every berth: water, shore power, pump-out, fuel. On call: waste, provisioning, laundry.',
    produces: { 'Fresh water': '≈ 60 m³ a day', 'Shore power': '≈ 30,000 kWh a day', 'Pump-out': '≈ 40 m³ a day', 'Fuel': '≈ 20 m³ a day' }, consumes: { 'Water, power, sewage': 'the island utilities', 'Fuel': 'by the supply vessel' }, loadBase: 60,
    liveFn: L => { const M = L.marina, per = { S: 1, M: 3, L: 10 }, u = ['S', 'M', 'L'].reduce((a, k) => a + ((M.byCls[k] || { moored: 0 }).moored) * per[k], 0), full = 50 * 1 + 32 * 3 + 8 * 10;
      return [['Load', Math.min(100, Math.round(100 * u / full)) + ' %'], ['Boats connected', M.moored], ['Pump-outs today', Math.round(M.moored * 0.3 * Math.min(1, L.hour / 24))]]; } },
  { id: 'guest-dock', name: 'Guest arrivals dock', zone: 'Z04', op: 'hotels', what: 'The shuttle pier and the arrivals pavilion: face check-in, digital key, luggage to the room.',
    produces: { 'Arrivals a day (plan)': '≈ 500', 'Shuttle landings a day': 24, 'Check-in': 'face check-in, digital key' }, consumes: { 'Water': '≈ 5 m³ a day', 'Energy': '≈ 300 kWh a day' }, loadBase: 55,
    liveFn: L => [['Arrivals today', L.ops.arrivals], ['Departures today', L.ops.departures]] },
  { id: 'excursion-terminal', name: 'Excursion terminal', zone: 'Z04', op: 'excursions', what: 'Pier and booking desk for the snorkelling and sunset trips; departures by the event programme.',
    produces: { 'Trips a day': 2, 'Seats a trip': 12, 'Booking': 'in the guest app, weather cancels' }, consumes: { 'Energy': '≈ 60 kWh a day' }, loadBase: 40,
    liveFn: L => [['Now', (L.reception.excursion || '—').replace(/^Excursion boat · /, '')]] },
];
// Categories (founder 2026-10-19): the cards are grouped, not listed by zone
const PRODUCT_GROUPS = [
  { title: 'Accommodation', ids: ['beach-hotel', 'hill-hotel', 'apart-hotel', 'villas', 'residences'] },
  { title: 'Marina', wide: 'marina', ids: ['marina-support', 'guest-dock', 'excursion-terminal'] }   /* yacht services live in the Marina block (founder 2026-10-20) */,
  { title: 'Food and beverage', ids: ['restaurant', 'village', 'beach-club', 'members-club'] },
  { title: 'Beaches and water', ids: ['hotel-beach', 'club-beach', 'water-sports'] },
  { title: 'Venues: events, wellness, sport', ids: ['events', 'spa', 'sport'] },
];
const SERVICE_GROUPS = [
  { title: 'Utilities', ids: ['power', 'desal', 'sewage', 'network'] },
  { title: 'Back of house', ids: ['office', 'stores', 'darkstore', 'laundry', 'cleaning', 'landscaping', 'waste', 'dock', 'staffacc', 'canteen'] },
  { title: 'Guest care', ids: ['guestservices', 'medical', 'security'] },
];
// Fleet Hub: its own block (founder 2026-10-19): the vehicles belong to no other card
const FLEET_HUB = { id: 'fleet', name: 'Fleet Hub', zone: 'Z08', op: 'fleet', what: 'Charging, parking and workshop for the whole fleet; dispatch by RubiqOS.',
  produces: { 'Pod trips a day (plan)': '≈ 1,200', 'Charging posts': 30 }, consumes: { 'Energy (charging)': '≈ 2,400 kWh a day' } };
const FLEET_TITLES = { L1: 'L1 · Guest pod', L2: 'L2 · Guest shuttle', L3: 'L3 · Service cart', L4: 'L4 · Service truck', L5: 'L5 · Delivery robot', W1: 'W1 · Shuttle boat', W2: 'W2 · Supply vessel', W3: 'W3 · Excursion boat', A1: 'A1 · Helicopter' };
const FLEET_PLAN = { L1: 40, L2: 5, L3: 16, L4: 6, L5: 24, W1: 4, W2: 2, W3: 3, A1: 1 };
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
const opTag = id => '';   // operators are not shown on the cards for now (founder 2026-10-19); the OP data stays for later
const kv = o => Object.entries(o).map(([k, v]) => `<span>${k}</span><span>${v}</span>`).join('');
const NO_MODEL = new Set([   /* guest services, medical and security sit in the administration building (founder 2026-10-20) */ 'landscaping', 'cleaning', 'yacht-services']);   // no physical object on the master plan yet (founder 2026-10-19: red marker)
const hdHtml = (c, link = true) => `<div class="hd"><h3>${link ? `<a href="${ENTITY_URL(c.id)}">${c.name}</a>` : c.name}</h3>${NO_MODEL.has(c.id) ? '<span class="nomodel" title="No physical object on the master plan yet"></span>' : ''}</div>`;   // no zone id and no colour dot (founder 2026-10-19)
const cardOf = c => (PRODUCTS.includes(c) ? productCard(c) : serviceCard(c));
const groupsHtml = groups => groups.map(g => `<h3 class="grp">${g.title}</h3>${g.wide === 'marina' ? marinaBlock() + '<div style="height:14px"></div>' : ''}<div class="cards">${g.ids.map(id => cardOf(entityOf(id))).join('')}</div>`).join('');
function productInner(c, link = true) {
  const d = needs(c, OCC); const objs = c.units ? c.objects : c.objects;   // the marina's berths by class live in its table, not in the list
  return `${hdHtml(c, link)}${opTag(c.op)}<p>${c.what}</p>
  <div class="live"><div class="cap"><i></i>Now</div><div class="kv" data-live="${c.id}"><span>Guests</span><span>—</span></div></div>
  ${chartHtml(c)}
  <div class="sec"><div class="cap">Produces</div>${c.rooms ? roomRows(c) : `<p>${c.produces}</p><div class="kv">${kv(objs)}</div>`}</div>
  <div class="sec detail"><div class="cap">Consumes a day</div><div class="kv"><span>Water</span><span>${fmt(d.water)} m³</span><span>Energy</span><span>${fmt(d.energy)} kWh</span><span>Food and beverage</span><span>${fmt(d.food, 2)} t</span><span>Clean linen</span><span>${fmt(d.laundry)} kg</span></div></div>
  <div class="sec detail"><div class="cap">Returns a day</div><div class="kv"><span>Sewage</span><span>${fmt(d.sewage)} m³</span><span>Waste</span><span>${fmt(d.waste, 2)} t</span><span>Used linen</span><span>${fmt(d.laundry)} kg</span></div></div>
  ${opsHtml(c.id)}`;
}
// Physical AI register (founder 2026-10-19): ONE list of robot types. Every robot row in TEAM is an id from here, so a card, the
// Fleet Hub and the Physical AI page always say the same thing. Add a type here first; never type a robot name into TEAM.
//   scope 'fleet'  = shared, moves between objects; owned by the Fleet Hub; count = FLEET_PLAN. Never listed on a product card.
//   scope 'object' = bound to one object (a scrubber on the hotel floors, a pool robot in a villa); counted where it works.
//   scope 'auto'   = fixed automation, not a robot (lockers, sensors, wash line); shown apart from the robot count.
const ROBOTS = {
  L1: { name: 'Guest pod', scope: 'fleet', does: 'Drives guests on call: terminal transfers, dinner and event waves.' },
  L2: { name: 'Guest shuttle', scope: 'fleet', does: 'Runs the fixed loop terminal → hotels → Marina Village → Beach Club → spa.' },
  L3: { name: 'Service cart', scope: 'fleet', does: 'Carries engineers, housekeeping and landscape crews to their jobs (driven).' },
  L4: { name: 'Service truck', scope: 'fleet', does: 'Moves goods: warehouse ↔ kitchens, linen to the laundry, the night waste run, the supply vessel.' },
  L5: { name: 'Delivery robot', scope: 'fleet', does: 'Brings room service, villa breakfasts, luggage and amenities to the guest.' },
  W1: { name: 'Shuttle boat', scope: 'fleet', does: 'Carries guests mainland ↔ terminal and marina ↔ Beach Club ↔ villas; one remote operator.' },
  W2: { name: 'Supply vessel', scope: 'fleet', does: 'Lands food and consumables at the Service dock, takes waste back; one remote operator.' },
  // W3 excursion boat is not a robot: a skipper drives it with guests aboard (founder 2026-10-19); it stays in the fleet table only
  scrubber: { name: 'Floor-scrubbing robot', scope: 'object', does: 'Washes hard floors in corridors, lobbies and the back of house, mostly at night.' },
  pool: { name: 'Pool-cleaning robot', scope: 'object', does: 'Cleans the pool floor and walls of its villa, hotel or thermal area.' },
  luggage: { name: 'Luggage robot', scope: 'object', does: 'Takes bags from the drop-off to the room and back, inside its building.' },
  table: { name: 'Table-service robot', scope: 'object', does: 'Runs plates and drinks from the pass to the table in the Marina Village cafés.' },
  cocktail: { name: 'Cocktail robot', scope: 'object', does: 'Mixes drinks at the bar; the bartender hosts.' },
  raker: { name: 'Beach-raking robot', scope: 'object', does: 'Sifts and levels the sand of its beach before the guests arrive.' },
  mower: { name: 'Robot mower', scope: 'object', does: 'Mows its lawns at night; docked and charging by day.' },
  hedge: { name: 'Hedge-trimming robot', scope: 'object', does: 'Trims hedges and verges along the paths.' },
  window: { name: 'Window and façade robot', scope: 'object', does: 'Cleans glass façades and high windows.' },
  solar: { name: 'Solar-panel cleaning robot', scope: 'object', does: 'Washes the panel field of the power plant.' },
  pipe: { name: 'Pipe-inspection robot', scope: 'object', does: 'Inspects sewer and water pipes from inside.' },
  hull: { name: 'Hull-cleaning robot', scope: 'object', does: 'Cleans yacht hulls at the berth.' },
  court: { name: 'Court robot', scope: 'object', does: 'Sweeps the courts and collects balls.' },
  agv: { name: 'AGV (goods and linen)', scope: 'object', does: 'Moves pallets and linen carts inside the warehouse, laundry and spa.' },
  picker: { name: 'Picking robot', scope: 'object', does: 'Picks guest orders from the dark-store shelves.' },
  kitchen: { name: 'Kitchen robot', scope: 'object', does: 'Preps vegetables and portions in the prep kitchen; runs the hot line of the staff canteen.' },
  folder: { name: 'Folding robot', scope: 'object', does: 'Folds and stacks linen after the wash line.' },
  sorter: { name: 'Waste-sorting robot', scope: 'object', does: 'Sorts recyclables on the waste line.' },
  dronePatrol: { name: 'Patrol drone', scope: 'object', does: 'Flies security rounds over the island and the marina.' },
  droneRescue: { name: 'Rescue drone', scope: 'object', does: 'Drops a float or an AED at the water sports beach and on medical calls.' },
  charger: { name: 'Charging robot', scope: 'object', does: 'Plugs the pods and trucks in at the Fleet Hub canopy.' },
  lockers: { name: 'Parcel lockers', scope: 'auto', does: 'Automated pick-up points for deliveries.' },
  dishline: { name: 'Dish-washing line', scope: 'auto', does: 'Automated wash line in the restaurant and the staff canteen.' },
  washline: { name: 'Tunnel washer line', scope: 'auto', does: '5,000 kg of linen a day through the laundry.' },
  racking: { name: 'Automated cold-store racking', scope: 'auto', does: 'Shuttle racking in the cold store.' },
  compactor: { name: 'Waste compactor', scope: 'auto', does: 'Compacts and bales waste for the vessel.' },
  crane: { name: 'Remote-operated crane', scope: 'auto', does: 'Unloads the supply vessel at the Service dock.' },
  pedestal: { name: 'Smart shore-power pedestal', scope: 'auto', does: 'Metered power and water at every berth.' },
  fuel: { name: 'Automated fuel dock', scope: 'auto', does: 'Self-service fuelling for yachts.' },
  pumpout: { name: 'Pump-out cart', scope: 'auto', does: 'Mobile sewage pump-out at the berths.' },
  kiosk: { name: 'Self-service kiosk or gate', scope: 'auto', does: 'Check-in gates, self-checkout, telemedicine and provisioning kiosks.' },
  stage: { name: 'Stage automation', scope: 'auto', does: 'Rigging, light and sound presets in the events rotunda.' },
  irrigation: { name: 'Smart irrigation', scope: 'auto', does: 'Sensors and valves running the reclaimed-water irrigation at night.' },
  sensors: { name: 'Cameras and sensors', scope: 'auto', does: 'Security cameras and perimeter sensors feeding the control room.' },
  buoy: { name: 'Safety buoy', scope: 'auto', does: 'Marks the swim zone, reports position and weather.' },
};
// Who put each robot on the list (founder 2026-10-19): 'founder' = asked for by the founder (green); 'claude' = added by Claude (red) with why, when and whether it is a real product.
const ORIGIN = {
  L1: { by: 'founder', note: 'Fleet Register: guest pods are the founder\'s fleet plan.' },
  L2: { by: 'founder', note: 'Fleet Register: guest shuttles, founder\'s fleet plan.' },
  L3: { by: 'founder', note: 'Fleet Register: service carts, founder\'s fleet plan.' },
  L4: { by: 'founder', note: 'Fleet Register: service trucks, founder\'s fleet plan.' },
  L5: { by: 'founder', note: 'Fleet Register: delivery robots (founder: "робот-доставщик").' },
  W1: { by: 'founder', note: 'Fleet Register; autonomous with one operator for all boats: founder\'s brief of 2026-10-19.' },
  W2: { by: 'founder', note: 'Fleet Register; two autonomous service boats bringing goods and taking waste: founder\'s brief of 2026-10-19.' },
  scrubber: { by: 'founder', note: 'Founder 2026-10-19: "роботы-пылесосы, которые обслуживают этаж и общую зону". Real product class (Avidbots Neo, Pudu CC1, Brain Corp).' },
  mower: { by: 'founder', note: 'Founder 2026-10-19: "автономные боты, которые стригут газоны" for the landscaping service. Real (Husqvarna Ceora / Automower).' },
  washline: { by: 'founder', note: 'Founder 2026-10-19: "автономный робот-прачка" in the laundry. Real: tunnel washer lines (Jensen, Girbau, Kannegiesser).' },
  kitchen: { by: 'founder', note: 'Founder 2026-10-19: "в столовой для персонала будет робокитчен". Real but early: Moley, Miso Robotics, Nala, Chef Robotics.' },
  pool: { by: 'claude', note: 'Added 2026-10-19 (people-and-robots pass) because every villa and hotel pool needs daily cleaning. Real, mature: Maytronics Dolphin, Zodiac, Beatbot.' },
  luggage: { by: 'claude', note: 'Added 2026-10-19 to move bags from the drop-off to the room without a porter. Real: Savioke/Relay, Piaggio Gita, LG; hotel pilots.' },
  table: { by: 'claude', note: 'Added 2026-10-19 for the village cafés to cut service staff. Real, widely deployed: Bear Robotics Servi, Pudu BellaBot.' },
  cocktail: { by: 'claude', note: 'Added 2026-10-19 as a guest-facing showpiece at the bars. Real but niche: Makr Shakr, Cecilia.ai.' },
  raker: { by: 'claude', note: 'Added 2026-10-19 because the beaches are products that must be groomed daily. Real but new: BeBot (Poralu Marine / 4ocean), small fleets.' },
  hedge: { by: 'claude', note: 'Added 2026-10-19 to complete landscaping automation. Not a product yet: research prototypes only (Trimbot2020). Treat as invented for now.' },
  window: { by: 'claude', note: 'Added 2026-10-19 for the glass façades. Real but early: Skyline Robotics Ozmo, HyCleaner, Skypro; few units in service.' },
  solar: { by: 'claude', note: 'Added 2026-10-19 because island dust and salt cut solar output. Real, mature in utility solar: Ecoppia, SolarCleano.' },
  pipe: { by: 'claude', note: 'Added 2026-10-19 for sewer and water inspection without digging. Real, mature: CCTV crawlers (Envirosight, IBAK).' },
  hull: { by: 'claude', note: 'Added 2026-10-19 as a marina service for moored yachts. Real but early: Hullbot, HullWiper, Keelcrab.' },
  court: { by: 'claude', note: 'Added 2026-10-19 for the courts. Ball collection is real (Tennibot); automated court sweeping is a stretch — half invented.' },
  agv: { by: 'claude', note: 'Added 2026-10-19 to move pallets and linen carts in the back of house. Real, mature: warehouse AGVs/AMRs (MiR, Geek+).' },
  picker: { by: 'claude', note: 'Added 2026-10-19 for the Dark Store. Real at scale in grocery (Ocado, AutoStore, Berkshire Grey); small-site versions are new.' },
  folder: { by: 'claude', note: 'Added 2026-10-19 after the wash line. Real in industrial laundries (Jensen, Kannegiesser folders); consumer versions failed (FoldiMate).' },
  sorter: { by: 'claude', note: 'Added 2026-10-19 to lift the recycling share. Real: AMP Robotics, ZenRobotics; sized for plants bigger than this island — an assumption.' },
  dronePatrol: { by: 'claude', note: 'Added 2026-10-19 for security rounds. Real: Nightingale, Asylon, Skydio Dock; regulations vary by country.' },
  droneRescue: { by: 'claude', note: 'Added 2026-10-19 for the swim and water-sports beaches. Real: lifeguard drones (Little Ripper, Everdrone AED delivery).' },
  charger: { by: 'claude', note: 'Added 2026-10-19 so the pods charge without a person. Pilots only: Rocsys, VW mobile charging robot, Evar — near-future.' },
  lockers: { by: 'claude', note: 'Added 2026-10-19 for parcel pick-up at the residences. Real, commodity (Amazon Hub, InPost).' },
  dishline: { by: 'claude', note: 'Added 2026-10-19 for the restaurant and canteen. Real: automated rack conveyors (Meiko, Hobart, Winterhalter) plus Dishcraft-type robots.' },
  racking: { by: 'claude', note: 'Added 2026-10-19 for the cold store. Real: shuttle and automated racking (Mecalux, SSI Schaefer).' },
  compactor: { by: 'claude', note: 'Added 2026-10-19 so waste leaves in fewer containers. Real, commodity.' },
  crane: { by: 'claude', note: 'Added 2026-10-19 to unload the autonomous vessel without a crane driver. Real in ports (remote-operated STS cranes); small-dock version is an assumption.' },
  pedestal: { by: 'claude', note: 'Added 2026-10-19 so berth power and water are metered per boat. Real, standard in marinas (Rolec, Marina Electrical Equipment).' },
  fuel: { by: 'claude', note: 'Added 2026-10-19 for 24 h fuelling. Real: unattended fuel docks with card payment are common.' },
  pumpout: { by: 'claude', note: 'Added 2026-10-19 for sewage at the berth. Real: mobile pump-out carts (Edson, Keco); not autonomous — a cart staff tow.' },
  kiosk: { by: 'claude', note: 'Added 2026-10-19 for face check-in, self-checkout, telemedicine. Real, commodity.' },
  stage: { by: 'claude', note: 'Added 2026-10-19 so one technician runs events. Real: theatre automation (Waagner-Biro, TAIT).' },
  irrigation: { by: 'claude', note: 'Added 2026-10-19 so reclaimed water is used at night without staff. Real, commodity (Rain Bird, Hunter with soil sensors).' },
  sensors: { by: 'claude', note: 'Added 2026-10-19 as the eyes of the control room. Real, commodity.' },
  buoy: { by: 'claude', note: 'Added 2026-10-19 for the swim zone and weather at the water-sports base. Real: smart buoys (Sofar Spotter); the safety role is a composite.' },
};
const robotOf = id => ROBOTS[id] || { name: id, scope: 'object', does: '' };
// Which proforma service a robot works for (founder 2026-10-20: the Physical AI page goes object first, then its robots and their service).
// Rule: a robot inside a service object works for that service (a picker in the Dark Store → Dark Store). Inside a product it works for
// the service below; null = the product's own operation (table service, bar, courts, stage), no proforma service.
const ROBOT_SERVICE = { scrubber: 'cleaning', window: 'cleaning', pool: 'cleaning', luggage: 'guestservices', kiosk: 'guestservices', lockers: 'darkstore',
  mower: 'landscaping', hedge: 'landscaping', irrigation: 'landscaping', raker: 'landscaping', dronePatrol: 'security', droneRescue: 'security', sensors: 'security',
  buoy: 'security', pedestal: 'yacht-services', pumpout: 'yacht-services', fuel: 'yacht-services', hull: 'yacht-services', agv: 'laundry', solar: 'power',
  pipe: 'sewage', crane: 'dock', picker: 'darkstore', folder: 'laundry', washline: 'laundry', sorter: 'waste', compactor: 'waste', racking: 'stores',
  kitchen: 'canteen', charger: 'fleet', table: null, cocktail: null, dishline: null, court: null, stage: null };
const serviceOfRobot = (eid, rid) => (SERVICES.some(s => s.id === eid) || eid === 'fleet' ? eid : ROBOT_SERVICE[rid] ?? null);
// People and robots (founder 2026-10-19): every entity names who works there and which robots do a specific job. Numbers at the plan's scale;
// the product rows sum to the card's staff positions. Robot rows are ROBOTS ids; fleet-scope robots live only in the Fleet Hub (founder 2026-10-19).
const OUTLET_OF = { 'beach-hotel': 'Beach Hotel', 'hill-hotel': 'Hill Hotel', restaurant: 'Restaurant', village: 'Marina Village', 'beach-club': 'Beach Club', 'members-club': 'Members Club' };
const TEAM = {
  'beach-hotel': { people: { 'Front office and concierge': 24, 'Housekeeping': 70, 'F&B service': 60, 'Kitchen (chefs and cooks)': 44, 'Butlers': 12, 'Engineering': 14, 'Pool and beach attendants': 20, 'Management and admin': 26 }, robots: { scrubber: 6, luggage: 2, pool: 2 } },
  'apart-hotel': { people: { 'Reception and concierge': 6, 'Housekeeping': 14, 'Maintenance': 4, 'Management': 6 }, robots: { scrubber: 2, lockers: 1 } },
  'hill-hotel': { people: { 'Front office and concierge': 12, 'Housekeeping': 38, 'F&B service': 28, 'Kitchen (chefs and cooks)': 22, 'Butlers': 6, 'Engineering': 8, 'Attendants': 8, 'Management and admin': 13 }, robots: { scrubber: 3, luggage: 1, pool: 1 } },
  villas: { people: { 'Butlers': 18, 'Housekeeping': 12, 'Villa chefs': 6, 'Maintenance': 4 }, robots: { pool: 6, mower: 3 } },
  residences: { people: { 'Concierge': 12, 'Housekeeping': 46, 'Maintenance': 14, 'Owner services': 8, 'Management and admin': 15 }, robots: { scrubber: 4, lockers: 2 } },
  village: { people: { 'F&B service': 36, 'Kitchen (chefs and cooks)': 24, 'Retail': 16, 'Market': 5, 'Management': 4 }, robots: { table: 6, scrubber: 3 } },
  restaurant: { people: { 'Head chef and brigade': 22, 'Service': 28, 'Sommeliers': 3, 'Stewards': 5, 'Management': 2 }, robots: { cocktail: 1, dishline: 1 } },
  'beach-club': { people: { 'Service': 18, 'Kitchen': 10, 'Beach attendants': 8, 'Management': 4 }, robots: { raker: 1, cocktail: 1 } },
  'members-club': { people: { 'Service': 14, 'Kitchen': 8, 'Membership and events': 4, 'Management': 4 }, robots: { scrubber: 1 } },
  'hotel-beach': { people: { 'Beach attendants': 8, 'Kiosk and bar': 6 }, robots: { raker: 1, kiosk: 1 } },
  'club-beach': { people: { 'Beach attendants': 6, 'Beach service': 4 }, robots: { raker: 1 } },
  'water-sports': { people: { 'Instructors': 6, 'Dive master and boat crew': 3, 'Desk and equipment': 3 }, robots: { droneRescue: 1, buoy: 2 } },
  spa: { people: { 'Therapists': 18, 'Reception': 6, 'Attendants': 6, 'Longevity doctors': 2 }, robots: { pool: 2, agv: 1 } },
  sport: { people: { 'Trainers': 8, 'Reception': 3, 'Court staff': 4 }, robots: { court: 2 } },
  marina: { people: { 'Harbour master and office': 6, 'Dock hands': 14, 'Technical': 6, 'Fuel dock': 2 }, robots: { dronePatrol: 1, pedestal: 90, pumpout: 2 } },
  events: { people: { 'Event managers': 4, 'Technicians (sound, light)': 4, 'Set-up crew': 2 }, robots: { scrubber: 2, stage: 1 } },
  power: { people: { 'Plant engineers (3 shifts)': 8 }, robots: { solar: 2 } },
  desal: { people: { 'Operators': 4 }, robots: {} },
  sewage: { people: { 'Operators': 3 }, robots: { pipe: 1 } },
  network: { people: { 'Network engineers (NOC)': 4 }, robots: {} },
  stores: { people: { 'Receiving and storekeepers': 12, 'Prep-kitchen cooks': 20 }, robots: { agv: 4, kitchen: 2, racking: 1 } },
  darkstore: { people: { 'Pickers and packers': 10 }, robots: { picker: 4 } },
  laundry: { people: { 'Loaders and finishers': 18 }, robots: { folder: 2, agv: 2, washline: 1 } },
  staffacc: { people: { 'Reception': 4, 'Housekeeping': 8 }, robots: { scrubber: 2 } },
  office: { people: { 'Management': 14, 'Finance and HR': 12, 'Operator console': 8, 'Sales and revenue': 10, 'IT': 6 }, robots: { kiosk: 2 } },
  canteen: { people: { 'Service and loading': 6 }, robots: { kitchen: 1, dishline: 1, kiosk: 4 } },
  cleaning: { people: { 'Housekeepers': 120, 'Public-area cleaners': 30, 'Supervisors': 10 }, robots: { window: 2 } },
  landscaping: { people: { 'Gardeners': 24, 'Irrigation technicians': 2, 'Arborist': 1 }, robots: { mower: 12, hedge: 2, irrigation: 1 } },
  waste: { people: { 'Sorters': 8, 'Drivers': 2 }, robots: { sorter: 1, compactor: 4 } },
  dock: { people: { 'Dock crew': 4, 'Vessel operator (remote, both vessels)': 1 }, robots: { crane: 1 } },
  guestservices: { people: { 'Butlers': 24, 'Concierge': 9, 'Guest-app operators': 6 }, robots: {} },
  medical: { people: { 'Doctors': 3, 'Nurses': 6 }, robots: { droneRescue: 1, kiosk: 2 } },
  security: { people: { 'Control room': 6, 'Patrol': 12, 'Lifeguards': 8, 'Fire crew': 6 }, robots: { dronePatrol: 2, sensors: 400 } },
  'marina-support': { people: { 'Harbour office': 6, 'Technicians': 4, 'Crew lounge attendants': 3 }, robots: { kiosk: 1 } },   /* + the crew lounge (founder 2026-10-20) */
  'yacht-services': { people: { 'Dock hands': 8, 'Fuel attendants': 2 }, robots: { hull: 1, fuel: 1 } },
  'guest-dock': { people: { 'Dock staff': 6, 'Shuttle operator (remote, all boats)': 1, 'Porters': 4 }, robots: { luggage: 4, kiosk: 3 } },
  'excursion-terminal': { people: { 'Guides': 4, 'Desk': 2, 'Skippers (guests aboard)': 3 }, robots: {} },
  fleet: { people: { 'Dispatchers': 4, 'Technicians': 10, 'Remote supervisors (pods, boats)': 4 }, robots: Object.assign({ charger: 2 }, ...['L1', 'L2', 'L3', 'L4', 'L5', 'W1', 'W2'].map(k => ({ [k]: FLEET_PLAN[k] }))) },
};

// Operations (founder 2026-10-21): the card shows the key operations of each object, not its workforce. At most 10 per object, each one
// task that one actor could do (verb + object, task-statement level as in O*NET), so the next step can mark it robot / fixed automation / person.
// TEAM above stays as the source of the Physical AI page; every people row and robot of TEAM is covered by an operation here.
const OPS = {
  'beach-hotel': ['Check-in and check-out', 'Luggage to and from the room', 'Room cleaning and turndown', 'Linen and amenity restock', 'Breakfast and restaurant service', 'Kitchen production', 'Room service delivery', 'Pool and beach service', 'Butler requests', 'Maintenance and repairs'],
  'apart-hotel': ['Check-in and key handover', 'Apartment cleaning', 'Linen and amenity restock', 'Parcel and grocery drop', 'Maintenance and repairs', 'Guest requests'],
  'hill-hotel': ['Check-in and check-out', 'Luggage to and from the room', 'Room cleaning and turndown', 'Linen and amenity restock', 'Breakfast and restaurant service', 'Kitchen production', 'Room service delivery', 'Pool service and cleaning', 'Butler requests', 'Maintenance and repairs'],
  villas: ['Arrival and villa briefing', 'Butler requests', 'Villa cleaning and turndown', 'In-villa cooking', 'Pool cleaning and water care', 'Garden and lawn care', 'Grocery and linen restock', 'Maintenance and repairs'],
  residences: ['Owner and guest check-in', 'Concierge requests', 'Apartment cleaning (rental pool)', 'Parcel and grocery drop', 'Common-area cleaning', 'Owner services (handover, inspections)', 'Maintenance and repairs'],
  village: ['Table service', 'Kitchen production', 'Bar service', 'Retail sales and restock', 'Market stalls set-up', 'Dish washing', 'Paths and terrace cleaning', 'Goods receiving'],
  restaurant: ['Reservations and seating', 'Kitchen production', 'Table service', 'Wine service', 'Cocktail and bar service', 'Dish washing', 'Goods receiving and storage'],
  'beach-club': ['Sunbed and cabana service', 'Food and drink service', 'Kitchen production', 'Cocktail and bar service', 'Beach raking and cleaning', 'Towel service', 'DJ sunset set-up'],
  'members-club': ['Membership desk', 'Dining service', 'Kitchen production', 'Bar service', 'Pool deck service', 'Private events', 'Club cleaning'],
  'hotel-beach': ['Sunbed set-up and towels', 'Beach raking and cleaning', 'Kiosk and bar service', 'Order at the sunbed', 'Lifeguard watch'],
  'club-beach': ['Sunbed set-up and towels', 'Beach raking and cleaning', 'Drinks from the club', 'Water activity hand-over', 'Lifeguard watch'],
  'water-sports': ['Bookings and waivers', 'Equipment issue and return', 'Lessons', 'Dive and snorkel trips', 'Boat crewing', 'Water rescue watch', 'Buoy and zone marking', 'Equipment washing and repair'],
  spa: ['Bookings and reception', 'Treatments and massage', 'Longevity diagnostics', 'Thermal area attendance', 'Pool water care', 'Linen supply to rooms', 'Room reset and cleaning'],
  sport: ['Bookings and reception', 'Personal training and classes', 'Court booking and set-up', 'Ball collection and court care', 'Equipment care', 'Clubhouse service'],
  marina: ['Berth booking and allocation', 'Mooring and line handling', 'Power and water at the berth', 'Sewage pump-out', 'Fuel dock', 'Harbour patrol', 'Technical repairs', 'Billing'],
  events: ['Event booking and planning', 'Set-up and breakdown', 'Sound and light', 'Stage operation', 'Ticketing and entry', 'Catering service', 'Venue cleaning'],
  power: ['Generation dispatch', 'Solar panel cleaning', 'Battery storage control', 'Metering', 'Preventive maintenance', 'Fault response'],
  desal: ['Reverse-osmosis plant control', 'Water quality testing', 'Storage and pressure control', 'Membrane cleaning', 'Preventive maintenance'],
  sewage: ['Treatment plant control', 'Effluent quality testing', 'Sludge handling', 'Pipe inspection', 'Reclaimed water supply'],
  network: ['Network monitoring (NOC)', 'Wi-Fi and cellular coverage', 'Device and sensor provisioning', 'Cyber security', 'Fault repair'],
  stores: ['Goods receiving and checking', 'Put-away and storage', 'Cold-chain monitoring', 'Prep-kitchen production', 'Picking for outlets', 'Internal delivery', 'Stock counts'],
  darkstore: ['Order intake', 'Picking and packing', 'Hand-over to delivery', 'Pick-up lockers', 'Restock from the warehouse'],
  laundry: ['Collection of used linen', 'Sorting', 'Washing and drying', 'Ironing and folding', 'Delivery of clean linen', 'Stock and repair of linen'],
  office: ['Management and planning', 'Finance and payroll', 'HR and hiring', 'Sales and revenue', 'Operator console', 'IT support'],
  staffacc: ['Room allocation and keys', 'Room and common-area cleaning', 'Staff laundry', 'Shift-change shuttle', 'Maintenance and repairs'],
  canteen: ['Meal production', 'Serving at shift changes', 'Ordering at kiosks', 'Dish washing', 'Goods receiving'],
  cleaning: ['Guest room cleaning', 'Public-area cleaning', 'Floor scrubbing', 'Window cleaning', 'Pool cleaning', 'Quality inspections'],
  landscaping: ['Lawn mowing', 'Hedge trimming', 'Irrigation', 'Beach raking', 'Planting and tree care', 'Green waste collection'],
  waste: ['Collection from objects', 'Sorting', 'Compaction', 'Composting', 'Ship-out to the mainland'],
  dock: ['Vessel berthing', 'Unloading and loading', 'Container and pallet handling', 'Transfer to the warehouse', 'Waste ship-out'],
  guestservices: ['Butler requests', 'Concierge and bookings', 'Guest-app chat', 'Luggage handling', 'Info kiosks', 'Complaint handling'],
  medical: ['Clinic consultations', 'First aid', 'Emergency response', 'Medical evacuation', 'Pharmacy and kiosks'],
  security: ['Control room monitoring', 'Patrols', 'Drone patrol', 'Lifeguard watch', 'Fire response', 'Access control', 'Sensor alarms'],
  'marina-support': ['Harbour office', 'Customs and crew papers', 'Technical workshop', 'Crew lounge', 'Info kiosk'],
  'yacht-services': ['Fuel delivery', 'Hull cleaning', 'Provisioning', 'Water and power top-up', 'Line handling'],
  'guest-dock': ['Boat arrival and mooring', 'Guest welcome', 'Luggage transfer', 'Shuttle boat dispatch', 'Check-in kiosks'],
  'excursion-terminal': ['Excursion booking', 'Guide hand-over', 'Boarding', 'Boat crewing', 'Return and feedback'],
  fleet: ['Job dispatch', 'Remote supervision', 'Charging', 'Cleaning of vehicles', 'Maintenance and repairs', 'Fleet planning'],
};
const opsHtml = id => { const o = OPS[id]; if (!o) return ''; return `<div class="sec ops"><div class="cap">Operations · ${o.length}</div><ol>${o.map(x => `<li>${x}</li>`).join('')}</ol></div>`; };
// 30-day occupancy (founder 2026-10-19): today is day 5; days 1–4 are actuals, today is live, days 6–30 are the forecast.
// The month runs from low to high season (base 48 % → 78 %), Friday and Saturday nights +12, Sunday +4, product factor, deterministic noise.
const TODAY_IDX = 4, DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FC_FACTOR = { 'beach-hotel': 1.0, 'hill-hotel': 0.95, 'apart-hotel': 0.85, villas: 0.9, residences: 0.72, village: 0.9, restaurant: 0.9, 'beach-club': 1.0, 'members-club': 0.8, 'hotel-beach': 0.95, 'club-beach': 0.9, 'water-sports': 0.8, spa: 0.85, sport: 0.75, marina: 0.8, events: 0.8 };
const hash = str => { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const forecast = (c, todayDow = 0) => { const f = FC_FACTOR[c.id] || 0.85, h0 = hash(c.id), out = [];
  for (let d = 0; d < 30; d++) { const dow = (todayDow + d - TODAY_IDX + 70) % 7, we = dow === 4 || dow === 5 ? 12 : dow === 6 ? 4 : 0, wePeak = c.id === 'villas' || c.id === 'beach-club' || c.id === 'club-beach' ? we * 1.6 : we;
    const noise = ((hash(c.id + d) % 900) / 100) - 4.5; out.push(Math.max(10, Math.min(100, Math.round((48 + 30 * d / 29) * f + wePeak + noise)))); }
  return out; };
const chartHtml = c => { const v = forecast(c); return `<div class="sec detail"><div class="cap">30 days · occupancy</div><div class="f30" data-f30="${c.id}">${v.map((p, d) => `<i class="${d < TODAY_IDX ? 'past' : d === TODAY_IDX ? 'today' : 'fc'}" style="height:${p}%" title="Day ${d + 1} · ${p} %"></i>`).join('')}</div></div>`; };
const refreshCharts = (L, loads) => { const todayDow = Math.max(0, DOW.indexOf((L.day || 'Mon').slice(0, 3)));
  for (const c of PRODUCTS) { const el = document.querySelector(`[data-f30="${c.id}"]`); if (!el) continue; const v = forecast(c, todayDow), bars = el.children;
    for (let d = 0; d < 30; d++) { const dow = DOW[(todayDow + d - TODAY_IDX + 70) % 7], p = d === TODAY_IDX && loads[c.id] !== undefined ? loads[c.id] : v[d]; bars[d].style.height = p + '%'; bars[d].title = `Day ${d + 1} · ${dow} · ${p} %${d === TODAY_IDX ? ' · live' : d < TODAY_IDX ? ' · actual' : ' · forecast'}`; bars[d].classList.toggle('we', dow === 'Fri' || dow === 'Sat'); } } };
// accommodation: room types with their count and a live occupancy bar in the same row (founder 2026-10-19); no prose
const roomRows = c => `<div class="rooms" data-rooms="${c.id}">${Object.entries(c.objects).map(([k, n]) => `<div class="rr"><span>${k}</span><div class="bar"><i style="width:0"></i></div><b>${n}</b></div>`).join('')}</div>`;
const productCard = (c, link = true) => `<div class="con" id="${c.id}">${productInner(c, link)}</div>`;
// the marina as a full-width block (founder 2026-10-19), like the Fleet Hub: the card on the left, the berths by class on the right
const marinaBlock = (link = true) => { const c = entityOf('marina'), d = needs(c, OCC); return `<div class="con wide cols" id="marina">
  <div class="col">${hdHtml(c, link)}${opTag(c.op)}<p>${c.what}</p>
    <div class="live"><div class="cap"><i></i>Now</div><div class="kv" data-live="marina"><span>Berths occupied</span><span>—</span></div></div>
    ${chartHtml(c)}
    <div class="sec"><div class="cap">By class · live</div><table class="t mini"><thead><tr><th>Class</th><th class="num">Berths</th><th class="num">Occupied</th><th style="width:38%"></th></tr></thead><tbody id="marinaRows"></tbody></table><p class="muted" style="font-size:11.5px;margin:4px 0 0">Plan 90 berths (50 S · 32 M · 8 L); the model holds 126.</p></div></div>
  <div class="col">
    <div class="sec"><div class="cap">Produces</div><p>${c.produces}</p></div>
    <div class="sec detail"><div class="cap">Consumes a day</div><div class="kv"><span>Water</span><span>${fmt(d.water)} m³</span><span>Energy</span><span>${fmt(d.energy)} kWh</span><span>Food and beverage</span><span>${fmt(d.food, 2)} t</span><span>Clean linen</span><span>${fmt(d.laundry)} kg</span></div></div>
    <div class="sec detail"><div class="cap">Returns a day</div><div class="kv"><span>Sewage</span><span>${fmt(d.sewage)} m³</span><span>Waste</span><span>${fmt(d.waste, 2)} t</span><span>Used linen</span><span>${fmt(d.laundry)} kg</span></div></div></div>
  <div class="col">${opsHtml('marina')}</div>
  <div class="col"><div class="cap">Next movements</div><table class="t mini"><thead><tr><th>Time</th><th>Movement</th><th>Class</th></tr></thead><tbody id="marinaNext"><tr><td colspan="3" class="muted">—</td></tr></tbody></table><div class="kv" data-live="marina-moves" style="margin-top:8px"><span>Under way</span><span>—</span></div></div>
  <div class="col"><div class="cap">Yacht services · this month</div><div class="kv" data-live="ys-month"><span>Fresh water</span><span>—</span></div>
    <div class="cap" style="margin-top:10px">Log</div><table class="t mini ys"><tbody id="ysLog"><tr><td class="muted">—</td></tr></tbody></table></div></div>`; };   // yacht services as the fifth column (founder 2026-10-20)
const serviceCard = (c, link = true) => `<div class="con svc" id="${c.id}">${hdHtml(c, link)}${opTag(c.op)}<p>${c.what}</p>
  <div class="live"><div class="cap"><i></i>Now</div><div class="kv" data-live="${c.id}"><span>Load</span><span>—</span></div></div>
  <div class="sec"><div class="cap">Produces</div><div class="kv">${kv(c.produces)}</div></div>
  <div class="sec"><div class="cap">Consumes</div><div class="kv">${kv(c.consumes)}</div></div>
  ${opsHtml(c.id)}</div>`;
const fleetCard = (link = true) => `<div class="con wide cols" id="fleetCard">
  <div class="col">${hdHtml(FLEET_HUB, link)}${opTag(FLEET_HUB.op)}<p>${FLEET_HUB.what}</p>
    <div class="live"><div class="cap"><i></i>Now</div><div class="kv" data-live="fleet"><span>Load</span><span>—</span></div></div></div>
  <div class="col">
    <div class="sec"><div class="cap">Produces</div><div class="kv">${kv(FLEET_HUB.produces)}</div></div>
    <div class="sec"><div class="cap">Consumes</div><div class="kv">${kv(FLEET_HUB.consumes)}</div></div></div>
  <div class="col">${opsHtml('fleet')}</div>
  <div class="col span2"><div class="cap">Fleet · plan vs demo, live</div><div class="scroll"><table class="t"><thead><tr><th>Type</th><th class="num">Plan</th><th class="num">Demo</th><th class="num">Moving</th><th class="num">Charging</th><th class="num">Battery</th></tr></thead><tbody id="fleetRows"></tbody></table></div></div></div>`;   // the same vertical blocks as the marina (founder 2026-10-19); the fleet table takes two columns
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
  const st = document.getElementById('stLine'); if (st) st.innerHTML = `${L.day} · simulated time, 1 s = 1 min · <b>${fmt(Object.values(L.people).reduce((a, b) => a + b, 0) - (L.people.staff || 0) - (L.people.crew || 0))}</b> guests in the simulation, shown at the plan's scale (× ${L.scale}) · <b>${L.onShift}</b> staff on shift · ${L.events.length ? 'now: ' + L.events.join(', ') : 'no event running'}`;
  refreshSchedule(L.hour); for (const td of document.querySelectorAll('[data-evrow]')) { const e = EVENTS[+td.dataset.evrow], b = bookings(e, L.hour); td.textContent = `${b.n} of ${e.cap} · ${b.label}`; }
  const loads = {};
  for (const c of PRODUCTS) {
    const g = c.live.reduce((a, n) => a + (L.products[n] || 0), 0), stf = Math.round(c.staff * L.shiftShare), cap = capacityOf(c);
    const keys = c.rooms ? Object.values(c.objects).reduce((x, y) => x + y, 0) : 0, inHouse = c.rooms && L.booked ? c.live.reduce((x, n) => x + (L.booked[n] || 0), 0) : 0, booked = c.rooms ? Math.min(keys, Math.round(inHouse / (cap / keys))) : 0, pb = keys ? Math.round(100 * booked / keys) : 0;
    const rows = c.noSim ? [['Booked tonight', '<small style="color:var(--muted);font-weight:400">not in the model yet</small>']]   /* no Staff on shift on product cards: Workforce shows the staff (founder 2026-10-20) */
      : c.rooms ? [['Booked tonight', `${booked} <small style="color:var(--muted);font-weight:400">of ${keys} keys · ${pb} %</small>`], ['bar', bar(pb, 101)], ['Guests in house', `${fmt(inHouse)} <small style="color:var(--muted);font-weight:400">of ${fmt(cap)}</small>`], ['bar', bar(Math.round(100 * inHouse / cap), 101)], ['Guests now', `${fmt(g)} <small style="color:var(--muted);font-weight:400">of ${fmt(cap)}</small>`], ['bar', bar(Math.round(100 * g / cap), 101)]]   // every row a bar (founder 2026-10-19); bookings = guests whose home is here
      : [['Guests now', `${fmt(g)} <small style="color:var(--muted);font-weight:400">of ${fmt(cap)} · ${Math.round(100 * g / cap)} %</small>`], ['bar', bar(Math.round(100 * g / cap), 101)]];   // the bar = share of the product's own capacity (founder 2026-10-19)
    if (c.id === 'marina') {                                                 // the marina's capacity is berths (founder 2026-10-19); the classes live in the table on the right, not twice
      const M = L.marina; rows.length = 0;
      rows.push(['Berths occupied', `${M.moored} / ${M.berths}`], ['bar', bar(Math.round(100 * M.moored / M.berths), 101)]);
      const NAME = { S: 'S · to 15 m', M: 'M · to 35 m', L: 'L · to 80 m' };
      const mr = document.getElementById('marinaRows'); if (mr) mr.innerHTML = ['S', 'M', 'L'].map(k => { const b = M.byCls[k] || { moored: 0, berths: 0 }; return `<tr><td>${NAME[k]}</td><td class="num">${b.berths}</td><td class="num">${b.moored}</td><td class="bar-td">${bar(Math.round(100 * b.moored / Math.max(1, b.berths)), 101)}</td></tr>`; }).join('');
      setLive('marina-moves', [['Under way now', M.underway], ['Left today', `${M.arrivalsLeft} in · ${M.departuresLeft} out`]]);
      { const S = M.service; if (S) { const f = n => Math.round(n).toLocaleString('en-US');
          setLive('ys-month', [['Fresh water', f(S.month.water) + ' m³'], ['Pump-out', f(S.month.pump) + ' m³'], ['Diesel sold', f(S.month.diesel) + ' L'], ['Shore power', f(S.month.kwh / 1000) + ' MWh']]);
          const ARROW = { arrive: '<b class="ys-in">↓</b>', depart: '<b class="ys-out">↑</b>' }, WHAT = { arrive: 'Arrived', depart: 'Departed', fuel: 'Refuelled', pumpout: 'Pumped out', water: 'Fresh water', power: 'Shore power on' };
          const UNIT = { fuel: ' L', pumpout: ' m³', water: ' m³' }, yl = document.getElementById('ysLog');
          if (yl) yl.innerHTML = S.log.length ? S.log.map(e => `<tr><td>${e.t}</td><td>${ARROW[e.kind] || '<b class="ys-svc">·</b>'} ${WHAT[e.kind] || e.kind}</td><td>${e.berth}</td><td class="num">${e.qty ? f(e.qty) + (UNIT[e.kind] || '') : ''}</td></tr>`).join('') : '<tr><td class="muted">nothing yet today</td></tr>'; } }
      const mn = document.getElementById('marinaNext'); if (mn) mn.innerHTML = (M.upcoming || []).length ? M.upcoming.map(u => `<tr><td>${u.at}</td><td>${u.kind === 'arrive' ? '↓ Arrival' : '↑ Departure'}</td><td>${u.cls}</td></tr>`).join('') : '<tr><td colspan="3" class="muted">no more today</td></tr>'; }
    if (c.id === 'events') rows.push(['Running', L.events.filter(e => /Rotunda/.test(e)).map(e => e.split(' · ')[0]).join(', ') || '—']);
    setLive(c.id, rows);
    if (!c.noSim) loads[c.id] = c.rooms ? pb : c.id === 'marina' ? Math.round(100 * L.marina.moored / L.marina.berths) : Math.min(100, Math.round(100 * g / cap));   // today's bar = the live level; for venues the peak of the day stays in the forecast
    const o = L.supply && OUTLET_OF[c.id] && L.supply.outlets[OUTLET_OF[c.id]]; if (o) rows.push(['Covers served today', fmt(o.meals)], ['Kitchen stock', `${Math.round(o.stock)} kg <small style="color:var(--muted);font-weight:400">of ${o.par} par</small>`], ['bar', bar(Math.round(100 * o.stock / o.par), 101)]);
    if (c.rooms) { const p = pb; for (const i of document.querySelectorAll(`[data-rooms="${c.id}"] .bar i`)) { i.style.width = p + '%'; i.classList.toggle('over', p >= 100); } }
  }
  refreshCharts(L, loads);
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
