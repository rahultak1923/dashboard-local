import React from 'react';
import { LayoutGrid, Users, LogOut, Network } from 'lucide-react';

export default function Sidebar({ currentPage, setPage, onLogout }) {
  const navItems = [
    { label: 'Overview', icon: LayoutGrid },
    { label: 'Employees', icon: Users }, // Yeh raha Employees / CRM page ka nav item
  ];

  return (
    <aside style={{ width: 232, background: 'linear-gradient(165deg, #132E8C 0%, #0A1958 60%, #060F38 100%)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 28, minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #00C2FF, #06E0D6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Network size={18} color="#071238" strokeWidth={2.6} />
        </div>
        <div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15, color: '#fff' }}>DW CRM</div>
          <div style={{ fontFamily: 'monospace', fontSize: 9.5, color: '#00C2FF' }}>LOCAL DASHBOARD</div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(({ label, icon: Icon }) => {
          const active = currentPage === label;
          return (
            <div
              key={label}
              onClick={() => setPage(label)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, cursor: 'pointer',
                background: active ? 'rgba(0,194,255,0.14)' : 'transparent',
                color: active ? '#fff' : '#8CA0D0',
                fontWeight: active ? 600 : 500
              }}
            >
              <Icon size={16} color={active ? '#00C2FF' : '#8CA0D0'} />
              <span>{label}</span>
            </div>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <button 
          onClick={onLogout} 
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(240,68,56,0.15)', color: '#F04438', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </aside>
  );
}