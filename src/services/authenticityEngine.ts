/**
 * SHODH SETU AI - Authenticity Scoring Engine
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Strict Weighted Formula:
 * - Identity Consistency: 20%
 * - Indexing Evidence: 20%
 * - ISSN Evidence: 15%
 * - Publisher Verification: 15%
 * - Website Consistency: 10%
 * - Editorial Transparency: 10%
 * - Publication Transparency: 10%
 * Total: 100
 */

import { AuthenticityScoreBreakdown, DataSourceResult } from '../types';

export function calculateAuthenticityScore(params: {
  hasIssnMatch: boolean;
  crossrefStatus: DataSourceResult['status'];
  openAlexStatus: DataSourceResult['status'];
  doajStatus: DataSourceResult['status'];
  scopusStatus: DataSourceResult['status'];
  wosStatus: DataSourceResult['status'];
  hasDomainConsistency: boolean;
  hasEditorialTransparency: boolean;
  hasPublicationTransparency: boolean;
  isPublisherVerified: boolean;
  isClonedRisk: boolean;
  predatoryRiskScore: number;
}): AuthenticityScoreBreakdown {
  // 1. Identity Consistency (max 20)
  let identityConsistency = 10;
  if (params.hasIssnMatch) identityConsistency += 5;
  if (params.isPublisherVerified) identityConsistency += 5;
  if (params.isClonedRisk) identityConsistency = Math.max(2, identityConsistency - 16);

  // 2. Indexing Evidence (max 20)
  let indexingEvidence = 0;
  if (params.crossrefStatus === 'FOUND' || params.crossrefStatus === 'VERIFIED') indexingEvidence += 6;
  if (params.openAlexStatus === 'FOUND' || params.openAlexStatus === 'VERIFIED') indexingEvidence += 5;
  if (params.doajStatus === 'VERIFIED') indexingEvidence += 5;
  if (params.scopusStatus === 'VERIFIED') indexingEvidence += 4;
  if (params.wosStatus === 'VERIFIED') indexingEvidence += 4;
  indexingEvidence = Math.min(20, indexingEvidence);

  // 3. ISSN Evidence (max 15)
  let issnEvidence = params.hasIssnMatch ? 15 : 4;
  if (params.isClonedRisk) issnEvidence = 8; // Hijacked ISSN

  // 4. Publisher Verification (max 15)
  let publisherVerification = params.isPublisherVerified ? 14 : 5;
  if (params.isClonedRisk) publisherVerification = 2;

  // 5. Website Consistency (max 10)
  let websiteConsistency = params.hasDomainConsistency ? 10 : 3;
  if (params.isClonedRisk) websiteConsistency = 2;

  // 6. Editorial Transparency (max 10)
  let editorialTransparency = params.hasEditorialTransparency ? 10 : 4;
  if (params.predatoryRiskScore > 60) editorialTransparency = Math.max(2, editorialTransparency - 6);

  // 7. Publication Transparency (max 10)
  let publicationTransparency = params.hasPublicationTransparency ? 10 : 4;
  if (params.doajStatus === 'VERIFIED') publicationTransparency = 10;
  if (params.predatoryRiskScore > 60) publicationTransparency = Math.max(2, publicationTransparency - 6);

  const rawTotal = 
    identityConsistency +
    indexingEvidence +
    issnEvidence +
    publisherVerification +
    websiteConsistency +
    editorialTransparency +
    publicationTransparency;

  // Deduction if high predatory risk
  let penalty = 0;
  if (params.predatoryRiskScore >= 80) penalty = 35;
  else if (params.predatoryRiskScore >= 50) penalty = 20;

  const total = Math.max(5, Math.min(100, Math.round(rawTotal - penalty)));

  return {
    identityConsistency,
    indexingEvidence,
    issnEvidence,
    publisherVerification,
    websiteConsistency,
    editorialTransparency,
    publicationTransparency,
    total,
  };
}
