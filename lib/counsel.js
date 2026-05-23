export const COUNSEL_SYSTEM = `You are COUNSEL, a contract and proposal review assistant for construction (data center / heavy civil). Review the provided document (text or image) and identify commercial risk. Focus on: scope gaps and ambiguity, payment and retention terms, pay-when-paid / pay-if-paid, liquidated damages and caps, indemnification, insurance and bonding, change-order mechanics and unilateral directives, schedule and float ownership, termination, warranty, and dispute resolution.

Return ONLY a JSON object with this exact shape:
{"summary": string, "findings": [{"title": string, "category": string, "severity": "r"|"a"|"g", "detail": string, "recommendation": string}]}
- severity "r" = high exposure / push back; "a" = watch / clarify; "g" = acceptable / standard.
- Order findings by severity (r first).
You provide commercial analysis, NOT legal advice. For genuinely risky or ambiguous clauses, recommend review by a licensed attorney. Do not output anything except the JSON object.`;

export const SAMPLE_CONTRACT = `SUBCONTRACT AGREEMENT (EXCERPT)
Project: Generic Data Center Campus — Low Voltage / Structured Cabling Package

3. PAYMENT. Contractor shall pay Subcontractor within ten (10) days after Contractor's receipt of payment from Owner for Subcontractor's work. Receipt of payment by Contractor from Owner is an express condition precedent to Contractor's obligation to pay Subcontractor (pay-if-paid). Owner/Contractor shall retain ten percent (10%) of each progress payment until final completion and acceptance of the entire Project.

5. CHANGES. Contractor may, by written directive, order changes in the Work. Subcontractor shall proceed with directed changes immediately. Any claim for adjustment in price or time must be submitted in writing within forty-eight (48) hours of the directive or is waived.

7. SCHEDULE / LIQUIDATED DAMAGES. Subcontractor shall achieve the milestones in Contractor's schedule as updated from time to time. Subcontractor shall be liable for liquidated damages of $25,000 per day for any delay to the Project, without limitation or cap, regardless of cause.

9. INDEMNIFICATION. Subcontractor shall defend, indemnify, and hold harmless Contractor and Owner from any and all claims arising out of or relating to the Work, including claims caused in whole or in part by the negligence of Contractor or Owner, to the fullest extent permitted by law.

12. TERMINATION FOR CONVENIENCE. Contractor may terminate this Subcontract for convenience upon twenty-four (24) hours written notice, and Subcontractor's sole remedy shall be payment for work performed to the date of termination, with no overhead or profit on unperformed work.`;

export function cannedAnalysis() {
  return {
    summary:
      "Reviewed a low-voltage subcontract excerpt. Several terms shift significant risk onto the subcontractor: a pay-if-paid clause, an uncapped liquidated-damages exposure, a very short change-claim window, broad indemnification, and a one-sided termination-for-convenience provision. Recommend negotiating the items flagged red before signing and routing the indemnification and pay-if-paid language to a licensed attorney.",
    findings: [
      { title: "Uncapped liquidated damages, regardless of cause", category: "Liquidated damages", severity: "r", detail: "$25,000/day with no cap and applying 'regardless of cause' exposes the sub to delay it did not cause.", recommendation: "Negotiate a per-day cap and an aggregate cap, and limit LDs to delays actually caused by the sub." },
      { title: "Pay-if-paid (condition precedent)", category: "Payment", severity: "r", detail: "Owner non-payment fully transfers to the subcontractor as a condition precedent, not just a timing mechanism.", recommendation: "Push for pay-when-paid (timing only) and a reasonable outside payment date. Have an attorney review enforceability in the project's jurisdiction." },
      { title: "Broad indemnification including others' negligence", category: "Indemnification", severity: "r", detail: "Requires defending/indemnifying for claims caused in part by Contractor/Owner negligence.", recommendation: "Limit to the sub's proportionate fault; attorney review (anti-indemnity statutes vary by state)." },
      { title: "48-hour change-claim window", category: "Change orders", severity: "a", detail: "Claims for price/time waived if not submitted within 48 hours of a directive — operationally tight.", recommendation: "Extend to 7–10 business days and start the clock on impact identification, not the directive." },
      { title: "10% retention until final completion", category: "Retention", severity: "a", detail: "Full 10% held to entire-project completion ties up cash long after the LV scope is done.", recommendation: "Negotiate retention reduction to 5% at 50% complete and early release on scope completion." },
      { title: "Termination for convenience, 24-hour notice, no profit on unperformed work", category: "Termination", severity: "a", detail: "Short notice and no recovery of overhead/profit on the unperformed balance.", recommendation: "Seek longer notice and a termination settlement including demobilization and reasonable margin." },
    ],
  };
}
