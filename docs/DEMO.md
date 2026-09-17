# DukaanOS — Demo Script (3 Minutes)

> This demo is designed to be repeatable and works entirely from seeded data.
> No external API dependencies during the core demo.

---

## SCENE 1: The Problem (30 seconds)

**Narration:**
> "Every local business in India has enormous amounts of business knowledge — but it's scattered across invoices, WhatsApp messages, receipts, spreadsheets, and most importantly, the owner's memory. When a supplier calls about pricing, when a customer asks about their warranty, when you need to compare vendors — you're digging through piles of paper or relying on memory."

**Screen:** Show a stack of sample invoices, receipts, warranty cards.

**Action:** Click "Upload Document" → Select `sharma_electronics_invoice_apr2026.pdf`

**Screen:** Processing indicator appears → "Processing invoice..."

**Result:** "Invoice processed successfully. 4 entities extracted."

---

## SCENE 2: Business Memory — The Hero Experience (45 seconds)

**Narration:**
> "DukaanOS turns those documents into persistent business memory. Watch."

**Action:** Navigate to **Business Memory**

**Action:** Type: `What did Sharma Electronics charge us for Samsung 55-inch TVs?`

**Result appears:**
```
Your latest recorded purchase from Sharma Electronics was 12 Samsung 55-inch TVs
at ₹36,000 per unit on 18 April 2026.

📄 Source: Invoice INV-2026-0418, Page 1
🟢 Confidence: HIGH

Related: The previous purchase was ₹34,800 per unit on 10 March 2026.
```

**Action:** Click the evidence source → Document preview opens with highlighted fields.

**Narration:**
> "Every answer shows exactly where it came from. No hallucinated facts. No made-up citations."

---

## SCENE 3: Supplier Timeline (30 seconds)

**Action:** Navigate to **Suppliers** → Click **Sharma Electronics**

**Screen:** Supplier detail page with:
- Price history timeline showing three data points
- Upward price trend visualization
- Related products and documents

**Narration:**
> "The supplier timeline shows you exactly how prices have changed over time, backed by actual invoice data."

---

## SCENE 4: Proactive Alert (30 seconds)

**Action:** Navigate to **Alerts**

**Screen:** Alert card appears:
```
⚠️ MEDIUM — Supplier Price Increase Detected

Samsung 55-inch TV price from Sharma Electronics increased 8.7%
compared with your previous 3 recorded purchases.

Previous average: ₹34,267/unit
Current: ₹37,250/unit

📄 Evidence: 3 purchase records (INV-2026-0418, INV-2026-0310, INV-2025-1205)

Recommended Action: Review supplier alternatives
```

**Narration:**
> "DukaanOS doesn't just answer questions — it proactively surfaces changes that matter to your business."

---

## SCENE 5: Honest Intelligence (20 seconds)

**Action:** Click "Review supplier alternatives" on the alert

**Screen:** Supplier comparison:
```
Gupta Distributors: ₹34,500/unit (lowest recorded price)
Sharma Electronics: ₹37,250/unit (most recent)

⚠️ Delivery-time data is MISSING for Gupta Distributors.
I cannot determine total supplier performance without delivery history.
```

**Narration:**
> "This is critical. The system explicitly tells you what it doesn't know. It distinguishes facts from inferences from missing data. This honesty is a feature, not a limitation."

---

## SCENE 6: Safe Actions (20 seconds)

**Action:** Click "Draft supplier inquiry" for Gupta Distributors

**Screen:** Draft message appears:
```
Subject: Price Inquiry — Samsung 55-inch TV

Dear Gupta Distributors,

We are inquiring about current pricing for Samsung 55-inch TVs.
Our last recorded purchase was at ₹34,500/unit.
Could you please share your current pricing and delivery terms?

Regards,
Sharma Digital House
```

**Action:** Review → Click **Approve**

**Screen:** "Draft created. Action recorded in audit log."

**Narration:**
> "The AI proposes. The human approves. Nothing is sent without your permission."

---

## SCENE 7: Memory Updated (15 seconds)

**Action:** Navigate back to **Dashboard**

**Screen:** Recent activity shows:
- ✅ Invoice processed
- 🔍 Memory query answered
- ⚠️ Alert generated
- 📝 Supplier inquiry drafted and approved
- 📊 Timeline updated

**Narration:**
> "DukaanOS doesn't replace the owner's experience. It makes the experience searchable, explainable, and persistent. Your business finally remembers."

---

## CLOSING SLIDE

```
DukaanOS
Your business finally remembers.

Built on AWS: Cognito · API Gateway · Lambda · DynamoDB · S3
EventBridge · Step Functions · Textract · Bedrock
```

---

## Demo Preparation Checklist

- [ ] Seed demo data: `npm run seed`
- [ ] Verify login works: demo@sharmadigital.example.com
- [ ] Verify document upload processes successfully
- [ ] Verify memory query returns expected answer
- [ ] Verify supplier timeline shows price history
- [ ] Verify alert is generated
- [ ] Verify draft action flow works
- [ ] Test on both desktop and mobile viewport
- [ ] Clear browser cache before recording
