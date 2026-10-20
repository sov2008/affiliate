// Inline clean SVG vector marks for partner stores
// 100% transparent vector outlines without rectangular background, borders or padding
export const BRAND_VECTOR_SVGS: Record<string, string> = {
  // ExpressVPN (Red shield vector)
  "expressvpn": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-red-500">
    <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 2.18l6 2.25v4.66c0 4.12-2.73 7.97-6 9.06-3.27-1.09-6-4.94-6-9.06V6.43l6-2.25zm-2 5.32v5l4.5-2.5-4.5-2.5z"/>
  </svg>`,

  // PureVPN (Teal Keyhole / Shield vector)
  "purevpn": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-emerald-500">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.66 0 3 1.34 3 3 0 1.13-.63 2.11-1.56 2.62L14 17h-4l.56-4.38C9.63 12.11 9 11.13 9 10c0-1.66 1.34-3 3-3z"/>
  </svg>`,

  // ChicMe (Fashion Hanger / Diamond vector)
  "chicme": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-rose-500">
    <path d="M12 2C9.5 2 7.7 3.5 7.7 5.5c0 1.3.8 2.3 2 2.8L2 14.5c-.6.5-.4 1.5.4 1.5h19.2c.8 0 1-.9.4-1.5L14.3 8.3c1.2-.5 2-1.5 2-2.8C16.3 3.5 14.5 2 12 2zm0 2c1.4 0 2.3.8 2.3 1.5 0 .8-.9 1.5-2.3 1.5s-2.3-.7-2.3-1.5C9.7 4.8 10.6 4 12 4zm0 6l6.8 5H5.2L12 10zm-8 8h16v2H4v-2z"/>
  </svg>`,

  // Glasseslit (Spectacles / Eyewear vector)
  "glasseslit": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-cyan-500">
    <path d="M5.5 6C3 6 1 8 1 10.5S3 15 5.5 15c2.3 0 4.1-1.6 4.5-3.8.7.5 1.5.8 2 .8s1.3-.3 2-.8c.4 2.2 2.2 3.8 4.5 3.8 2.5 0 4.5-2 4.5-4.5S21 6 18.5 6c-2.3 0-4.1 1.6-4.5 3.8-.5-.5-1.3-.8-2-.8s-1.5.3-2 .8C9.6 7.6 7.8 6 5.5 6zm0 2c1.4 0 2.5 1.1 2.5 2.5S6.9 13 5.5 13 3 11.9 3 10.5 4.1 8 5.5 8zm13 0c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5z"/>
  </svg>`,

  // RaynaTours (Compass / Globe vector)
  "raynatours": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-blue-500">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm2.5-12.5L9 11l-1.5 5.5L13 15l1.5-5.5zM12 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
  </svg>`,

  // Airalo (Global SIM / Connectivity vector)
  "airalo": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-amber-500">
    <path d="M18 2h-8L4 8v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V9l5-5h7v16zm-9-8h2v5H9zm4-3h2v8h-2zm-8 9h2v2H5z"/>
  </svg>`,

  // ALLPOWERS (Lightning Battery / Solar Generator vector)
  "allpowers": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-emerald-400">
    <path d="M16 4h-1V2h-6v2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-3.5 13.5v-3H15l-4.5-6.5v3.5H9l3.5 6z"/>
  </svg>`,

  // Alibaba (Shopping Bag / Marketplace vector)
  "alibaba": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-orange-500">
    <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-9c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z"/>
  </svg>`,

  // The Deal Outlet (Discount Tag vector)
  "thedealoutlet": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-indigo-400">
    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
  </svg>`,

  // VogaCloset (Fashion Dress Silhouette vector)
  "vogacloset": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-purple-400">
    <path d="M12 2c-.6 0-1 .4-1 1v1.1C9.2 4.6 8 6.2 8 8c0 1.1.9 2 2 2l-2 11c-.1.5.3 1 .8 1h6.4c.5 0 .9-.5.8-1L14 10c1.1 0 2-.9 2-2 0-1.8-1.2-3.4-3-3.9V3c0-.6-.4-1-1-1zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
  </svg>`,

  // Kodland (Coding / Brackets vector)
  "kodland": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-indigo-500">
    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
  </svg>`,

  // Hostinger (Server / Cloud Database vector)
  "hostinger": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-violet-500">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z"/>
  </svg>`,

  // Huawei (Flower Petals / Technology vector)
  "huawei": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-red-600">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V18h-2v-1.07c-2.83-.48-5-2.94-5-5.93 0-3.31 2.69-6 6-6s6 2.69 6 6c0 2.99-2.17 5.45-5 5.93zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
  </svg>`,

  // Touch (Smartphone / Mobile Tech vector)
  "touch": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-violet-400">
    <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14zm-5-1c.83 0 1.5-.67 1.5-1.5S12.83 15 12 15s-1.5.67-1.5 1.5.67 1.5 1.5 1.5z"/>
  </svg>`,

  // Polis UA (Safety Shield / Insurance vector)
  "polis": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-blue-400">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
  </svg>`,

  // Abelssoft (Software Disk / Security vector)
  "abelssoft": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-blue-500">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm3-9H9V6h6v2z"/>
  </svg>`,

  // 945 Industries (Gear / Tactical Machinery vector)
  "945industries": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-amber-600">
    <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
  </svg>`,

  // Jashanmal (Department Store / Gift Box vector)
  "jashanmal": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-stone-400">
    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1h-2.22c.4-1.2 1.48-2 2.22-2zM9 4c.74 0 1.82.8 2.22 2H9c-.55 0-1-.45-1-1s.45-1 1-1zm11 15H4V8h16v11zm-9-9h2v7h-2z"/>
  </svg>`,

  // Dabdoob (Kids Toy Bear / Gift vector)
  "dabdoob": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-pink-500">
    <path d="M4.5 9c-.83 0-1.5-.67-1.5-1.5S3.67 6 4.5 6s1.5.67 1.5 1.5S5.33 9 4.5 9zm15 0c-.83 0-1.5-.67-1.5-1.5S18.67 6 19.5 6s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 4c-4.42 0-8 3.58-8 8 0 2.21.9 4.21 2.34 5.66L7 21h10l.66-3.34C19.1 16.21 20 14.21 20 12c0-4.42-3.58-8-8-8zm-3 8c-.83 0-1.5-.67-1.5-1.5S8.17 9 9 9s1.5.67 1.5 1.5S9.83 12 9 12zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 9 15 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-3 5c-1.66 0-3-1-3-2h6c0 1-1.34 2-3 2z"/>
  </svg>`,

  // Vperfumes (Fragrance Bottle vector)
  "vperfumes": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-amber-300">
    <path d="M10 2h4v2h-4zm-1 3h6v2H9zm9 4c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1l-2 12c-.08.52.3 1 1 1h14c.7 0 1.08-.48 1-1l-2-12zm-3.5 10h-5c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h5c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1z"/>
  </svg>`,

  // Mark Formelle (Apparel / Sewing Thread vector)
  "markformelle": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-teal-400">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>`,

  // Nazih Cosmetics (Cosmetics Mirror / Sparkle vector)
  "nazih": `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-rose-400">
    <path d="M12 2L9.5 8.5 3 11l6.5 2.5L12 20l2.5-6.5L21 11l-6.5-2.5zM19 2l-1 2.5L15.5 5.5l2.5 1L19 9l1-2.5L22.5 5.5l-2.5-1z"/>
  </svg>`
};
