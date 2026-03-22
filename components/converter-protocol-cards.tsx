import React from 'react';

const PROTOCOL_CARDS = [
  { name: 'Shadowsocks' },
  { name: 'ShadowsocksR' },
  { name: 'Vmess' },
  { name: 'VLESS' },
  { name: 'Trojan' },
  { name: 'Hysteria' },
  { name: 'Hysteria2' },
  { name: 'HTTP' },
  { name: 'SOCKS5' },
] as const;

// Vibrant gradient colors for each protocol card - Candy Shop Palette
const CARD_GRADIENTS = [
  'from-clay-accent to-clay-accent-alt',
  'from-clay-accent-alt to-pink-600',
  'from-clay-accent-tertiary to-blue-600',
  'from-clay-success to-emerald-600',
  'from-clay-warning to-amber-600',
  'from-purple-500 to-purple-700',
  'from-red-500 to-red-700',
  'from-teal-400 to-teal-600',
  'from-orange-400 to-orange-600',
];

export const ProtocolCards = React.memo(() => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
    {PROTOCOL_CARDS.map((protocol, index) => (
      <div
        key={protocol.name}
        className="group relative overflow-hidden rounded-3xl p-5 bg-white/60 backdrop-blur-sm border-white/20 clay-card transition-all duration-500 hover:-translate-y-2 hover:clay-card-hover"
      >
        {/* Gradient orb background */}
        <div className={`absolute -top-8 -right-8 w-20 h-20 rounded-full bg-gradient-to-br ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]}/20 blur-xl transition-all duration-500 group-hover:scale-150`} />

        {/* Protocol badge */}
        <div className="relative z-10">
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]} clay-button mb-3`}>
            <span className="text-white text-sm font-black">
              {protocol.name.charAt(0)}
            </span>
          </div>
          <span className="text-xs font-bold text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {protocol.name}
          </span>
        </div>
      </div>
    ))}
  </div>
));

ProtocolCards.displayName = 'ProtocolCards';
