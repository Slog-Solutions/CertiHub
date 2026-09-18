import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, Smartphone, Info, AlertTriangle, RefreshCw } from 'lucide-react';

const AppVersions = () => {
  const { api } = useAuth();
  const [platform, setPlatform] = useState('android');
  const [formData, setFormData] = useState({
    latestVersion: '',
    minimumVersion: '',
    forceUpdate: false,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConfig(platform);
  }, [platform]);

  const fetchConfig = async (plat) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await api.get(`/app/version?platform=${plat}`);
      if (res.data) {
        setFormData({
          latestVersion: res.data.latestVersion || '',
          minimumVersion: res.data.minimumVersion || '',
          forceUpdate: res.data.forceUpdate || false,
          message: res.data.message || ''
        });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Not found, use defaults
        setFormData({
          latestVersion: '1.0.0',
          minimumVersion: '1.0.0',
          forceUpdate: false,
          message: 'Please update to the latest version.'
        });
      } else {
        setError(err.response?.data?.error || 'Failed to fetch version config');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    setError(null);
    
    try {
      const res = await api.put(`/app/version/${platform}`, formData);
      setResult(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-dark)' }}>App Version Management</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure mandatory force-updates for the Android and iOS apps.</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setPlatform('android')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: platform === 'android' ? 'var(--primary)' : '#e2e8f0',
            color: platform === 'android' ? '#fff' : '#475569',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Smartphone size={18} />
          Android
        </button>
        <button
          onClick={() => setPlatform('ios')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: platform === 'ios' ? 'var(--primary)' : '#e2e8f0',
            color: platform === 'ios' ? '#fff' : '#475569',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Smartphone size={18} />
          iOS
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ marginRight: '10px' }} />
            Loading configuration...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Latest Version</label>
                <input 
                  type="text" 
                  required
                  value={formData.latestVersion}
                  onChange={(e) => setFormData({...formData, latestVersion: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' }}
                  placeholder="e.g. 1.0.5"
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Minimum Required Version</label>
                <input 
                  type="text" 
                  required
                  value={formData.minimumVersion}
                  onChange={(e) => setFormData({...formData, minimumVersion: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' }}
                  placeholder="e.g. 1.0.0"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={formData.forceUpdate}
                  onChange={(e) => setFormData({...formData, forceUpdate: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                Enable Hard Force Update
              </label>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', marginLeft: '28px' }}>
                If checked, users below the minimum version cannot dismiss the update prompt.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Update Message</label>
              <textarea 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none', resize: 'vertical' }}
                placeholder="A critical update is available. Please update to continue."
              />
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Info size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                Changes applied here will immediately affect the {platform === 'android' ? 'Android' : 'iOS'} mobile application the next time a user opens the app.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              style={{ 
                background: 'var(--primary)', 
                color: '#fff', 
                border: 'none', 
                padding: '12px 24px', 
                borderRadius: '6px', 
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: saving ? 0.7 : 1,
                alignSelf: 'flex-start'
              }}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        )}

        {result && (
          <div style={{ marginTop: '24px', padding: '16px', background: '#dcfce7', color: '#166534', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Success!</div>
            <div style={{ fontSize: '14px' }}>{result}</div>
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

export default AppVersions;
