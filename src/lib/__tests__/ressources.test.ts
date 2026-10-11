import { describe, expect, it, vi } from 'vitest';
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
import { GUIDE, lireConsentementEnAttente } from '../ressources';
describe('Ressources privées', () => {
  it('annonce les 30 pages du PDF joint', () => { expect(GUIDE.pages).toBe(30); });
  it('limite le lien signé à cinq minutes', () => { expect(GUIDE.expiration).toBe(300); });
  it('ne crée pas de consentement marketing implicite', () => { expect(lireConsentementEnAttente(null)).toBeNull(); });
  it('conserve un refus explicite sans bloquer la ressource', () => { expect(lireConsentementEnAttente(JSON.stringify({consent: false, date: 1000}), 2000)).toBe(false); });
  it('conserve un accord explicite', () => { expect(lireConsentementEnAttente(JSON.stringify({consent: true, date: 1000}), 2000)).toBe(true); });
  it('ignore un choix expiré', () => { expect(lireConsentementEnAttente(JSON.stringify({consent: true, date: 1000}), 3_601_001)).toBeNull(); });
});
