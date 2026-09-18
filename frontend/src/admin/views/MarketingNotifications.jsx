import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Info, AlertTriangle } from 'lucide-react';

const MarketingNotifications = () => {
  const { api } = useAuth();
  const [formData, setFormData] = useState({ title: '', message: '', targetAudience: 'all' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const res = await api.post('/marketing/send-campaign', formData);
      setResult(res.data);
      setFormData({ title: '', message: '', targetAudience: 'all' });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-dark)' }}>Marketing Campaigns</h1>
        <p style={{ color: 'var(--text-muted)' }}>Send promotional notifications to specific audiences.</p>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Campaign Title</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' }}
              placeholder="e.g. Diwali Special Offer! 🎉"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Message Body</label>
            <textarea 
              required
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              rows={4}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none', resize: 'vertical' }}
              placeholder="Enter the marketing message..."
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Target Audience</label>
            <select 
              value={formData.targetAudience}
              onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none', background: '#fff' }}
            >
              <option value="all">All Devices (Everyone)</option>
              <option value="anonymous">Anonymous / Logged Out Devices Only</option>
              <option value="logged_in">Logged In Users Only</option>
            </select>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Info size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
              This campaign will be sent to the selected audience. Users who have explicitly disabled marketing in their profile will be skipped automatically.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: 'var(--primary)', 
              color: '#fff', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '6px', 
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: loading ? 0.7 : 1
            }}
          >
            <Send size={18} />
            {loading ? 'Sending Campaign...' : 'Send Campaign'}
          </button>
        </form>

        {result && (
          <div style={{ marginTop: '24px', padding: '16px', background: '#dcfce7', color: '#166534', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Success!</div>
            <div style={{ fontSize: '14px' }}>{result.message}</div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: '24px', padding: '16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '14px' }}>{error}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingNotifications;
