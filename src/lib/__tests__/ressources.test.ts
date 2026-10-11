import { describe, expect, it, vi } from 'vitest';
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
import { GUIDE, lireConsentementEnAttente } from '../ressources';
describe('Ressources privées', () => {
  it('annonce les 25 pages du PDF joint', () => { expect(GUIDE.pages).toBe(25); });
  it('sert le PDF depuis un chemin non devinable du dépôt', () => { expect(GUIDE.url).toMatch(/^\/fichiers\/[0-9a-f]{16}\/.+\.pdf$/); });
  it('ne crée pas de consentement marketing implicite', () => { expect(lireConsentementEnAttente(null)).toBeNull(); });
  it('conserve un refus explicite sans bloquer la ressource', () => { expect(lireConsentementEnAttente(JSON.stringify({consent: false, date: 1000}), 2000)).toBe(false); });
  it('conserve un accord explicite', () => { expect(lireConsentementEnAttente(JSON.stringify({consent: true, date: 1000}), 2000)).toBe(true); });
  it('ignore un choix expiré', () => { expect(lireConsentementEnAttente(JSON.stringify({consent: true, date: 1000}), 3_601_001)).toBeNull(); });
});
