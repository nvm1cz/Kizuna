/** Logo và tên ứng dụng: cây kiến thức ghép từ các Node. */
export const logo = `<svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="18" fill="#0f4a3c"/>
<path d="M32 56V22M32 45 18 33M32 38l15-12M32 51l12-6" fill="none" stroke="#7fd8a8" stroke-width="4.5" stroke-linecap="round"/>
<circle cx="32" cy="15" r="7.5" fill="#d3f8e2"/><circle cx="16" cy="30" r="6.5" fill="#57cf95"/><circle cx="49" cy="24" r="6.5" fill="#57cf95"/><circle cx="47" cy="44" r="4.5" fill="#a9ecc8"/></svg>`;

export const brand = `${logo}<span class="brand-name">Hus<b>tree</b></span>`;

/** Cây minh họa: Node đã thông suốt, Node đang học và Node còn khóa. */
export const heroArt = `<svg class="hero-art" viewBox="0 0 380 270" aria-hidden="true">
  <path class="thread" d="M190 262V214M190 214C190 170 112 186 112 138M190 214C190 164 262 178 262 128"/>
  <path class="thread dashed" d="M112 138C112 96 62 108 62 66M112 138C112 92 168 98 168 46M262 128C262 88 320 96 320 54"/>
  <g class="knot done"><circle cx="190" cy="214" r="28"/><path d="m179 214 8 8 15-16"/></g>
  <g class="knot done"><circle cx="112" cy="138" r="28"/><path d="m101 138 8 8 15-16"/></g>
  <g class="knot now"><circle cx="262" cy="128" r="28"/><path d="M257 117v22l17-11z"/></g>
  <g class="knot wait"><circle cx="62" cy="58" r="24"/><rect x="52" y="56" width="20" height="15" rx="4"/><path d="M55.500 56v-5a6.500 6.500 0 0 1 13 0v5"/></g>
  <g class="knot wait"><circle cx="168" cy="38" r="24"/><rect x="158" y="36" width="20" height="15" rx="4"/><path d="M161.500 36v-5a6.500 6.500 0 0 1 13 0v5"/></g>
  <g class="knot wait"><circle cx="320" cy="46" r="24"/><rect x="310" y="44" width="20" height="15" rx="4"/><path d="M313.500 44v-5a6.500 6.500 0 0 1 13 0v5"/></g>
</svg>`;
