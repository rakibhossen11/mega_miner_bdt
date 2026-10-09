
'use client';

export default function MaintenancePage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>
        🛠️ We will be back soon!
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>
        Our site is currently undergoing scheduled maintenance.
        Please check back in a few minutes.
      </p>
    </div>
  );
}