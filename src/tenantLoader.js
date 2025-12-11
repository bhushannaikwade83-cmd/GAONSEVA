// src/tenantLoader.js
export const TENANT_ID = import.meta.env.VITE_TENANT_ID || 'default';

export async function loadTenantConfig() {
  try {
    const config = await import(`./config/${TENANT_ID}.json`);
    return config.default || config;
  } catch (err) {
    console.error(`Failed to load config for tenant: ${TENANT_ID}`, err);
    throw err;
  }
}
