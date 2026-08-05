import React from 'react';

const About = () => {
  const containerStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px',
    background: '#18181b',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    textAlign: 'center'
  };

  const socialBtnStyle = {
    display: 'inline-block',
    margin: '10px',
    padding: '10px 20px',
    background: '#27272a',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  return (
    <div style={containerStyle}>
      <img
        src="/dp.jpg"
        alt="Anshika Pawar"
        style={{ width: '180px', height: '180px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f97316', marginBottom: '20px', boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)' }}
      />
      <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#fff' }}>About Me</h2>
      <h3 style={{ fontSize: '1.5rem', color: '#f97316', marginBottom: '15px' }}>Anshika Pawar</h3>
      <h4 style={{ fontSize: '1.2rem', color: '#a1a1aa', marginBottom: '20px' }}>Final Year Student</h4>

      <p style={{ color: '#a1a1aa', fontSize: '1.1rem', lineHeight: '1.8', maxWidth: '600px', margin: '0 auto 30px auto', textAlign: 'center' }}>
        <strong>Hi, I'm Anshika Pawar 👋</strong><br />
        An aspiring Software Engineer passionate about Java, MERN Stack, and Problem Solving. I enjoy building full-stack applications, exploring new technologies, and creating impactful software solutions.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
        <a href="https://github.com/AnshikaPawar15" target="_blank" rel="noreferrer" style={{ ...socialBtnStyle, background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>💻 GitHub</a>
        <a href="https://www.linkedin.com/in/anshika-pawar-8ba467290" target="_blank" rel="noreferrer" style={{ ...socialBtnStyle, background: 'rgba(59, 130, 246, 0.2)', borderColor: '#3b82f6', color: '#3b82f6' }}>💼 LinkedIn</a>
      </div>
    </div>
  );
};

export default About;
