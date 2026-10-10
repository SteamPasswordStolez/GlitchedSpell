// Original, reproducible vector concept art; this is not a gameplay screenshot.
import { mkdirSync, writeFileSync } from 'node:fs';

const output = new URL('../assets/strikegy-arena.svg', import.meta.url);
const project = (x, z, height = 0) => [800 + (x - z) * 1.8, 280 + (x + z) * .56 - height];
const points = coordinates => coordinates.map(point => project(...point).map(n => n.toFixed(1)).join(',')).join(' ');
const polygon = (coordinates, fill, stroke = '#738659', opacity = 1) => `<polygon points="${points(coordinates)}" fill="${fill}" stroke="${stroke}" stroke-width=".8" opacity="${opacity}"/>`;
const line = (a, b, stroke = '#809660', width = 1, extra = '') => {
  const [x1, y1] = project(...a); const [x2, y2] = project(...b);
  return `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
};
let art = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 700" width="1600" height="700"><defs>
<linearGradient id="sky" x2="0" y2="1"><stop stop-color="#151e11"/><stop offset=".5" stop-color="#465137"/><stop offset="1" stop-color="#0f1a0c"/></linearGradient>
<linearGradient id="haze" x2="0" y2="1"><stop stop-color="#aec18c" stop-opacity=".28"/><stop offset=".65" stop-color="#87966c" stop-opacity="0"/></linearGradient>
<radialGradient id="aura"><stop stop-color="#c1f363" stop-opacity=".45"/><stop offset="1" stop-color="#c1f363" stop-opacity="0"/></radialGradient>
<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0H4" stroke="#0a140a" stroke-opacity=".1"/></pattern>
<filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4"/></filter>
</defs><rect width="1600" height="700" fill="url(#sky)"/>`;
// Far silhouettes and aerial ground grid.
for (let n = 0; n < 38; n++) {
  const x = n * 45 - 25, h = 20 + ((n * 37) % 97);
  art += `<path d="M${x} 260V${260 - h}h30v${h}Z" fill="#1c2917" opacity=".55"/>`;
}
art += polygon([[-440,-330],[420,-330],[420,500],[-440,500]], '#293522', '#536246');
for (let n = -400; n <= 500; n += 40) {
  art += line([n,-330],[n,500], '#75865b', .7, 'opacity=".25"');
  art += line([-440,n],[420,n], '#75865b', .7, 'opacity=".25"');
}
// Intersecting roads run between the control points.
art += polygon([[-450,45],[450,45],[450,82],[-450,82]], '#17210f', '#64724c');
art += polygon([[70,-350],[104,-350],[104,500],[70,500]], '#17210f', '#64724c');
art += line([-430,63],[440,63], '#b3cd7a', 1.4, 'stroke-dasharray="15 20" opacity=".7"');
art += line([87,-320],[87,500], '#b3cd7a', 1.4, 'stroke-dasharray="15 20" opacity=".7"');
function building(x,z,w,d,h,type = 0) {
  let shape = polygon([[x,z,0],[x+w,z,0],[x+w,z+d,0],[x,z+d,0]], '#0e170a', '#26311b');
  shape += polygon([[x+w,z,h],[x+w,z+d,h],[x+w,z+d,0],[x+w,z,0]], '#26351c', '#576546');
  shape += polygon([[x,z+d,h],[x+w,z+d,h],[x+w,z+d,0],[x,z+d,0]], '#172612', '#4e603a');
  shape += polygon([[x,z,h],[x+w,z,h],[x+w,z+d,h],[x,z+d,h]], type ? '#657153' : '#4b5c3b', '#81916c');
  shape += polygon([[x+5,z+5,h+1],[x+w-5,z+5,h+1],[x+w-5,z+d-5,h+1],[x+5,z+d-5,h+1]], 'none', '#a1ae81', .55);
  for (let f = 12; f < h-8; f += 13) shape += line([x+4,z+d,f],[x+w-4,z+d,f], '#adc17c', 1.5, 'stroke-dasharray="5 7" opacity=".55"');
  if(type) shape += line([x+w/2,z+d/2,h],[x+w/2,z+d/2,h+38], '#d1dfa4', 1.2);
  return shape;
}
const blocks = [];
for (let x = -350; x <= 340; x += 95) for(let z = -250; z <= 400; z += 100) {
  if ((x > 25 && x < 115) || (z > 0 && z < 120)) continue;
  const seed = Math.abs(x*13 + z*7);
  blocks.push({x,z,w:45+seed%25,d:40+seed%19,h:22+seed%75,type:seed%3 === 0});
}
blocks.sort((a,b)=>a.x+a.z-b.x-b.z);
for(const b of blocks) art += building(b.x,b.z,b.w,b.d,b.h,b.type);
// The central tower and glowing objective paths.
art += building(130,145,82,72,127,true);
art += building(145,157,50,46,151);
art += line([-245,63,4],[87,63,4], '#c1f363', 3, 'stroke-dasharray="4 8"');
art += line([87,63,4],[87,325,4], '#c1f363', 3, 'stroke-dasharray="4 8"');
for(const [x,z,label,active] of [[-245,63,'A',false],[87,63,'B',true],[87,325,'C',false]]) {
  const [sx,sy] = project(x,z,5);
  art += `<ellipse cx="${sx}" cy="${sy}" rx="${active?110:65}" ry="${active?44:26}" fill="url(#aura)"/>`;
  art += `<ellipse cx="${sx}" cy="${sy}" rx="42" ry="16" fill="none" stroke="#c1f363" stroke-width="2"/>`;
  art += `<path d="M${sx} ${sy}v-105" stroke="#c1f363" stroke-width="1" stroke-dasharray="3 5" opacity=".7"/>`;
  art += `<path d="M${sx} ${sy-144}l22 22-22 22-22-22Z" fill="${active?'#c1f363':'#26381c'}" stroke="#c1f363" stroke-width="1.4"/>`;
  art += `<text x="${sx}" y="${sy-115}" text-anchor="middle" fill="${active?'#172010':'#e0f5bd'}" font-family="Arial,sans-serif" font-weight="bold" font-size="20">${label}</text>`;
}
art += `<rect width="1600" height="700" fill="url(#haze)"/><rect width="1600" height="700" fill="url(#scan)"/>
<g stroke="#c1f363" opacity=".55" fill="none"><path d="M25 70V25h45M1530 25h45v45M25 630v45h45M1530 675h45v-45"/><path d="M785 350h30M800 335v30"/></g>
<g fill="#c0d5a1" font-family="monospace" font-size="10" opacity=".65"><text x="30" y="100">SECTOR / 03</text><text x="1460" y="620">A — B — C</text></g></svg>`;
mkdirSync(new URL('../assets/', import.meta.url), { recursive:true });
writeFileSync(output, art);
console.log('Generated original Strikegy arena concept illustration.');
