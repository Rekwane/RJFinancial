export const UCC_ARTICLE_8_TEMPLATE = `
[Your Name]
[Your Address]
[City, State ZIP]
[Your Email]
[Your Phone]

[Date]

[Credit Bureau Name]
[Credit Bureau Address]
[City, State ZIP]

Re: Dispute of Inaccurate Information - UCC Article 8 Violation

To Whom It May Concern:

This letter serves as formal notice pursuant to the Fair Credit Reporting Act, 15 U.S.C. § 1681, and the Uniform Commercial Code, Article 8, that the following information appearing on my credit report is inaccurate, incomplete, and/or unverifiable:

Account Information:
- Creditor Name: [CREDITOR_NAME]
- Account Number: [ACCOUNT_NUMBER]
- Reported Balance: [REPORTED_BALANCE]

I dispute this information for the following reasons:

1. Under UCC Article 8-102(a)(9) and 8-102(a)(15), the debt in question constitutes a "securities entitlement" and/or "investment property" which has been improperly characterized on my credit report.

2. The reporting entity has failed to comply with UCC Article 8-504 requirements regarding the maintenance of financial assets corresponding to the securities entitlements of its entitlement holders.

3. The purported holder of this debt has failed to provide adequate verification of ownership as required under UCC Article 8-506, which requires securities intermediaries to comply with entitlement orders.

4. The reporting entity has not properly verified the chain of title for this debt as required by UCC Article 8-108, which pertains to the good faith acquisition of financial assets or interests therein.

Under the Fair Credit Reporting Act, you are required to conduct a reasonable investigation and remove any information that cannot be verified. I demand that you:

1. Conduct a reasonable investigation into this matter
2. Forward all relevant information to the information provider/furnisher
3. Provide me with copies of all documentation used to verify this account
4. Remove all information that cannot be verified from my credit report

Please investigate this matter and correct the disputed items within the 30-day period as prescribed by law. Should your investigation confirm the accuracy of the disputed information, I request that you provide me with:

1. Copies of any documents utilized in your investigation
2. The name, address, and telephone number of each person contacted regarding this dispute
3. A description of your investigation and the results thereof

Failure to comply with these requirements constitutes a violation of the FCRA, which entitles me to actual and punitive damages, along with attorney's fees.

Thank you for your prompt attention to this matter.

Sincerely,

[Your Signature]

[Your Printed Name]
`;

export const UCC_ARTICLE_9_TEMPLATE = `
[Your Name]
[Your Address]
[City, State ZIP]
[Your Email]
[Your Phone]

[Date]

[Credit Bureau Name]
[Credit Bureau Address]
[City, State ZIP]

Re: Dispute of Inaccurate Information - UCC Article 9 Violation

To Whom It May Concern:

This letter serves as formal notice pursuant to the Fair Credit Reporting Act, 15 U.S.C. § 1681, and the Uniform Commercial Code, Article 9, that the following information appearing on my credit report is inaccurate, incomplete, and/or unverifiable:

Account Information:
- Creditor Name: [CREDITOR_NAME]
- Account Number: [ACCOUNT_NUMBER]
- Reported Balance: [REPORTED_BALANCE]

I dispute this information for the following reasons:

1. Under UCC Article 9-102(a)(2), the account in question constitutes a "secured transaction" which has been improperly characterized on my credit report.

2. The reporting entity has failed to comply with UCC Article 9-203 requirements regarding the attachment and enforceability of security interests, as there is no evidence of a valid security agreement that creates or provides for a security interest.

3. The purported holder of this debt has failed to perfect their security interest as required under UCC Article 9-308 through 9-316, which renders their claim subordinate or unenforceable.

4. The reporting entity has not properly filed a UCC Financing Statement (UCC-1) as required under UCC Article 9-310 to perfect their security interest in the collateral.

5. The proper procedures for disposition of collateral under UCC Article 9-610 through 9-624 were not followed, invalidating any deficiency claims.

Under the Fair Credit Reporting Act, you are required to conduct a reasonable investigation and remove any information that cannot be verified. I demand that you:

1. Conduct a reasonable investigation into this matter
2. Forward all relevant information to the information provider/furnisher
3. Provide me with copies of all documentation used to verify this account, including the original security agreement and proof of perfection
4. Remove all information that cannot be verified from my credit report

Please investigate this matter and correct the disputed items within the 30-day period as prescribed by law. Should your investigation confirm the accuracy of the disputed information, I request that you provide me with:

1. Copies of any documents utilized in your investigation
2. The name, address, and telephone number of each person contacted regarding this dispute
3. A description of your investigation and the results thereof

Failure to comply with these requirements constitutes a violation of the FCRA, which entitles me to actual and punitive damages, along with attorney's fees.

Thank you for your prompt attention to this matter.

Sincerely,

[Your Signature]

[Your Printed Name]
`;

export const GENERAL_DISPUTE_TEMPLATE = `
[Your Name]
[Your Address]
[City, State ZIP]
[Your Email]
[Your Phone]

[Date]

[Credit Bureau Name]
[Credit Bureau Address]
[City, State ZIP]

Re: Request for Investigation of Inaccurate Credit Information

To Whom It May Concern:

I am writing to dispute the following item(s) on my credit report:

Account Information:
- Creditor Name: [CREDITOR_NAME]
- Account Number: [ACCOUNT_NUMBER]
- Reported Balance: [REPORTED_BALANCE]

This information is inaccurate because:
[REASON]

Under the Fair Credit Reporting Act, you are required to conduct a reasonable investigation into the disputed item(s) and remove any information that cannot be verified. I request that you:

1. Investigate this matter and provide verification of the debt
2. Remove all unverified information from my credit report
3. Send me an updated copy of my credit report showing the corrections

If you find that the disputed information is accurate, please provide me with the relevant documentation used to verify the account, including:
- A copy of any original contract or agreement
- Documentation showing the chain of title for this debt
- Evidence that the debt has been properly reported according to law

Please respond within 30 days as required by the Fair Credit Reporting Act.

Thank you for your assistance in resolving this matter.

Sincerely,

[Your Signature]

[Your Printed Name]
`;

export const getDisputeTemplate = (type: string) => {
  switch (type) {
    case 'UCC Article 8':
      return UCC_ARTICLE_8_TEMPLATE;
    case 'UCC Article 9':
      return UCC_ARTICLE_9_TEMPLATE;
    default:
      return GENERAL_DISPUTE_TEMPLATE;
  }
};

export const creditTips = [
  {
    title: "Understanding UCC Article 8",
    content: "Learn how Article 8 of the Uniform Commercial Code applies to credit disputes involving investment securities.",
    url: "#"
  },
  {
    title: "Tips for Writing Effective Dispute Letters",
    content: "Follow these tips for creating dispute letters that credit bureaus and creditors must address.",
    url: "#"
  },
  {
    title: "Setting Up a Trust: Benefits & Process",
    content: "Discover how establishing a trust can protect your assets and provide financial security.",
    url: "#"
  },
  {
    title: "How UCC Article 9 Can Help with Secured Debts",
    content: "Explore how Article 9 of the Uniform Commercial Code governs secured transactions and how it applies to your credit disputes.",
    url: "#"
  },
  {
    title: "Credit Score Improvement Strategies",
    content: "Implement these proven strategies to improve your credit score over time.",
    url: "#"
  }
];
