// utils/i18n.js
// Lightweight i18n for KrishiSetu — English / తెలుగు / हिन्दी.
// Farmers click a language pill in the header (EN · తె · हि) and the whole
// interface switches immediately. Choice is persisted in a cookie + session.
//
// The `t(key, params)` helper resolves keys against the active language
// dictionary, falling back to English, then to the key itself.
// Values may contain {name} placeholders filled by `params`.

const LANGS = {
  /* ================================================================ */
  /* English                                                            */
  /* ================================================================ */
  en: {
    // Brand / nav
    'brand.tag': 'Farmer & Crop Listings',
    'nav.home': 'Home',
    'nav.browse': 'Browse',
    'nav.trends': 'Price Trends',
    'nav.dashboard': 'My Dashboard',
    'nav.admin': 'Admin Panel',
    'nav.edit': '✏️ Edit',
    'nav.logout': 'Logout',
    'nav.enter': '🚪 Enter',
    'nav.adminLogin': '🛡️ Admin login',
    'nav.toggle': 'Toggle menu',
    'lang.label': 'Language',
    'lang.en': 'English',
    'lang.te': 'తెలుగు',
    'lang.hi': 'हिन्दी',

    // Hero
    'hero.kicker': 'One shared platform',
    'hero.title1': 'Every crop. Every price.',
    'hero.title2': 'Every farmer & buyer —',
    'hero.title3': 'together.',
    'hero.sub':
      'Farmers post structured listings of what they grow and at what price. Buyers search, compare and connect — no more word of mouth or scattered WhatsApp groups.',
    'hero.browseBtn': '🔍 Browse crop listings',
    'hero.enterBtn': '🚪 Enter — no password',

    // Hero stats
    'stats.farmers': 'Farmers registered',
    'stats.buyers': 'Buyers registered',
    'stats.listings': 'Live crop listings',

    // How it works
    'how.title': 'How it works',
    'how.s1t': 'Farmer enters & lists',
    'how.s1p':
      'Enter with just your name, mobile and address — no password. Then post your crop, variety, quantity, price, quality and pickup village in one structured form.',
    'how.s2t': 'Buyer searches & compares',
    'how.s2p':
      'Filter live listings by crop, village, quality and price range. Compare rates across the district instantly.',
    'how.s3t': 'Direct contact, fair price',
    'how.s3p':
      "Express interest or save listings. You get the farmer's details directly — no middlemen, transparent rates.",

    // Home sections
    'home.recentTitle': 'Fresh on the market',
    'home.recentSub': 'Latest structured listings from farmers across the district.',
    'home.viewAll': 'View all →',
    'home.noListings': 'No listings yet — be the first!',
    'home.enterAsFarmer': 'Enter as a farmer',
    'home.listYourCrop': 'and list your crop.',
    'home.priceTitle': 'Price snapshot — last 14 days',
    'home.priceSub': 'Average quoted rate (₹/kg) from current structured records.',
    'home.fullTrends': 'Full trends & charts →',

    // Tables (shared headers)
    'table.crop': 'Crop',
    'table.avgPrice': 'Avg price (₹/kg)',
    'table.listings': 'Listings',
    'table.vsPrev': 'vs previous fortnight',
    'table.notEnough': 'not enough data',

    // Role CTA
    'cta.farmerT': "I'm a farmer",
    'cta.farmerP':
      'List your harvest in minutes. Reach every buyer in the district with one structured post.',
    'cta.farmerBtn': 'Post a crop listing',
    'cta.buyerT': "I'm a buyer",
    'cta.buyerP':
      "Know what's available and at what price before you travel. Compare and connect directly.",
    'cta.buyerBtn': 'Find crops',

    // Auth / entry
    'auth.welcomeTitle': 'Welcome to KrishiSetu',
    'auth.welcomeSub':
      'farmers & buyers enter with name, mobile & address. No passwords, no usernames.',
    'auth.userTab': '👨‍🌾 Farmer / Buyer',
    'auth.adminTab': '🛡️ Admin login',
    'auth.userLead':
      "New here? Your name, mobile & address create your account — the details appear in the admin panel. Returning? Enter the same details and you're in.",
    'auth.iAm': 'I am a…',
    'auth.roleFarmer': '👨‍🌾 Farmer',
    'auth.roleFarmerSub': 'I grow and sell crops',
    'auth.roleBuyer': '🛒 Buyer',
    'auth.roleBuyerSub': 'I buy crops to trade or use',
    'auth.fullName': 'Full name',
    'auth.namePh': 'e.g. Ramesh Chandra',
    'auth.mobile': 'Mobile number',
    'auth.village': 'Village / town',
    'auth.selectOptional': '— Select (optional) —',
    'auth.select': '— Select —',
    'auth.address': 'Address (street / landmark)',
    'auth.addressPh': 'e.g. 4-56, Main Road, near temple',
    'auth.landSize': 'Land size (farmer)',
    'auth.landSizePh': 'e.g. 5 acres',
    'auth.businessType': 'Business type (buyer)',
    'auth.enterBtn': '🚪 Enter KrishiSetu',
    'auth.noPassword': 'No password. Your mobile number identifies your account.',
    'auth.adminLead': 'Only the district administrator logs in with a username & password.',
    'auth.userOrEmail': 'Username or email',
    'auth.password': 'Password',
    'auth.forgot': 'Forgot password?',
    'auth.adminSubmit': '🛡️ Admin login',
    'auth.demoTitle': 'Demo accounts (click to reveal)',
    'auth.demoAdmin': 'Admin (only password login)',
    'auth.demoFarmer': 'Farmer',
    'auth.demoBuyer': 'Buyer',
    'auth.backToLogin': '← Back to login',

    // Forgot password
    'forgot.title': 'Admin password recovery',
    'forgot.sub':
      "Only the admin account uses a password. Enter the admin username (SURYAS) or email and we'll send a 6-digit OTP.",
    'forgot.adminUserOrEmail': 'Admin username or email',
    'forgot.sendOtp': '📧 Send OTP',
    'forgot.demoMode': 'DEMO MODE',
    'forgot.demoNote1': 'no email server is configured, so here is your one-time code:',
    'forgot.demoNote2': '(also printed in the server console — valid for 10 minutes)',
    'forgot.continueOtp': 'Continue → Enter OTP',

    // Reset password
    'reset.title': 'Reset admin password',
    'reset.sub': 'Enter the OTP sent to the admin email, then choose a new password.',
    'reset.otpLabel': '6-digit OTP',
    'reset.newPass': 'New password (min 6 characters)',
    'reset.confirmPass': 'Confirm new password',
    'reset.updatePass': '🔒 Update password',
    'reset.otpValidFor': 'OTP valid for {m} minutes',

    // Browse
    'browse.title': 'Browse crop listings',
    'browse.sub':
      'Every listing follows one structured format — crop, variety, quantity, price, quality, date & village — so you can filter and compare them fairly.',
    'browse.found': '{n} live listing{s} found.',
    'browse.search': 'Search',
    'browse.searchPh': 'crop, variety, village, farmer…',
    'browse.crop': 'Crop',
    'browse.allCrops': 'All crops',
    'browse.village': 'Village',
    'browse.allVillages': 'All villages',
    'browse.quality': 'Quality',
    'browse.any': 'Any',
    'browse.minPrice': 'Min price (₹)',
    'browse.maxPrice': 'Max price (₹)',
    'browse.sortBy': 'Sort by',
    'browse.newestFirst': 'Newest first',
    'browse.priceAsc': 'Price: low → high',
    'browse.priceDesc': 'Price: high → low',
    'browse.qtyDesc': 'Quantity: high → low',
    'browse.apply': 'Apply filters',
    'browse.reset': 'Reset',
    'browse.noMatch': '😔 No listings match these filters.',
    'browse.clearCheck': 'Clear filters or check back soon.',
    'browse.clearFilters': 'Clear filters',

    // Listing detail
    'detail.bcHome': 'Home',
    'detail.bcListings': 'Listings',
    'detail.yourListing': 'This is your listing',
    'detail.editListing': '✏️ Edit listing',
    'detail.markSold': '✔ Mark as sold',
    'detail.markAvailable': '↺ Mark available again',
    'detail.deleteListing': '🗑 Delete listing',
    'detail.deleteConfirm': 'Delete this listing permanently?',
    'detail.contactFarmer': 'Contact the farmer',
    'detail.contactSub': "You can now see the farmer's direct details — no middlemen.",
    'detail.phone': 'Phone',
    'detail.name': 'Name',
    'detail.farmer': 'Farmer',
    'detail.pickupVillage': 'Pickup village',
    'detail.district': 'District',
    'detail.qualityGrade': 'Quality grade',
    'detail.harvestDate': 'Harvest date',
    'detail.availableFrom': 'Available from',
    'detail.postedOn': 'Posted on',
    'detail.notes': 'Notes',
    'detail.soldOut': 'Sold out',
    'detail.soldOutSub': 'This listing has been marked as sold by the farmer.',
    'detail.seeFull': 'See full details',
    'detail.seeFullSub':
      "Farmers & buyers see the farmer's contact details and can express interest — just enter your name, mobile & address. No password needed.",
    'detail.enterNow': '🚪 Enter now',
    'detail.saveListing': '♡ Save this listing',
    'detail.savedListing': '♥ Saved to your list',
    'detail.alreadyInterested':
      '✅ You have already expressed interest. The farmer can see your contact details.',
    'detail.interestMsg': 'Message to the farmer (optional)',
    'detail.interestPh': 'e.g. Need 500 kg weekly. Best rate for bulk?',
    'detail.expressInterest': '📩 Express interest',
    'detail.asHolder':
      'As the account holder you can see contact details. Use it to reach out directly.',
    'detail.fairTipT': '☝️ Fair-trade tip',
    'detail.fairTipP':
      'Prices are farmer-quoted. Always agree on quantity, quality and loading terms before finalising a deal.',
    'detail.moreCrops': 'More {crop} listings',

    // Listing card
    'card.farmer': 'Farmer',
    'card.pickup': 'Pickup location',
    'card.available': 'Available from',
    'card.save': 'Save this listing',
    'card.unsave': 'Remove from saved',
    'card.viewDetails': 'View details',

    // Farmer dashboard
    'farmer.dashTitle': "{name}'s dashboard",
    'farmer.newListing': '＋ New crop listing',
    'farmer.activeListings': 'Active listings',
    'farmer.totalPosted': 'Total posted',
    'farmer.interestsReceived': 'Buyer interests received',
    'farmer.myListings': 'My crop listings',
    'farmer.viewPublic': 'View public →',
    'farmer.view': 'View',
    'farmer.edit': 'Edit',
    'farmer.sold': 'Sold',
    'farmer.active': 'Active',
    'farmer.toggleAvail': 'Toggle availability',
    'farmer.delete': 'Delete',
    'farmer.deleteConfirm': 'Delete this listing?',
    'farmer.noListings': "You haven't posted any listings yet.",
    'farmer.listFirst': 'List your first crop and reach every buyer in the district.',
    'farmer.interestsTitle': 'Buyer interests',
    'farmer.buyer': 'Buyer',
    'farmer.interestedIn': 'Interested in',
    'farmer.noInterest':
      'No buyer interest yet. When buyers express interest in your listings, their contact details appear here.',

    // Buyer dashboard
    'buyer.dashTitle': "{name}'s dashboard",
    'buyer.searchCrops': '🔍 Search crops',
    'buyer.savedListings': '♥ Saved listings ({n})',
    'buyer.noSaved': 'No saved listings yet. Tap ♡ on any listing to save it here for quick follow-up.',
    'buyer.remove': 'Remove',
    'buyer.interestsSent': '📩 Interests sent ({n})',
    'buyer.noInterests':
      'Send your first interest from any listing page — the farmer will see your contact details on their dashboard.',
    'buyer.sharedWithFarmer': '(shared with farmer)',

    // Trends
    'trends.title': 'Price trends & market intelligence',
    'trends.sub':
      'Charts are computed live from the structured records: every listing stores crop, quantity, price and date uniformly, so we can aggregate weekly averages and volumes automatically.',
    'trends.note':
      "Note: the price chart shows ₹/kg for listings quoted per kg (mixed units aren't comparable on one axis).",
    'trends.priceChart': '📈 Average price per week (₹/kg)',
    'trends.volumeChart': '📦 Listed volume — last 30 days (kg)',
    'trends.latestRates': '🧮 Latest average rates (₹/kg, last 14 days)',
    'trends.thAvg': 'Avg price',
    'trends.thChange': 'Change vs prev. fortnight',

    // Profile
    'profile.title': 'Edit your details',
    'profile.sub':
      'Your address is editable any time — farmers & buyers always see your latest details.',
    'profile.emailOptional': 'Email (optional)',
    'profile.addressLabel': '📍 Address (street / landmark — editable)',
    'profile.landSize': 'Land size',
    'profile.businessType': 'Business type',
    'profile.cancel': 'Cancel',
    'profile.save': '💾 Save changes',

    // Admin
    'admin.title': '🛡️ District admin panel',
    'admin.sub': 'Overview & moderation for {d} · CSV export for reports',
    'admin.dbBtn': '🗄️ Database',
    'admin.exportBtn': '⬇️ Export listings (CSV)',
    'admin.farmers': 'Farmers',
    'admin.buyers': 'Buyers',
    'admin.activeListings': 'Active listings',
    'admin.interestsExchanged': 'Interests exchanged',
    'admin.registeredUsers': '👥 Registered users',
    'admin.thRole': 'Role',
    'admin.thVillage': 'Village',
    'admin.thAddress': 'Address',
    'admin.thContact': 'Contact',
    'admin.thJoined': 'Joined',
    'admin.thStatus': 'Status',
    'admin.thAction': 'Action',
    'admin.disabled': 'disabled',
    'admin.active': 'active',
    'admin.activate': '↺ Activate',
    'admin.deactivate': '⏸ Deactivate',
    'admin.reactivateConfirm': 'Reactivate this account?',
    'admin.deactivateConfirm': 'Deactivate this account? Their listings will be hidden.',
    'admin.you': 'you',
    'admin.latestListings': '📋 Latest listings ({n} shown)',
    'admin.thQuantity': 'Quantity',
    'admin.thPrice': 'Price',
    'admin.thLocation': 'Location',
    'admin.thPosted': 'Posted',
    'admin.remove': 'Remove',
    'admin.removeConfirm': 'Remove this listing permanently?',
    'admin.volumeByCrop': '📦 Total listed volume by crop',
    'admin.thVolume': 'Volume (kg)',
    'admin.view': 'View',

    // Listing form
    'form.editTitle': 'Edit crop listing',
    'form.newTitle': 'Post a new crop listing',
    'form.sub':
      "All listings share one structured format — that's what makes the district market searchable and comparable.",
    'form.warnMarked': '⚠️ This listing is currently marked {status}. Save it to keep it as is.',
    'form.labelCrop': 'Crop *',
    'form.selectCrop': '— Select crop —',
    'form.labelVariety': 'Variety *',
    'form.phVariety': 'e.g. Desi, Hybrid, Bellary Red…',
    'form.labelQuantity': 'Quantity *',
    'form.labelUnit': 'Unit *',
    'form.unit': '— Unit —',
    'form.labelPrice': 'Price (₹) *',
    'form.labelPriceUnit': 'Price per *',
    'form.priceUnit': '— Price unit —',
    'form.labelQuality': 'Quality grade *',
    'form.grade': '— Grade —',
    'form.labelLocation': 'Pickup location (village) *',
    'form.phLocation': 'e.g. Andipalem',
    'form.labelHarvest': 'Harvest date',
    'form.labelAvailable': 'Available from *',
    'form.labelNotes': 'Notes (optional)',
    'form.phNotes': 'e.g. Fresh harvest, immediate delivery possible, can arrange packing…',
    'form.cancel': 'Cancel',
    'form.save': '💾 Save changes',
    'form.publish': '🚀 Publish listing',

    // Errors
    'error.goHome': 'Go to homepage',
    'error.browse': 'Browse listings',

    // Footer
    'footer.tagline': 'A shared, structured record of crop availability and prices for farmers and buyers of {d}.',
    'footer.quickLinks': 'Quick links',
    'footer.browseListings': 'Browse listings',
    'footer.priceTrends': 'Price trends',
    'footer.enterMarket': 'Enter market (no password)',
    'footer.adminLogin': 'Admin login',
    'footer.helpline': 'Helpline',
    'footer.builtWith': 'Built with Node.js & Express',

    // Status / quality badges
    'status.active': 'active',
    'status.sold': 'sold',
    'status.removed': 'removed',
    'quality.Premium': 'Premium',
    'quality.Grade A': 'Grade A',
    'quality.Grade B': 'Grade B',
    'quality.Grade C': 'Grade C',
  },

  /* ================================================================ */
  /* తెలుగు                                                             */
  /* ================================================================ */
  te: {
    'brand.tag': 'రైతు & పంట జాబితాలు',
    'nav.home': 'హోమ్',
    'nav.browse': 'బ్రౌజ్',
    'nav.trends': 'ధరల ధోరణులు',
    'nav.dashboard': 'నా డాష్బోర్డ్',
    'nav.admin': 'అడ్మిన్ ప్యానెల్',
    'nav.edit': '✏️ సవరించు',
    'nav.logout': 'లాగౌట్',
    'nav.enter': '🚪 ప్రవేశించండి',
    'nav.adminLogin': '🛡️ అడ్మిన్ లాగిన్',
    'nav.toggle': 'మెనూ',
    'lang.label': 'భాష',
    'lang.en': 'English',
    'lang.te': 'తెలుగు',
    'lang.hi': 'हिन्दी',

    'hero.kicker': 'ఒక ఉమ్మడి వేదిక',
    'hero.title1': 'ప్రతి పంట. ప్రతి ధర.',
    'hero.title2': 'ప్రతి రైతు & కొనుగోలుదారు —',
    'hero.title3': 'కలిసి.',
    'hero.sub':
      'రైతులు తాము పండించే పంటను, ధరను క్రమబద్ధమైన జాబితాలుగా పోస్ట్ చేస్తారు. కొనుగోలుదారులు వెతికి, పోల్చి, నేరుగా కలుస్తారు — ఇక నోటి మాటలు లేదా చెల్లాచెదురైన వాట్సాప్ గ్రూపుల అవసరం లేదు.',
    'hero.browseBtn': '🔍 పంట జాబితాలను బ్రౌజ్ చేయండి',
    'hero.enterBtn': '🚪 ప్రవేశించండి — పాస్వర్డ్ లేదు',

    'stats.farmers': 'నమోదిత రైతులు',
    'stats.buyers': 'నమోదిత కొనుగోలుదారులు',
    'stats.listings': 'ప్రస్తుత పంట జాబితాలు',

    'how.title': 'ఇది ఎలా పని చేస్తుంది',
    'how.s1t': 'రైతు ప్రవేశించి జాబితా వేస్తాడు',
    'how.s1p':
      'మీ పేరు, మొబైల్ నంబర్ మరియు చిరునామాతో ప్రవేశించండి — పాస్వర్డ్ అవసరం లేదు. ఆపై మీ పంట, రకం, పరిమాణం, ధర, నాణ్యత మరియు పికప్ ఊరిని ఒకే నిర్మాణాత్మక ఫారంలో పోస్ట్ చేయండి.',
    'how.s2t': 'కొనుగోలుదారు వెతికి పోల్చుతాడు',
    'how.s2p':
      'పంట, ఊరు, నాణ్యత మరియు ధర పరిధి ద్వారా లైవ్ జాబితాలను ఫిల్టర్ చేయండి. జిల్లా అంతటా రేట్లను వెంటనే పోల్చండి.',
    'how.s3t': 'ప్రత్యక్ష సంపర్కం, న్యాయమైన ధర',
    'how.s3p':
      'ఆసక్తి చూపించండి లేదా జాబితాలను సేవ్ చేయండి. రైతు వివరాలు నేరుగా తెలుస్తాయి — మధ్యవర్తులు లేరు, పారదర్శకమైన రేట్లు.',

    'home.recentTitle': 'మార్కెట్లో కొత్తవి',
    'home.recentSub': 'జిల్లా వ్యాప్తంగా రైతుల నుండి తాజా క్రమబద్ధమైన జాబితాలు.',
    'home.viewAll': 'అన్నీ చూడండి →',
    'home.noListings': 'ఇంకా జాబితాలు లేవు — మీరే మొదటివారు!',
    'home.enterAsFarmer': 'రైతుగా ప్రవేశించండి',
    'home.listYourCrop': 'మరియు మీ పంటను జాబితా చేయండి.',
    'home.priceTitle': 'ధరల స్నాప్షాట్ — గత 14 రోజులు',
    'home.priceSub': 'ప్రస్తుత క్రమబద్ధమైన రికార్డుల నుండి సగటు ధర (₹/కిలో).',
    'home.fullTrends': 'పూర్తి ధోరణులు & చార్ట్లు →',

    'table.crop': 'పంట',
    'table.avgPrice': 'సగటు ధర (₹/కిలో)',
    'table.listings': 'జాబితాలు',
    'table.vsPrev': 'మునుపటి పక్షంతో పోలిస్తే',
    'table.notEnough': 'తగినంత డేటా లేదు',

    'cta.farmerT': 'నేను ఒక రైతును',
    'cta.farmerP':
      'మీ పంటను నిమిషాల్లో జాబితా చేయండి. ఒకే పోస్ట్తో జిల్లాలోని ప్రతి కొనుగోలుదారుని చేరుకోండి.',
    'cta.farmerBtn': 'పంట జాబితా పోస్ట్ చేయండి',
    'cta.buyerT': 'నేను కొనుగోలుదారుని',
    'cta.buyerP':
      'బయలుదేరే ముందు ఏమి అందుబాటులో ఉందో, ఎంత ధరకు ఉందో తెలుసుకోండి. పోల్చి నేరుగా కనెక్ట్ అవ్వండి.',
    'cta.buyerBtn': 'పంటలను వెతకండి',

    'auth.welcomeTitle': 'కృషిసేతుకు స్వాగతం',
    'auth.welcomeSub':
      'రైతులు & కొనుగోలుదారులు పేరు, మొబైల్ & చిరునామాతో ప్రవేశిస్తారు. పాస్వర్డ్లు లేవు, యూజర్నేమ్లు లేవు.',
    'auth.userTab': '👨‍🌾 రైతు / కొనుగోలుదారు',
    'auth.adminTab': '🛡️ అడ్మిన్ లాగిన్',
    'auth.userLead':
      'కొత్తవా? మీ పేరు, మొబైల్ & చిరునామాతో మీ ఖాతా సృష్టించబడుతుంది — వివరాలు అడ్మిన్ ప్యానెల్లో కనిపిస్తాయి. తిరిగి వస్తున్నారా? అదే వివరాలతో ప్రవేశించండి.',
    'auth.iAm': 'నేను ఒక…',
    'auth.roleFarmer': '👨‍🌾 రైతు',
    'auth.roleFarmerSub': 'నేను పంటలు పండించి అమ్ముతాను',
    'auth.roleBuyer': '🛒 కొనుగోలుదారు',
    'auth.roleBuyerSub': 'వ్యాపారం లేదా వినియోగం కోసం పంటలు కొంటాను',
    'auth.fullName': 'పూర్తి పేరు',
    'auth.namePh': 'ఉదా. రమేష్ చంద్ర',
    'auth.mobile': 'మొబైల్ నంబర్',
    'auth.village': 'ఊరు / పట్టణం',
    'auth.selectOptional': '— ఎంచుకోండి (ఐచ్ఛికం) —',
    'auth.select': '— ఎంచుకోండి —',
    'auth.address': 'చిరునామా (వీధి / ల్యాండ్మార్క్)',
    'auth.addressPh': 'ఉదా. 4-56, మెయిన్ రోడ్, దేవాలయం దగ్గర',
    'auth.landSize': 'భూమి విస్తీర్ణం (రైతు)',
    'auth.landSizePh': 'ఉదా. 5 ఎకరాలు',
    'auth.businessType': 'వ్యాపార రకం (కొనుగోలుదారు)',
    'auth.enterBtn': '🚪 కృషిసేతు ప్రవేశించండి',
    'auth.noPassword': 'పాస్వర్డ్ లేదు. మీ మొబైల్ నంబర్ మీ ఖాతాను గుర్తిస్తుంది.',
    'auth.adminLead': 'జిల్లా అడ్మినిస్ట్రేటర్ మాత్రమే యూజర్నేమ్ & పాస్వర్డ్తో లాగిన్ అవుతారు.',
    'auth.userOrEmail': 'యూజర్నేమ్ లేదా ఇమెయిల్',
    'auth.password': 'పాస్వర్డ్',
    'auth.forgot': 'పాస్వర్డ్ మర్చిపోయారా?',
    'auth.adminSubmit': '🛡️ అడ్మిన్ లాగిన్',
    'auth.demoTitle': 'డెమో ఖాతాలు (చూపించడానికి క్లిక్ చేయండి)',
    'auth.demoAdmin': 'అడ్మిన్ (పాస్వర్డ్ లాగిన్ మాత్రమే)',
    'auth.demoFarmer': 'రైతు',
    'auth.demoBuyer': 'కొనుగోలుదారు',
    'auth.backToLogin': '← లాగిన్కు తిరిగి వెళ్లండి',

    'forgot.title': 'అడ్మిన్ పాస్వర్డ్ పునరుద్ధరణ',
    'forgot.sub':
      'అడ్మిన్ ఖాతాకు మాత్రమే పాస్వర్డ్ ఉంటుంది. అడ్మిన్ యూజర్నేమ్ (SURYAS) లేదా ఇమెయిల్ నమోదు చేయండి — మేము 6 అంకెల OTP పంపుతాము.',
    'forgot.adminUserOrEmail': 'అడ్మిన్ యూజర్నేమ్ లేదా ఇమెయిల్',
    'forgot.sendOtp': '📧 OTP పంపండి',
    'forgot.demoMode': 'డెమో మోడ్',
    'forgot.demoNote1': 'ఇమెయిల్ సర్వర్ కాన్ఫిగర్ చేయలేదు, కాబట్టి మీ ఒకసారి వాడే కోడ్ ఇదే:',
    'forgot.demoNote2': '(సర్వర్ కన్సోల్లో కూడా ప్రింట్ అవుతుంది — 10 నిమిషాలు చెల్లుబాటు)',
    'forgot.continueOtp': 'కొనసాగించండి → OTP నమోదు చేయండి',

    'reset.title': 'అడ్మిన్ పాస్వర్డ్ రీసెట్ చేయండి',
    'reset.sub': 'అడ్మిన్ ఇమెయిల్కు పంపిన OTP నమోదు చేసి, కొత్త పాస్వర్డ్ ఎంచుకోండి.',
    'reset.otpLabel': '6 అంకెల OTP',
    'reset.newPass': 'కొత్త పాస్వర్డ్ (కనీసం 6 అక్షరాలు)',
    'reset.confirmPass': 'కొత్త పాస్వర్డ్ నిర్ధారించండి',
    'reset.updatePass': '🔒 పాస్వర్డ్ నవీకరించండి',
    'reset.otpValidFor': 'OTP {m} నిమిషాలకు చెల్లుబాటు',

    'browse.title': 'పంట జాబితాలను బ్రౌజ్ చేయండి',
    'browse.sub':
      'ప్రతి జాబితా ఒకే క్రమబద్ధమైన ఆకృతిని అనుసరిస్తుంది — పంట, రకం, పరిమాణం, ధర, నాణ్యత, తేదీ & ఊరు — కాబట్టి మీరు సరిగ్గా ఫిల్టర్ చేసి పోల్చవచ్చు.',
    'browse.found': '{n} ప్రస్తుత జాబితాలు కనుగొనబడ్డాయి.',
    'browse.search': 'వెతకండి',
    'browse.searchPh': 'పంట, రకం, ఊరు, రైతు…',
    'browse.crop': 'పంట',
    'browse.allCrops': 'అన్ని పంటలు',
    'browse.village': 'ఊరు',
    'browse.allVillages': 'అన్ని ఊళ్లు',
    'browse.quality': 'నాణ్యత',
    'browse.any': 'ఏదైనా',
    'browse.minPrice': 'కనీసం ధర (₹)',
    'browse.maxPrice': 'గరిష్ట ధర (₹)',
    'browse.sortBy': 'క్రమబద్ధీకరించండి',
    'browse.newestFirst': 'కొత్తవి మొదట',
    'browse.priceAsc': 'ధర: తక్కువ → ఎక్కువ',
    'browse.priceDesc': 'ధర: ఎక్కువ → తక్కువ',
    'browse.qtyDesc': 'పరిమాణం: ఎక్కువ → తక్కువ',
    'browse.apply': 'ఫిల్టర్లు వర్తింపజేయండి',
    'browse.reset': 'రీసెట్',
    'browse.noMatch': '😔 మీ ఫిల్టర్లకు సరిపోయే జాబితాలు లేవు.',
    'browse.clearCheck': 'ఫిల్టర్లు తొలగించండి లేదా కొంత సేపటి తర్వాత చూడండి.',
    'browse.clearFilters': 'ఫిల్టర్లు తొలగించండి',

    'detail.bcHome': 'హోమ్',
    'detail.bcListings': 'జాబితాలు',
    'detail.yourListing': 'ఇది మీ జాబితా',
    'detail.editListing': '✏️ జాబితాను సవరించండి',
    'detail.markSold': '✔ అమ్మినట్టు గుర్తించండి',
    'detail.markAvailable': '↺ మళ్లీ అందుబాటులో గుర్తించండి',
    'detail.deleteListing': '🗑 జాబితా తొలగించండి',
    'detail.deleteConfirm': 'ఈ జాబితాను శాశ్వతంగా తొలగించాలా?',
    'detail.contactFarmer': 'రైతును సంప్రదించండి',
    'detail.contactSub': 'ఇప్పుడు రైతు యొక్క ప్రత్యక్ష వివరాలు చూడవచ్చు — మధ్యవర్తులు లేరు.',
    'detail.phone': 'ఫోన్',
    'detail.name': 'పేరు',
    'detail.farmer': 'రైతు',
    'detail.pickupVillage': 'పికప్ ఊరు',
    'detail.district': 'జిల్లా',
    'detail.qualityGrade': 'నాణ్యత గ్రేడ్',
    'detail.harvestDate': 'పంట తేదీ',
    'detail.availableFrom': 'అందుబాటులో నుండి',
    'detail.postedOn': 'పోస్ట్ చేసిన తేదీ',
    'detail.notes': 'గమనికలు',
    'detail.soldOut': 'అమ్ముడుపోయింది',
    'detail.soldOutSub': 'ఈ జాబితాను రైతు అమ్మినట్టు గుర్తించారు.',
    'detail.seeFull': 'పూర్తి వివరాలు చూడండి',
    'detail.seeFullSub':
      'రైతులు & కొనుగోలుదారులు రైతు సంప్రదింపు వివరాలు చూడవచ్చు మరియు ఆసక్తి చూపవచ్చు — మీ పేరు, మొబైల్ & చిరునామా నమోదు చేయండి. పాస్వర్డ్ అవసరం లేదు.',
    'detail.enterNow': '🚪 ఇప్పుడే ప్రవేశించండి',
    'detail.saveListing': '♡ ఈ జాబితాను సేవ్ చేయండి',
    'detail.savedListing': '♥ మీ జాబితాకు సేవ్ చేయబడింది',
    'detail.alreadyInterested':
      '✅ మీరు ఇప్పటికే ఆసక్తి చూపించారు. రైతు మీ సంప్రదింపు వివరాలు చూడగలరు.',
    'detail.interestMsg': 'రైతుకు సందేశం (ఐచ్ఛికం)',
    'detail.interestPh': 'ఉదా. వారానికి 500 కిలోలు కావాలి. పెద్ద మొత్తానికి ఉత్తమ రేటు ఏమిటి?',
    'detail.expressInterest': '📩 ఆసక్తి చూపించండి',
    'detail.asHolder': 'ఖాతా హోల్డర్గా మీరు సంప్రదింపు వివరాలు చూడవచ్చు. నేరుగా సంప్రదించండి.',
    'detail.fairTipT': '☝️ న్యాయమైన వ్యాపార చిట్కా',
    'detail.fairTipP':
      'ధరలు రైతు చెప్పినవి. డీల్ ఖరారు చేసే ముందు పరిమాణం, నాణ్యత మరియు లోడింగ్ నిబంధనలపై ఎల్లప్పుడూ అంగీకరించండి.',
    'detail.moreCrops': 'మరిన్ని {crop} జాబితాలు',

    'card.farmer': 'రైతు',
    'card.pickup': 'పికప్ స్థలం',
    'card.available': 'అందుబాటులో నుండి',
    'card.save': 'ఈ జాబితాను సేవ్ చేయండి',
    'card.unsave': 'సేవ్ చేసిన వాటి నుండి తొలగించండి',
    'card.viewDetails': 'వివరాలు చూడండి',

    'farmer.dashTitle': '{name} యొక్క డాష్బోర్డ్',
    'farmer.newListing': '＋ కొత్త పంట జాబితా',
    'farmer.activeListings': 'చురుకైన జాబితాలు',
    'farmer.totalPosted': 'మొత్తం పోస్ట్ చేసినవి',
    'farmer.interestsReceived': 'కొనుగోలుదారుల ఆసక్తులు అందాయి',
    'farmer.myListings': 'నా పంట జాబితాలు',
    'farmer.viewPublic': 'ప్రజా వీక్షణ →',
    'farmer.view': 'చూడండి',
    'farmer.edit': 'సవరించు',
    'farmer.sold': 'అమ్ముడయ్యింది',
    'farmer.active': 'యాక్టివ్',
    'farmer.toggleAvail': 'అందుబాటును మార్చండి',
    'farmer.delete': 'తొలగించు',
    'farmer.deleteConfirm': 'ఈ జాబితాను తొలగించాలా?',
    'farmer.noListings': 'మీరు ఇంకా ఎలాంటి జాబితా పోస్ట్ చేయలేదు.',
    'farmer.listFirst': 'మీ మొదటి పంటను జాబితా చేసి జిల్లాలోని ప్రతి కొనుగోలుదారుని చేరుకోండి.',
    'farmer.interestsTitle': 'కొనుగోలుదారుల ఆసక్తులు',
    'farmer.buyer': 'కొనుగోలుదారు',
    'farmer.interestedIn': 'ఆసక్తి చూపినది',
    'farmer.noInterest':
      'ఇంకా కొనుగోలుదారుల ఆసక్తి లేదు. కొనుగోలుదారులు మీ జాబితాలపై ఆసక్తి చూపగానే వారి సంప్రదింపు వివరాలు ఇక్కడ కనిపిస్తాయి.',

    'buyer.dashTitle': '{name} యొక్క డాష్బోర్డ్',
    'buyer.searchCrops': '🔍 పంటలను వెతకండి',
    'buyer.savedListings': '♥ సేవ్ చేసిన జాబితాలు ({n})',
    'buyer.noSaved':
      'ఇంకా సేవ్ చేసిన జాబితాలు లేవు. ఏదైనా జాబితాపై ♡ నొక్కి త్వరిత అనుసరణ కోసం ఇక్కడ సేవ్ చేయండి.',
    'buyer.remove': 'తొలగించు',
    'buyer.interestsSent': '📩 పంపిన ఆసక్తులు ({n})',
    'buyer.noInterests':
      'ఏదైనా జాబితా పేజీ నుండి మీ మొదటి ఆసక్తిని పంపండి — రైతు వారి డాష్బోర్డ్లో మీ సంప్రదింపు వివరాలు చూస్తారు.',
    'buyer.sharedWithFarmer': '(రైతుతో పంచబడింది)',

    'trends.title': 'ధరల ధోరణులు & మార్కెట్ సమాచారం',
    'trends.sub':
      'చార్ట్లు క్రమబద్ధమైన రికార్డుల నుండి లైవ్గా లెక్కించబడతాయి: ప్రతి జాబితా పంట, పరిమాణం, ధర మరియు తేదీని ఏకరీతిగా నిల్వ చేస్తుంది, కాబట్టి వారపు సగటులు మరియు వాల్యూమ్లను స్వయంచాలకంగా బట్వాడా చేయవచ్చు.',
    'trends.note':
      'గమనిక: ప్రైస్ చార్ట్ కిలోకు ₹ చూపుతుంది — కేజీ ఆధారిత జాబితాలకు మాత్రమే (వివిధ యూనిట్లు ఒక అక్షంపై పోల్చలేవు).',
    'trends.priceChart': '📈 వారానికి సగటు ధర (₹/కిలో)',
    'trends.volumeChart': '📦 జాబితా చేసిన వాల్యూమ్ — గత 30 రోజులు (కిలో)',
    'trends.latestRates': '🧮 తాజా సగటు రేట్లు (₹/కిలో, గత 14 రోజులు)',
    'trends.thAvg': 'సగటు ధర',
    'trends.thChange': 'మునుపటి పక్షం కంటే మార్పు',

    'profile.title': 'మీ వివరాలను సవరించండి',
    'profile.sub':
      'మీ చిరునామా ఎప్పుడైనా సవరించవచ్చు — రైతులు & కొనుగోలుదారులు మీ తాజా వివరాలను చూస్తారు.',
    'profile.emailOptional': 'ఇమెయిల్ (ఐచ్ఛికం)',
    'profile.addressLabel': '📍 చిరునామా (వీధి / ల్యాండ్మార్క్ — సవరించవచ్చు)',
    'profile.landSize': 'భూమి విస్తీర్ణం',
    'profile.businessType': 'వ్యాపార రకం',
    'profile.cancel': 'రద్దు చేయండి',
    'profile.save': '💾 మార్పులను సేవ్ చేయండి',

    'admin.title': '🛡️ జిల్లా అడ్మిన్ ప్యానెల్',
    'admin.sub': '{d} అవలోకనం & మోడరేషన్ · నివేదికల కోసం CSV ఎగుమతి',
    'admin.dbBtn': '🗄️ డేటాబేస్',
    'admin.exportBtn': '⬇️ జాబితాలను ఎగుమతి చేయండి (CSV)',
    'admin.farmers': 'రైతులు',
    'admin.buyers': 'కొనుగోలుదారులు',
    'admin.activeListings': 'చురుకైన జాబితాలు',
    'admin.interestsExchanged': 'మార్పిడి చేసిన ఆసక్తులు',
    'admin.registeredUsers': '👥 నమోదిత యూజర్లు',
    'admin.thRole': 'పాత్ర',
    'admin.thVillage': 'ఊరు',
    'admin.thAddress': 'చిరునామా',
    'admin.thContact': 'సంపర్కం',
    'admin.thJoined': 'చేరారు',
    'admin.thStatus': 'స్థితి',
    'admin.thAction': 'చర్య',
    'admin.disabled': 'నిలిపివేయబడింది',
    'admin.active': 'యాక్టివ్',
    'admin.activate': '↺ సక్రియం చేయండి',
    'admin.deactivate': '⏸ నిలిపివేయండి',
    'admin.reactivateConfirm': 'ఈ ఖాతాను మళ్లీ సక్రియం చేయాలా?',
    'admin.deactivateConfirm': 'ఈ ఖాతాను నిలిపివేయాలా? వారి జాబితాలు దాచబడతాయి.',
    'admin.you': 'మీరు',
    'admin.latestListings': '📋 తాజా జాబితాలు ({n} చూపబడుతున్నాయి)',
    'admin.thQuantity': 'పరిమాణం',
    'admin.thPrice': 'ధర',
    'admin.thLocation': 'స్థలం',
    'admin.thPosted': 'పోస్ట్ చేసినది',
    'admin.remove': 'తొలగించు',
    'admin.removeConfirm': 'ఈ జాబితాను శాశ్వతంగా తొలగించాలా?',
    'admin.volumeByCrop': '📦 పంటల వారీగా మొత్తం జాబితా వాల్యూమ్',
    'admin.thVolume': 'వాల్యూమ్ (కిలో)',
    'admin.view': 'చూడండి',

    'form.editTitle': 'పంట జాబితాను సవరించండి',
    'form.newTitle': 'కొత్త పంట జాబితా పోస్ట్ చేయండి',
    'form.sub':
      'అన్ని జాబితాలు ఒకే క్రమబద్ధమైన ఆకృతిని పంచుకుంటాయి — అందుకే జిల్లా మార్కెట్ శోధించదగినది మరియు పోల్చదగినది.',
    'form.warnMarked': '⚠️ ఈ జాబితా ప్రస్తుతం {status} గా గుర్తించబడింది. అలాగే ఉంచడానికి సేవ్ చేయండి.',
    'form.labelCrop': 'పంట *',
    'form.selectCrop': '— పంటను ఎంచుకోండి —',
    'form.labelVariety': 'రకం *',
    'form.phVariety': 'ఉదా. దేశీ, హైబ్రిడ్, బెల్లారీ రెడ్…',
    'form.labelQuantity': 'పరిమాణం *',
    'form.labelUnit': 'యూనిట్ *',
    'form.unit': '— యూనిట్ —',
    'form.labelPrice': 'ధర (₹) *',
    'form.labelPriceUnit': 'ధర ప్రతి *',
    'form.priceUnit': '— ధర యూనిట్ —',
    'form.labelQuality': 'నాణ్యత గ్రేడ్ *',
    'form.grade': '— గ్రేడ్ —',
    'form.labelLocation': 'పికప్ స్థలం (ఊరు) *',
    'form.phLocation': 'ఉదా. ఆండిపాలెం',
    'form.labelHarvest': 'పంట తేదీ',
    'form.labelAvailable': 'అందుబాటులో ఉన్న తేదీ *',
    'form.labelNotes': 'గమనికలు (ఐచ్ఛికం)',
    'form.phNotes':
      'ఉదా. తాజా పంట, వెంటనే డెలివరీ సాధ్యం, ప్యాకింగ్ ఏర్పాటు చేయవచ్చు…',
    'form.cancel': 'రద్దు చేయండి',
    'form.save': '💾 మార్పులను సేవ్ చేయండి',
    'form.publish': '🚀 జాబితా ప్రచురించండి',

    'error.goHome': 'హోమ్పేజీకి వెళ్లండి',
    'error.browse': 'జాబితాలను బ్రౌజ్ చేయండి',

    'footer.tagline':
      '{d} రైతులు & కొనుగోలుదారుల కోసం పంటల లభ్యత మరియు ధరల ఉమ్మడి, క్రమబద్ధమైన రికార్డు.',
    'footer.quickLinks': 'త్వరిత లింకులు',
    'footer.browseListings': 'జాబితాలను బ్రౌజ్ చేయండి',
    'footer.priceTrends': 'ధరల ధోరణులు',
    'footer.enterMarket': 'మార్కెట్లోకి ప్రవేశించండి (పాస్వర్డ్ లేదు)',
    'footer.adminLogin': 'అడ్మిన్ లాగిన్',
    'footer.helpline': 'హెల్ప్లైన్',
    'footer.builtWith': 'Node.js & Express తో నిర్మించబడింది',

    'status.active': 'యాక్టివ్',
    'status.sold': 'అమ్ముడయ్యింది',
    'status.removed': 'తొలగించబడింది',
    'quality.Premium': 'ప్రీమియం',
    'quality.Grade A': 'గ్రేడ్ A',
    'quality.Grade B': 'గ్రేడ్ B',
    'quality.Grade C': 'గ్రేడ్ C',
  },

  /* ================================================================ */
  /* हिन्दी                                                              */
  /* ================================================================ */
  hi: {
    'brand.tag': 'किसान एवं फसल सूची',
    'nav.home': 'होम',
    'nav.browse': 'ब्राउज़',
    'nav.trends': 'मूल्य रुझान',
    'nav.dashboard': 'मेरा डैशबोर्ड',
    'nav.admin': 'एडमिन पैनल',
    'nav.edit': '✏️ संपादित करें',
    'nav.logout': 'लॉग आउट',
    'nav.enter': '🚪 प्रवेश करें',
    'nav.adminLogin': '🛡️ एडमिन लॉगिन',
    'nav.toggle': 'मेन्यू',
    'lang.label': 'भाषा',
    'lang.en': 'English',
    'lang.te': 'తెలుగు',
    'lang.hi': 'हिन्दी',

    'hero.kicker': 'एक साझा मंच',
    'hero.title1': 'हर फसल। हर कीमत।',
    'hero.title2': 'हर किसान और खरीदार —',
    'hero.title3': 'साथ में।',
    'hero.sub':
      'किसान अपनी फसल और कीमत की संरचित सूची डालते हैं। खरीदार खोजते हैं, तुलना करते हैं और सीधे जुड़ते हैं — अब अफवाहों या बिखरे व्हाट्सएप ग्रुप्स की ज़रूरत नहीं।',
    'hero.browseBtn': '🔍 फसल सूची ब्राउज़ करें',
    'hero.enterBtn': '🚪 प्रवेश करें — पासवर्ड नहीं',

    'stats.farmers': 'पंजीकृत किसान',
    'stats.buyers': 'पंजीकृत खरीदार',
    'stats.listings': 'सक्रिय फसल सूचियाँ',

    'how.title': 'यह कैसे काम करता है',
    'how.s1t': 'किसान प्रवेश करता है और सूची डालता है',
    'how.s1p':
      'सिर्फ नाम, मोबाइल और पता से प्रवेश करें — पासवर्ड नहीं। फिर अपनी फसल, किस्म, मात्रा, कीमत, गुणवत्ता और पिकअप गांव एक ही फॉर्म में डालें।',
    'how.s2t': 'खरीदार खोजता है और तुलना करता है',
    'how.s2p':
      'फसल, गांव, गुणवत्ता और मूल्य सीमा से सूची फ़िल्टर करें। पूरे जिले की दरें तुरंत तुलना करें।',
    'how.s3t': 'सीधा संपर्क, उचित मूल्य',
    'how.s3p':
      'रुचि दिखाएं या सूची सहेजें। किसान का विवरण सीधे मिलता है — बिचौलिए नहीं, पारदर्शी दरें।',

    'home.recentTitle': 'बाज़ार में ताज़ा',
    'home.recentSub': 'पूरे जिले के किसानों की ताज़ा संरचित सूचियाँ।',
    'home.viewAll': 'सभी देखें →',
    'home.noListings': 'अभी कोई सूची नहीं — आप पहले बनें!',
    'home.enterAsFarmer': 'किसान के रूप में प्रवेश करें',
    'home.listYourCrop': 'और अपनी फसल डालें।',
    'home.priceTitle': 'मूल्य स्नैपशॉट — पिछले 14 दिन',
    'home.priceSub': 'वर्तमान संरचित रिकॉर्ड से औसत दर (₹/किलो)।',
    'home.fullTrends': 'पूरे रुझान और चार्ट →',

    'table.crop': 'फसल',
    'table.avgPrice': 'औसत मूल्य (₹/किलो)',
    'table.listings': 'सूचियाँ',
    'table.vsPrev': 'पिछले पखवाड़े की तुलना में',
    'table.notEnough': 'पर्याप्त डेटा नहीं',

    'cta.farmerT': 'मैं किसान हूँ',
    'cta.farmerP': 'अपनी फसल मिनटों में सूचीबद्ध करें। एक पोस्ट से जिले के हर खरीदार तक पहुँचें।',
    'cta.farmerBtn': 'फसल सूची डालें',
    'cta.buyerT': 'मैं खरीदार हूँ',
    'cta.buyerP':
      'यात्रा से पहले जानें क्या उपलब्ध है और किस कीमत पर। तुलना करें और सीधे जुड़ें।',
    'cta.buyerBtn': 'फसल खोजें',

    'auth.welcomeTitle': 'कृषिसेतु में आपका स्वागत है',
    'auth.welcomeSub':
      'किसान और खरीदार नाम, मोबाइल और पते से प्रवेश करते हैं। न पासवर्ड, न यूज़रनेम।',
    'auth.userTab': '👨‍🌾 किसान / खरीदार',
    'auth.adminTab': '🛡️ एडमिन लॉगिन',
    'auth.userLead':
      'नए हैं? आपका नाम, मोबाइल और पता आपका खाता बनाते हैं — विवरण एडमिन पैनल में दिखते हैं। वापस आ रहे हैं? वही विवरण डालें और प्रवेश करें।',
    'auth.iAm': 'मैं एक…',
    'auth.roleFarmer': '👨‍🌾 किसान',
    'auth.roleFarmerSub': 'मैं फसल उगाता/उगाती और बेचता/बेचती हूँ',
    'auth.roleBuyer': '🛒 खरीदार',
    'auth.roleBuyerSub': 'मैं व्यापार या उपयोग के लिए फसल खरीदता/खरीदती हूँ',
    'auth.fullName': 'पूरा नाम',
    'auth.namePh': 'जैसे रमेश चंद्र',
    'auth.mobile': 'मोबाइल नंबर',
    'auth.village': 'गाँव / कस्बा',
    'auth.selectOptional': '— चुनें (वैकल्पिक) —',
    'auth.select': '— चुनें —',
    'auth.address': 'पता (गली / स्थल चिह्न)',
    'auth.addressPh': 'जैसे 4-56, मुख्य सड़क, मंदिर के पास',
    'auth.landSize': 'भूमि का आकार (किसान)',
    'auth.landSizePh': 'जैसे 5 एकड़',
    'auth.businessType': 'व्यापार का प्रकार (खरीदार)',
    'auth.enterBtn': '🚪 कृषिसेतु में प्रवेश करें',
    'auth.noPassword': 'कोई पासवर्ड नहीं। आपका मोबाइल नंबर आपका खाता पहचानता है।',
    'auth.adminLead': 'सिर्फ जिला प्रशासक यूज़रनेम और पासवर्ड से लॉगिन करता है।',
    'auth.userOrEmail': 'यूज़रनेम या ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.forgot': 'पासवर्ड भूल गए?',
    'auth.adminSubmit': '🛡️ एडमिन लॉगिन',
    'auth.demoTitle': 'डेमो खाते (देखने के लिए क्लिक करें)',
    'auth.demoAdmin': 'एडमिन (केवल पासवर्ड लॉगिन)',
    'auth.demoFarmer': 'किसान',
    'auth.demoBuyer': 'खरीदार',
    'auth.backToLogin': '← लॉगिन पर वापस जाएँ',

    'forgot.title': 'एडमिन पासवर्ड पुनर्प्राप्ति',
    'forgot.sub':
      'सिर्फ एडमिन खाते में पासवर्ड है। एडमिन यूज़रनेम (SURYAS) या ईमेल डालें — हम 6 अंकों का OTP भेजेंगे।',
    'forgot.adminUserOrEmail': 'एडमिन यूज़रनेम या ईमेल',
    'forgot.sendOtp': '📧 OTP भेजें',
    'forgot.demoMode': 'डेमो मोड',
    'forgot.demoNote1': 'कोई ईमेल सर्वर कॉन्फ़िगर नहीं है, इसलिए आपका एक बार का कोड यह है:',
    'forgot.demoNote2': '(सर्वर कंसोल पर भी छपता है — 10 मिनट के लिए मान्य)',
    'forgot.continueOtp': 'जारी रखें → OTP दर्ज करें',

    'reset.title': 'एडमिन पासवर्ड रीसेट करें',
    'reset.sub': 'एडमिन ईमेल पर भेजा गया OTP दर्ज करें, फिर नया पासवर्ड चुनें।',
    'reset.otpLabel': '6 अंकों का OTP',
    'reset.newPass': 'नया पासवर्ड (कम से कम 6 अक्षर)',
    'reset.confirmPass': 'नया पासवर्ड दोबारा डालें',
    'reset.updatePass': '🔒 पासवर्ड अपडेट करें',
    'reset.otpValidFor': 'OTP {m} मिनट के लिए मान्य',

    'browse.title': 'फसल सूचियाँ ब्राउज़ करें',
    'browse.sub':
      'हर सूची एक ही संरचित प्रारूप में है — फसल, किस्म, मात्रा, कीमत, गुणवत्ता, तारीख और गाँव — ताकि आप आसानी से फ़िल्टर और तुलना कर सकें।',
    'browse.found': '{n} सक्रिय सूचियाँ मिलीं।',
    'browse.search': 'खोजें',
    'browse.searchPh': 'फसल, किस्म, गाँव, किसान…',
    'browse.crop': 'फसल',
    'browse.allCrops': 'सभी फसलें',
    'browse.village': 'गाँव',
    'browse.allVillages': 'सभी गाँव',
    'browse.quality': 'गुणवत्ता',
    'browse.any': 'कोई भी',
    'browse.minPrice': 'न्यूनतम मूल्य (₹)',
    'browse.maxPrice': 'अधिकतम मूल्य (₹)',
    'browse.sortBy': 'क्रमबद्ध करें',
    'browse.newestFirst': 'नई पहले',
    'browse.priceAsc': 'मूल्य: कम → अधिक',
    'browse.priceDesc': 'मूल्य: अधिक → कम',
    'browse.qtyDesc': 'मात्रा: अधिक → कम',
    'browse.apply': 'फ़िल्टर लागू करें',
    'browse.reset': 'रीसेट',
    'browse.noMatch': '😔 आपके फ़िल्टर से कोई सूची नहीं मिली।',
    'browse.clearCheck': 'फ़िल्टर हटाएँ या थोड़ी देर बाद देखें।',
    'browse.clearFilters': 'फ़िल्टर हटाएँ',

    'detail.bcHome': 'होम',
    'detail.bcListings': 'सूचियाँ',
    'detail.yourListing': 'यह आपकी सूची है',
    'detail.editListing': '✏️ सूची संपादित करें',
    'detail.markSold': '✔ बिक गया चिह्नित करें',
    'detail.markAvailable': '↺ दोबारा उपलब्ध चिह्नित करें',
    'detail.deleteListing': '🗑 सूची हटाएँ',
    'detail.deleteConfirm': 'क्या यह सूची स्थायी रूप से हटाएँ?',
    'detail.contactFarmer': 'किसान से संपर्क करें',
    'detail.contactSub': 'अब आप किसान का सीधा विवरण देख सकते हैं — कोई बिचौलिया नहीं।',
    'detail.phone': 'फ़ोन',
    'detail.name': 'नाम',
    'detail.farmer': 'किसान',
    'detail.pickupVillage': 'पिकअप गाँव',
    'detail.district': 'जिला',
    'detail.qualityGrade': 'गुणवत्ता स्तर',
    'detail.harvestDate': 'कटाई की तारीख',
    'detail.availableFrom': 'उपलब्ध तिथि',
    'detail.postedOn': 'डालने की तारीख',
    'detail.notes': 'नोट',
    'detail.soldOut': 'बिक चुका है',
    'detail.soldOutSub': 'किसान ने इस सूची को बिक गया चिह्नित किया है।',
    'detail.seeFull': 'पूरा विवरण देखें',
    'detail.seeFullSub':
      'किसान और खरीदार किसान का संपर्क विवरण देख सकते हैं और रुचि दिखा सकते हैं — बस अपना नाम, मोबाइल और पता डालें। पासवर्ड ज़रूरी नहीं।',
    'detail.enterNow': '🚪 अभी प्रवेश करें',
    'detail.saveListing': '♡ इस सूची को सहेजें',
    'detail.savedListing': '♥ आपकी सूची में सहेजा गया',
    'detail.alreadyInterested':
      '✅ आप पहले ही रुचि दिखा चुके हैं। किसान आपका संपर्क विवरण देख सकता है।',
    'detail.interestMsg': 'किसान को संदेश (वैकल्पिक)',
    'detail.interestPh': 'जैसे साप्ताहिक 500 किलो चाहिए। थोक के लिए सबसे अच्छी दर?',
    'detail.expressInterest': '📩 रुचि दिखाएं',
    'detail.asHolder':
      'खाता धारक के रूप में आप संपर्क विवरण देख सकते हैं। सीधे संपर्क करें।',
    'detail.fairTipT': '☝️ उचित व्यापार सुझाव',
    'detail.fairTipP':
      'कीमतें किसान द्वारा बताई गई हैं। सौदा तय करने से पहले मात्रा, गुणवत्ता और लोडिंग शर्तों पर हमेशा सहमत हों।',
    'detail.moreCrops': 'और {crop} सूचियाँ',

    'card.farmer': 'किसान',
    'card.pickup': 'पिकअप स्थान',
    'card.available': 'उपलब्ध तिथि',
    'card.save': 'इस सूची को सहेजें',
    'card.unsave': 'सहेजी गई से हटाएँ',
    'card.viewDetails': 'विवरण देखें',

    'farmer.dashTitle': '{name} का डैशबोर्ड',
    'farmer.newListing': '＋ नई फसल सूची',
    'farmer.activeListings': 'सक्रिय सूचियाँ',
    'farmer.totalPosted': 'कुल डाली गईं',
    'farmer.interestsReceived': 'खरीदारों की रुचियाँ मिलीं',
    'farmer.myListings': 'मेरी फसल सूचियाँ',
    'farmer.viewPublic': 'सार्वजनिक देखें →',
    'farmer.view': 'देखें',
    'farmer.edit': 'संपादित करें',
    'farmer.sold': 'बिक गया',
    'farmer.active': 'सक्रिय',
    'farmer.toggleAvail': 'उपलब्धता बदलें',
    'farmer.delete': 'हटाएँ',
    'farmer.deleteConfirm': 'क्या यह सूची हटाएँ?',
    'farmer.noListings': 'आपने अभी तक कोई सूची नहीं डाली।',
    'farmer.listFirst': 'अपनी पहली फसल डालें और जिले के हर खरीदार तक पहुँचें।',
    'farmer.interestsTitle': 'खरीदारों की रुचियाँ',
    'farmer.buyer': 'खरीदार',
    'farmer.interestedIn': 'रुचि दिखाई',
    'farmer.noInterest':
      'अभी कोई खरीदार रुचि नहीं। जब खरीदार रुचि दिखाएँगे, उनका संपर्क विवरण यहाँ दिखेगा।',

    'buyer.dashTitle': '{name} का डैशबोर्ड',
    'buyer.searchCrops': '🔍 फसल खोजें',
    'buyer.savedListings': '♥ सहेजी गई सूचियाँ ({n})',
    'buyer.noSaved':
      'अभी कोई सहेजी गई सूची नहीं। किसी भी सूची पर ♡ दबाएँ और त्वरित संपर्क के लिए यहाँ सहेजें।',
    'buyer.remove': 'हटाएँ',
    'buyer.interestsSent': '📩 भेजी गई रुचियाँ ({n})',
    'buyer.noInterests':
      'किसी भी सूची पेज से अपनी पहली रुचि भेजें — किसान आपका संपर्क विवरण अपने डैशबोर्ड पर देखेगा।',
    'buyer.sharedWithFarmer': '(किसान से साझा)',

    'trends.title': 'मूल्य रुझान और बाज़ार जानकारी',
    'trends.sub':
      'चार्ट संरचित रिकॉर्ड से लाइव बनते हैं: हर सूची में फसल, मात्रा, कीमत और तारीख एक समान रूप से होती है, इसलिए साप्ताहिक औसत और मात्रा अपने आप बनती है।',
    'trends.note':
      'नोट: मूल्य चार्ट ₹/किलो दिखाता है केवल किलो वाली सूचियों के लिए (मिश्रित इकाइयाँ एक अक्ष पर तुलनीय नहीं हैं)।',
    'trends.priceChart': '📈 प्रति सप्ताह औसत मूल्य (₹/किलो)',
    'trends.volumeChart': '📦 सूचीबद्ध मात्रा — पिछले 30 दिन (किलो)',
    'trends.latestRates': '🧮 नवीनतम औसत दरें (₹/किलो, पिछले 14 दिन)',
    'trends.thAvg': 'औसत मूल्य',
    'trends.thChange': 'पिछले पखवाड़े से बदलाव',

    'profile.title': 'अपना विवरण संपादित करें',
    'profile.sub':
      'आपका पता कभी भी संपादित किया जा सकता है — किसान और खरीदार हमेशा आपका नवीनतम विवरण देखते हैं।',
    'profile.emailOptional': 'ईमेल (वैकल्पिक)',
    'profile.addressLabel': '📍 पता (गली / स्थल चिह्न — संपादन योग्य)',
    'profile.landSize': 'भूमि का आकार',
    'profile.businessType': 'व्यापार का प्रकार',
    'profile.cancel': 'रद्द करें',
    'profile.save': '💾 बदलाव सहेजें',

    'admin.title': '🛡️ जिला एडमिन पैनल',
    'admin.sub': '{d} अवलोकन और मॉडरेशन · रिपोर्ट के लिए CSV निर्यात',
    'admin.dbBtn': '🗄️ डेटाबेस',
    'admin.exportBtn': '⬇️ सूचियाँ निर्यात करें (CSV)',
    'admin.farmers': 'किसान',
    'admin.buyers': 'खरीदार',
    'admin.activeListings': 'सक्रिय सूचियाँ',
    'admin.interestsExchanged': 'आदान-प्रदान की गई रुचियाँ',
    'admin.registeredUsers': '👥 पंजीकृत उपयोगकर्ता',
    'admin.thRole': 'भूमिका',
    'admin.thVillage': 'गाँव',
    'admin.thAddress': 'पता',
    'admin.thContact': 'संपर्क',
    'admin.thJoined': 'शामिल हुए',
    'admin.thStatus': 'स्थिति',
    'admin.thAction': 'कार्रवाई',
    'admin.disabled': 'निष्क्रिय',
    'admin.active': 'सक्रिय',
    'admin.activate': '↺ सक्रिय करें',
    'admin.deactivate': '⏸ निष्क्रिय करें',
    'admin.reactivateConfirm': 'क्या यह खाता दोबारा सक्रिय करें?',
    'admin.deactivateConfirm': 'क्या यह खाता निष्क्रिय करें? उनकी सूचियाँ छिप जाएँगी।',
    'admin.you': 'आप',
    'admin.latestListings': '📋 नवीनतम सूचियाँ ({n} दिखाई गईं)',
    'admin.thQuantity': 'मात्रा',
    'admin.thPrice': 'मूल्य',
    'admin.thLocation': 'स्थान',
    'admin.thPosted': 'डाली गई',
    'admin.remove': 'हटाएँ',
    'admin.removeConfirm': 'क्या यह सूची स्थायी रूप से हटाएँ?',
    'admin.volumeByCrop': '📦 फसल अनुसार कुल सूचीबद्ध मात्रा',
    'admin.thVolume': 'मात्रा (किलो)',
    'admin.view': 'देखें',

    'form.editTitle': 'फसल सूची संपादित करें',
    'form.newTitle': 'नई फसल सूची डालें',
    'form.sub':
      'सभी सूचियाँ एक ही संरचित प्रारूप साझा करती हैं — इसीलिए जिला बाज़ार खोजने और तुलना करने योग्य है।',
    'form.warnMarked': '⚠️ यह सूची वर्तमान में {status} चिह्नित है। इसे वैसे ही रखने के लिए सहेजें।',
    'form.labelCrop': 'फसल *',
    'form.selectCrop': '— फसल चुनें —',
    'form.labelVariety': 'किस्म *',
    'form.phVariety': 'जैसे देसी, हाइब्रिड, बेल्लारी रेड…',
    'form.labelQuantity': 'मात्रा *',
    'form.labelUnit': 'इकाई *',
    'form.unit': '— इकाई —',
    'form.labelPrice': 'मूल्य (₹) *',
    'form.labelPriceUnit': 'मूल्य प्रति *',
    'form.priceUnit': '— मूल्य इकाई —',
    'form.labelQuality': 'गुणवत्ता स्तर *',
    'form.grade': '— ग्रेड —',
    'form.labelLocation': 'पिकअप स्थान (गाँव) *',
    'form.phLocation': 'जैसे आंडिपालेम',
    'form.labelHarvest': 'कटाई की तारीख',
    'form.labelAvailable': 'उपलब्ध तिथि *',
    'form.labelNotes': 'नोट (वैकल्पिक)',
    'form.phNotes': 'जैसे ताज़ी फसल, तुरंत डिलीवरी संभव, पैकिंग कर सकते हैं…',
    'form.cancel': 'रद्द करें',
    'form.save': '💾 बदलाव सहेजें',
    'form.publish': '🚀 सूची प्रकाशित करें',

    'error.goHome': 'होमपेज पर जाएँ',
    'error.browse': 'सूचियाँ ब्राउज़ करें',

    'footer.tagline':
      '{d} के किसानों और खरीदारों के लिए फसल उपलब्धता और कीमतों का साझा, संरचित रिकॉर्ड।',
    'footer.quickLinks': 'त्वरित लिंक',
    'footer.browseListings': 'सूचियाँ ब्राउज़ करें',
    'footer.priceTrends': 'मूल्य रुझान',
    'footer.enterMarket': 'बाज़ार में प्रवेश करें (बिना पासवर्ड)',
    'footer.adminLogin': 'एडमिन लॉगिन',
    'footer.helpline': 'हेल्पलाइन',
    'footer.builtWith': 'Node.js और Express से निर्मित',

    'status.active': 'सक्रिय',
    'status.sold': 'बिक गया',
    'status.removed': 'हटाई गई',
    'quality.Premium': 'प्रीमियम',
    'quality.Grade A': 'ग्रेड A',
    'quality.Grade B': 'ग्रेड B',
    'quality.Grade C': 'ग्रेड C',
  },
};

const LANG_META = {
  en: { name: 'English', short: 'EN' },
  te: { name: 'తెలుగు', short: 'తె' },
  hi: { name: 'हिन्दी', short: 'हि' },
};

const SUPPORTED = Object.keys(LANGS);

function makeT(lang) {
  const dict = LANGS[lang] || LANGS.en;
  return (key, params, fallback) => {
    let val;
    if (dict && Object.prototype.hasOwnProperty.call(dict, key)) val = dict[key];
    else if (Object.prototype.hasOwnProperty.call(LANGS.en, key)) val = LANGS.en[key];
    else val = fallback !== undefined ? fallback : key;
    if (params) {
      for (const k of Object.keys(params)) {
        val = String(val).split('{' + k + '}').join(params[k]);
      }
    }
    return val;
  };
}

function readCookie(req, name) {
  const header = req.headers && req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      try { return decodeURIComponent(part.slice(idx + 1).trim()); } catch { return null; }
    }
  }
  return null;
}

function resolveLang(req) {
  const fromQuery = req.query && req.query.lang;
  if (fromQuery && SUPPORTED.includes(fromQuery)) return fromQuery;
  const fromSession = req.session && req.session.lang;
  if (fromSession && SUPPORTED.includes(fromSession)) return fromSession;
  const fromCookie = readCookie(req, 'ks_lang');
  if (fromCookie && SUPPORTED.includes(fromCookie)) return fromCookie;
  const accept = req.headers && req.headers['accept-language'];
  if (accept) {
    for (const part of accept.split(',')) {
      const code = (part.split(';')[0] || '').trim().toLowerCase();
      if (code.startsWith('te')) return 'te';
      if (code.startsWith('hi') || code.startsWith('hin')) return 'hi';
    }
  }
  return 'en';
}

// Express middleware: handle ?lang= switch, resolve language, expose
// `lang`, `t`, `langMeta` and `langHref` to every view.
function attachLang(req, res, next) {
  if (req.query && req.query.lang && SUPPORTED.includes(req.query.lang)) {
    const chosen = req.query.lang;
    if (req.session) req.session.lang = chosen;
    res.cookie('ks_lang', chosen, {
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
  }
  const lang = resolveLang(req);
  res.locals.lang = lang;
  res.locals.t = makeT(lang);
  res.locals.langMeta = LANG_META[lang];
  // Rebuild the current URL's query string with a new lang value, so the
  // language switch keeps the page + existing filters (e.g. /listings?crop=…).
  res.locals.langHref = (targetLang) => {
    const q = Object.assign({}, req.query || {});
    q.lang = targetLang;
    const qs = Object.keys(q)
      .filter((k) => q[k] !== undefined && q[k] !== '')
      .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(q[k]))
      .join('&');
    return qs ? '?' + qs : '';
  };
  next();
}

module.exports = { LANGS, LANG_META, SUPPORTED, makeT, resolveLang, attachLang };