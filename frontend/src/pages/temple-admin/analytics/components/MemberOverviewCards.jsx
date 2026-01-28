/**
 * MemberOverviewCards - 會員總覽卡片元件
 */
import React from 'react';

const MemberOverviewCards = ({ data }) => {
  if (!data) return null;

  const cards = [
    {
      icon: '👥',
      label: '總會員數',
      value: data.total_members?.toLocaleString() || 0,
      subtitle: '曾與本廟互動的會員',
      highlight: '',
    },
    {
      icon: '🔥',
      label: '活躍會員',
      value: data.active_members?.toLocaleString() || 0,
      subtitle: `佔比 ${data.active_rate || 0}%`,
      highlight: 'highlight-green',
    },
    {
      icon: '🌱',
      label: '新會員',
      value: data.new_members?.toLocaleString() || 0,
      subtitle: '近30天首次互動',
      highlight: 'highlight-blue',
    },
    {
      icon: '💤',
      label: '休眠會員',
      value: data.dormant_members?.toLocaleString() || 0,
      subtitle: `佔比 ${data.dormant_rate || 0}%`,
      highlight: 'highlight-orange',
    },
  ];

  return (
    <div className="overview-cards">
      {cards.map((card, index) => (
        <div key={index} className={`overview-card ${card.highlight}`}>
          <div className="card-icon">{card.icon}</div>
          <div className="card-label">{card.label}</div>
          <div className="card-value">{card.value}</div>
          <div className="card-subtitle">{card.subtitle}</div>
        </div>
      ))}
    </div>
  );
};

export default MemberOverviewCards;
