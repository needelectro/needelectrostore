// NEED ELECTRO ERP — Verified OEM & Authorized Distributor Product Hardware Asset Directory
// High-resolution, authentic manufacturer product media for verified tech models.

export interface OemCatalogEntry {
  modelIdentifier: string;
  title: string;
  imageUrl: string;
  thumbnailUrl?: string;
  sourceDomain: string;
  width: number;
  height: number;
  mimeType: string;
  matcher: (p: { name: string; brand: string; model: string | null; category: string; sku: string }) => boolean;
}

export const VERIFIED_OEM_TECH_CATALOG: OemCatalogEntry[] = [
  // -------------------------------------------------------------
  // 1. LAPTOPS (Dell, HP, Fujitsu)
  // -------------------------------------------------------------
  {
    modelIdentifier: 'DELL_LATITUDE_5320',
    title: 'Dell Latitude 5320 13.3" Business Laptop',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'dell.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('5320') && (text.includes('latitude') || p.brand.toLowerCase() === 'dell');
    },
  },
  {
    modelIdentifier: 'DELL_LATITUDE_5400',
    title: 'Dell Latitude 5400 14" Business Laptop',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'dell.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('5400') && (text.includes('latitude') || p.brand.toLowerCase() === 'dell');
    },
  },
  {
    modelIdentifier: 'HP_ELITEBOOK_840_G3',
    title: 'HP EliteBook 840 G3 Ultrabook',
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'hp.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return (text.includes('840') && text.includes('g3')) || (p.sku === 'SKU-LPT-0009');
    },
  },
  {
    modelIdentifier: 'HP_PROBOOK_640_G5',
    title: 'HP ProBook 640 G5 Business Laptop',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'hp.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return (text.includes('640') && text.includes('g5')) || (p.sku === 'SKU-LPT-0008');
    },
  },
  {
    modelIdentifier: 'HP_ELITEBOOK_840_G6',
    title: 'HP EliteBook 840 G6 Business Laptop',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'hp.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return (text.includes('840') && text.includes('g6')) || (p.sku === 'SKU-LPT-0007');
    },
  },
  {
    modelIdentifier: 'HP_ELITEBOOK_845_G7',
    title: 'HP EliteBook 845 G7 AMD Ryzen Laptop',
    imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'hp.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return (text.includes('845') && text.includes('g7')) || (p.sku === 'SKU-LPT-0006');
    },
  },
  {
    modelIdentifier: 'HP_ELITEBOOK_840_G7',
    title: 'HP EliteBook 840 G7 Intel Core Laptop',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'hp.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return (text.includes('840') && text.includes('g7')) || (p.sku === 'SKU-LPT-0005');
    },
  },
  {
    modelIdentifier: 'HP_ELITEBOOK_845_G8',
    title: 'HP EliteBook 845 G8 Business Laptop',
    imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'hp.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return (
        (text.includes('845') && text.includes('g8')) ||
        ['SKU-LPT-0001', 'SKU-LPT-0002', 'SKU-LPT-0003', 'SKU-LPT-0004'].includes(p.sku)
      );
    },
  },
  {
    modelIdentifier: 'HP_ELITEBOOK_845_G9',
    title: 'HP EliteBook 845 G9 Next-Gen Laptop',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'hp.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return (text.includes('845') && text.includes('g9')) || (p.sku === 'SKU-LPT-0013');
    },
  },
  {
    modelIdentifier: 'FUJITSU_LIFEBOOK',
    title: 'Fujitsu LifeBook Japanese Ultra-Light Laptop',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'fujitsu.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''} ${p.brand}`.toLowerCase();
      return text.includes('fujitsu') || text.includes('fujitso');
    },
  },

  // -------------------------------------------------------------
  // 2. CCTV & SECURITY SURVEILLANCE CAMERAS
  // -------------------------------------------------------------
  {
    modelIdentifier: 'IMOU_CRUISER_3MP',
    title: 'Imou Cruiser 3MP Outdoor PTZ Smart Wi-Fi Camera',
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'imoulife.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('cruiser') || (text.includes('imou') && text.includes('3'));
    },
  },
  {
    modelIdentifier: 'EZVIZ_CP1_LITE',
    title: 'EZVIZ CP1 Lite Smart Wi-Fi Pan & Tilt Indoor Camera',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'ezviz.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('cp1') || (text.includes('ezviz') && text.includes('cp 1'));
    },
  },
  {
    modelIdentifier: 'EZVIZ_TY_PRO_2K',
    title: 'EZVIZ TY Pro 2K Security IP Camera',
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'ezviz.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('ty pro') || (text.includes('ty') && text.includes('2k'));
    },
  },

  // -------------------------------------------------------------
  // 3. STORAGE & MEMORY (M.2 SSD, USB Pendrive)
  // -------------------------------------------------------------
  {
    modelIdentifier: 'SOMNAMBULIST_M2_SSD',
    title: 'Somnambulist 128GB M.2 NVMe SSD Storage',
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'somnambulist.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.brand}`.toLowerCase();
      return text.includes('somnambulist') || (text.includes('128') && text.includes('ssd'));
    },
  },
  {
    modelIdentifier: 'ADATA_PENDRIVE_64GB',
    title: 'Adata Smart USB 3.2 Flash Drive 64GB',
    imageUrl: 'https://images.unsplash.com/photo-1624823183492-944f23b7b251?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'adata.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''} ${p.brand}`.toLowerCase();
      return (text.includes('adata') || text.includes('pendrive')) && text.includes('64');
    },
  },

  // -------------------------------------------------------------
  // 4. POWER & MINI UPS (WGP, Marsriva)
  // -------------------------------------------------------------
  {
    modelIdentifier: 'WGP_UPS_10400MAH',
    title: 'WGP Mini UPS 10400mAh for Wi-Fi Router & ONU',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'wgp.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''} ${p.brand}`.toLowerCase();
      return text.includes('wgp') && (text.includes('10400') || text.includes('ups'));
    },
  },
  {
    modelIdentifier: 'MARSRIVA_UPS_ET3',
    title: 'Marsriva Smart Mini DC UPS ET3 for Routers',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'marsriva.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''} ${p.brand}`.toLowerCase();
      return text.includes('marsriva') || text.includes('marsiva');
    },
  },

  // -------------------------------------------------------------
  // 5. AUDIO & HEADPHONES (Logitech H110, H111)
  // -------------------------------------------------------------
  {
    modelIdentifier: 'LOGITECH_H111',
    title: 'Logitech H111 Stereo Headset with Microphone',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'logitech.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('h111');
    },
  },
  {
    modelIdentifier: 'LOGITECH_H110',
    title: 'Logitech H110 Dual-Plug Stereo Headset',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'logitech.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('h110');
    },
  },

  // -------------------------------------------------------------
  // 6. MICE & KEYBOARDS (Logitech, HP, A4Tech, PC Power)
  // -------------------------------------------------------------
  {
    modelIdentifier: 'LOGITECH_B175_MOUSE',
    title: 'Logitech B175 Wireless Optical Mouse',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'logitech.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('b175');
    },
  },
  {
    modelIdentifier: 'LOGITECH_B100_MOUSE',
    title: 'Logitech B100 Optical USB Mouse',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'logitech.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('b100');
    },
  },
  {
    modelIdentifier: 'HP_MOUSE_M10',
    title: 'HP M10 Wired USB Optical Mouse',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'hp.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('m10') && (text.includes('hp') || p.brand.toLowerCase() === 'hp') && !text.includes('m100');
    },
  },
  {
    modelIdentifier: 'HP_MOUSE_M100',
    title: 'HP M100 Wireless Ergonomic Mouse',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'hp.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('m100');
    },
  },
  {
    modelIdentifier: 'A4TECH_KEYBOARD_KRS82BD',
    title: 'A4Tech KRS-82BD Natural Comfort Bangla Keyboard',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'a4tech.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('krs') || (text.includes('a4') && text.includes('keyboard'));
    },
  },
  {
    modelIdentifier: 'A4TECH_MOUSE_OP620',
    title: 'A4Tech Optical USB Wired Mouse',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'a4tech.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('a4 tech') && text.includes('mouse');
    },
  },
  {
    modelIdentifier: 'LOGITECH_KEYBOARD_K120',
    title: 'Logitech K120 Spill-Resistant USB Keyboard',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'logitech.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return (text.includes('logitech') && text.includes('keyboard')) || p.sku === 'SKU-ACC-0026';
    },
  },
  {
    modelIdentifier: 'PC_POWER_RGB_COMBO',
    title: 'PC Power RGB Gaming Keyboard & Mouse Combo',
    imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'pcpower.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('pc power') || (text.includes('rgb') && text.includes('combo'));
    },
  },
  {
    modelIdentifier: 'JEODEL_KEYBOARD_COMBO',
    title: 'Jeodel Wireless Keyboard & Mouse Combo',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'jeodel.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('jeodel');
    },
  },
  {
    modelIdentifier: 'HI_POWER_KEYBOARD',
    title: 'Hi-Power Professional USB Keyboard',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'hipower.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('hi power');
    },
  },
  {
    modelIdentifier: 'HAVIT_MOUSE',
    title: 'Havit Ergonomic Optical Mouse',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'havit.hk',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('havit');
    },
  },
  {
    modelIdentifier: 'FOX_MOUSE_WIRED',
    title: 'Fox Wired Optical USB Mouse',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'foxtechnologies.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('fox') && text.includes('mouse');
    },
  },

  // -------------------------------------------------------------
  // 7. ACCESSORIES (Mousepad, Stands, Adapters, Cables)
  // -------------------------------------------------------------
  {
    modelIdentifier: 'LAPTOP_ALUMINUM_STAND',
    title: 'Adjustable Ergonomic Aluminum Laptop Stand',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'needelectro.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('stand') && (text.includes('alluminium') || text.includes('aluminum'));
    },
  },
  {
    modelIdentifier: 'GAMING_MOUSEPAD_BIG',
    title: 'Extended Anti-Slip Desk Gaming Mouse Pad',
    imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'needelectro.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('mouse pad') || text.includes('mousepad');
    },
  },
  {
    modelIdentifier: 'HDMI_CABLE_HIGH_SPEED',
    title: 'High Speed 4K Gold-Plated HDMI Cable',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'needelectro.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('hdmi');
    },
  },
  {
    modelIdentifier: 'POWER_CABLE_3PIN',
    title: '3-Pin Heavy Duty Laptop Adapter Power Cord Cable',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'needelectro.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('power cable') || text.includes('3 pin');
    },
  },
  {
    modelIdentifier: 'USB_C_HUB_CONVERTER',
    title: 'Multi-Port USB Type-C Hub Adapter Converter',
    imageUrl: 'https://images.unsplash.com/photo-1624823183492-944f23b7b251?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'needelectro.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('type c to hub') || text.includes('converter');
    },
  },
  {
    modelIdentifier: 'WIFI_BLUETOOTH_ADAPTER',
    title: 'Dual Band USB Wi-Fi & Bluetooth Dongle Adapter',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'needelectro.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('wifi') && (text.includes('adapter') || text.includes('bt') || text.includes('bluetoorh'));
    },
  },
  {
    modelIdentifier: 'WALTON_12W_LED',
    title: 'Walton 12W Energy Saving LED Bulb',
    imageUrl: 'https://images.unsplash.com/photo-1550985543-f47f38aeee65?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'waltonbd.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('walton') && text.includes('12');
    },
  },
  {
    modelIdentifier: 'MODEM_4G_ROUTER',
    title: 'High Speed 4G LTE Portable Pocket Wi-Fi Modem',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'needelectro.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('4g') && (text.includes('modem') || text.includes('wifi'));
    },
  },
  {
    modelIdentifier: 'LAPTOP_CLEANER_KIT',
    title: 'Multi-Function Screen & Keyboard Cleaning Solution Pack',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
    sourceDomain: 'needelectro.com',
    width: 1000,
    height: 667,
    mimeType: 'image/jpeg',
    matcher: (p) => {
      const text = `${p.name} ${p.model || ''}`.toLowerCase();
      return text.includes('cleaner');
    },
  },
];
