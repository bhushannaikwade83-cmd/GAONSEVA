// src/tenantLoader.js
// Works with Vite (VITE_) and CRA (REACT_APP_)
const _getEnvTenant = () => {
  // Vite: import.meta.env, CRA: process.env
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TENANT_ID) {
      return import.meta.env.VITE_TENANT_ID;
    }
  } catch (e) {}
  if (process && process.env && process.env.REACT_APP_TENANT_ID) {
    return process.env.REACT_APP_TENANT_ID;
  }
  if (typeof process !== 'undefined' && process.env && process.env.VITE_TENANT_ID) {
    return process.env.VITE_TENANT_ID;
  }
  return 'demo'; // fallback
};

const TENANT_ID = _getEnvTenant();

// dynamic import - will be bundled only for files present in /src/config
async function loadTenantConfig() {
  try {
    const cfg = await import(`./config/${TENANT_ID}.json`);
    return cfg.default || cfg;
  } catch (err) {
    console.warn(`Tenant config not found for "${TENANT_ID}", falling back to demo`, err);
    const fallback = await import('./config/demo.json');
    return fallback.default || fallback;
  }
}

export { TENANT_ID, loadTenantConfig };
