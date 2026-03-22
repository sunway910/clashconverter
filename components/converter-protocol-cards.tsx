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

// Gradient colors for each protocol card
const CARD_GRADIENTS = [
  'from-[#A78BFA] to-[#7C3AED]',
  'from-[#EC4899] to-[#DB2777]',
  'from-[#0EA5E9] to-[#0284C7]',
  'from-[#10B981] to-[#059669]',
  'from-[#F59E0B] to-[#D97706]',
  'from-[#8B5CF6] to-[#6D28D9]',
  'from-[#EF4444] to-[#DC2626]',
  'from-[#14B8A6] to-[#0D9488]',
  'from-[#F97316] to-[#EA580C]',
];

export const ProtocolCards = React.memo(() => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {PROTOCOL_CARDS.map((protocol, index) => (
      <div
        key={protocol.name}
        className="group relative overflow-hidden rounded-[20px] p-4 bg-white/60 backdrop-blur-sm border-white/20 shadow-clay-card transition-all duration-300 hover:-translate-y-1 hover:shadow-clay-card-hover"
      >
        {/* Gradient orb background */}
        <div className={`absolute -top-8 -right-8 w-16 h-16 rounded-full bg-gradient-to-br ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]}/20 blur-xl transition-all duration-500 group-hover:scale-150`} />

        {/* Protocol badge */}
        <div className="relative z-10">
          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]} shadow-clay-button mb-2`}>
            <span className="text-white text-xs font-black">
              {protocol.name.charAt(0)}
            </span>
          </div>
          <span className="text-xs font-bold text-[#332F3A]" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {protocol.name}
          </span>
        </div>
      </div>
    ))}
  </div>
));

ProtocolCards.displayName = 'ProtocolCards';
