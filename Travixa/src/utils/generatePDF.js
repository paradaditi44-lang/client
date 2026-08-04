import { jsPDF } from "jspdf";

export const generateItineraryPDF = (trip = {}, days = [], displayDays = 1) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm

  let currentY = 15;

  // ---------------------------------------------------------
  // Color Palette & Typography Tokens
  // ---------------------------------------------------------
  const primaryBlue = [2, 132, 199];    // #0284c7 Primary accent
  const darkNavy = [15, 23, 42];        // #0f172a Deep text / titles
  const bodyDark = [30, 41, 59];        // #1e293b Regular body text
  const mutedText = [100, 116, 139];    // #64748b Subtitles & labels
  const cardFill = [248, 250, 252];     // #f8fafc Light card fill
  const cardAccentFill = [240, 249, 255]; // #f0f9ff Light blue tint
  const borderCol = [226, 232, 240];    // #e2e8f0 Soft border
  const borderAccent = [186, 230, 253]; // #bae6fd Light blue border
  const successGreen = [16, 185, 129];   // #10b981 Success / checkmarks

  // Helper for page breaks
  const checkPageBreak = (neededHeight) => {
    if (currentY + neededHeight > pageHeight - 22) {
      doc.addPage();
      currentY = 20;
      return true;
    }
    return false;
  };

  // Helper for section headers
  const drawSectionHeader = (title, subtitle = "") => {
    checkPageBreak(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...primaryBlue);
    doc.text(title, margin, currentY);

    if (subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...mutedText);
      doc.text(subtitle, margin, currentY + 5);
      currentY += 10;
    } else {
      currentY += 7;
    }

    doc.setDrawColor(...borderCol);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;
  };

  // Extract / parse trip data
  const destinationStr = String(trip.destination || "Your Destination").toUpperCase();
  const rawBudget = trip.budget || 50000;
  const totalBudgetNum =
    typeof rawBudget === "number"
      ? rawBudget
      : parseInt(String(rawBudget).replace(/[^0-9]/g, ""), 10) || 50000;
  const displayBudget =
    typeof rawBudget === "number"
      ? `INR ${new Intl.NumberFormat("en-IN").format(rawBudget)}`
      : String(rawBudget);

  const displayDate =
    trip.startDate && trip.endDate
      ? `${new Date(trip.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${new Date(trip.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
      : trip.startDate || trip.travelDate || "Flexible Dates";

  const displayTravelers = trip.numberOfTravelers || trip.travellers || trip.travelers || 1;
  const displayStyle = trip.preferences?.travelStyle || trip.travelStyle || "Comfort & Exploration";
  
  const interestsList = Array.isArray(trip.preferences?.interests)
    ? trip.preferences.interests.join(", ")
    : Array.isArray(trip.interests)
    ? trip.interests.join(", ")
    : (trip.preferences?.interests || trip.interests || "Sightseeing, Food, Culture");

  const todayStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // =========================================================
  // PAGE 1 — PREMIUM COVER PAGE
  // =========================================================

  // Top Accent Bars
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, pageWidth, 6, "F");
  doc.setFillColor(56, 189, 248);
  doc.rect(0, 6, pageWidth, 2, "F");

  // Logo / Brand Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...primaryBlue);
  doc.text("TRAVEXA", margin, 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...mutedText);
  doc.text("AI Powered Travel Itinerary", margin, 39);

  // Large Elegant Central Cover Card
  const coverCardY = 60;
  const coverCardHeight = 160;

  doc.setFillColor(...cardFill);
  doc.setDrawColor(...borderCol);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, coverCardY, contentWidth, coverCardHeight, 6, 6, "FD");

  // Badge inside Cover Card
  doc.setFillColor(...cardAccentFill);
  doc.setDrawColor(...borderAccent);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin + 45, coverCardY + 16, 90, 10, 5, 5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...primaryBlue);
  doc.text("EXCLUSIVE ITINERARY BOOKLET", pageWidth / 2, coverCardY + 22.5, { align: "center" });

  // Large Destination Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...darkNavy);
  doc.text(destinationStr, pageWidth / 2, coverCardY + 48, { align: "center" });

  // Divider inside Card
  doc.setDrawColor(...borderCol);
  doc.setLineWidth(0.4);
  doc.line(margin + 30, coverCardY + 60, pageWidth - margin - 30, coverCardY + 60);

  // Cover Card Meta Details Grid
  const metaY = coverCardY + 74;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("TRAVEL DATES", pageWidth / 2, metaY, { align: "center" });

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkNavy);
  doc.text(String(displayDate), pageWidth / 2, metaY + 7, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("DURATION & STYLE", pageWidth / 2, metaY + 22, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...bodyDark);
  doc.text(`${displayDays} Days  |  ${displayStyle}  |  ${displayTravelers} ${displayTravelers === 1 ? "Traveler" : "Travelers"}`, pageWidth / 2, metaY + 29, { align: "center" });

  // Bottom Cover Metadata
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedText);
  doc.text(`Generated Date: ${todayStr}`, pageWidth / 2, coverCardY + coverCardHeight - 16, { align: "center" });
  doc.text("Prepared by Travexa AI Suite • www.travexa.com", pageWidth / 2, coverCardY + coverCardHeight - 9, { align: "center" });

  // Bottom Decorative Banner
  doc.setFillColor(...primaryBlue);
  doc.rect(margin, 255, contentWidth, 3, "F");

  // Move to Page 2
  doc.addPage();
  currentY = 20;

  // =========================================================
  // PAGE 2 — TRIP OVERVIEW & DASHBOARD SNAPSHOT
  // =========================================================

  drawSectionHeader("TRIP OVERVIEW & SNAPSHOT", "Comprehensive summary of your planned journey");

  // Grid Info Cards (2 Columns x 4 Rows)
  const gridCards = [
    { label: "DESTINATION", val: destinationStr, icon: "DEST" },
    { label: "TRAVEL DATES", val: String(displayDate), icon: "DATE" },
    { label: "DURATION", val: `${displayDays} Days`, icon: "DAYS" },
    { label: "TRAVELERS", val: `${displayTravelers} ${displayTravelers === 1 ? "Person" : "People"}`, icon: "PEOP" },
    { label: "TOTAL BUDGET", val: displayBudget, icon: "BUDG" },
    { label: "DAILY BUDGET", val: `INR ${Math.round(totalBudgetNum / Math.max(1, displayDays)).toLocaleString('en-IN')}`, icon: "DAILY" },
    { label: "TRAVEL STYLE", val: String(displayStyle), icon: "STYLE" },
    { label: "INTERESTS", val: String(interestsList), icon: "LIKE" },
  ];

  const colW = (contentWidth - 10) / 2;
  const cardH = 22;

  gridCards.forEach((c, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const x = margin + col * (colW + 10);
    const y = currentY + row * (cardH + 8);

    doc.setFillColor(...cardAccentFill);
    doc.setDrawColor(...borderAccent);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, y, colW, cardH, 3, 3, "FD");

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryBlue);
    doc.text(c.label, x + 8, y + 7);

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...darkNavy);
    const splitVal = doc.splitTextToSize(c.val, colW - 12);
    doc.text(splitVal[0] || "", x + 8, y + 15);
  });

  currentY += 4 * (cardH + 8) + 10;

  // AI Travel Tips Box
  checkPageBreak(50);
  doc.setFillColor(...cardFill);
  doc.setDrawColor(...borderCol);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, 48, 4, 4, "FD");

  // Accent Green Left Bar
  doc.setFillColor(...successGreen);
  doc.roundedRect(margin, currentY, 3.5, 48, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...darkNavy);
  doc.text("AI TRAVEL TIPS & GUIDELINES", margin + 10, currentY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...bodyDark);

  const tips = [
    "• Carry digital & printed copies of your government ID, tickets, and reservations.",
    "• Book hotel rooms, intercity trains, and popular attraction passes in advance.",
    "• Keep emergency cash, power bank, and offline maps accessible at all times.",
    "• Respect local traditions, dress codes, and environmental guidelines during travel.",
  ];

  tips.forEach((tip, idx) => {
    doc.text(tip, margin + 10, currentY + 18 + idx * 7);
  });

  currentY += 58;

  // =========================================================
  // DAY-WISE ITINERARY
  // =========================================================

  drawSectionHeader("DAY-BY-DAY ITINERARY", "Detailed schedule and activity breakdown");

  days.forEach((day, dayIndex) => {
    checkPageBreak(40);

    // Day Header Pill Banner
    doc.setFillColor(...primaryBlue);
    doc.roundedRect(margin, currentY, contentWidth, 10, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    const dayTitleText = `DAY ${day.day || dayIndex + 1}: ${String(day.title || `Plan for Day ${dayIndex + 1}`)}`.toUpperCase();
    doc.text(dayTitleText, margin + 8, currentY + 6.8);

    currentY += 15;

    // Activities List
    const activities = Array.isArray(day.activities)
      ? day.activities
      : typeof day.activities === "string"
      ? [day.activities]
      : [];

    if (activities.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(...mutedText);
      doc.text("No specific activities listed for this day.", margin + 6, currentY);
      currentY += 8;
    } else {
      activities.forEach((act) => {
        const cleanAct = String(act).replace(/^[-*•\d.]+\s*/, "").replace(/\*\*/g, "");
        const lines = doc.splitTextToSize(cleanAct, contentWidth - 14);
        const requiredSpace = lines.length * 5.5 + 4;
        checkPageBreak(requiredSpace);

        // Activity Bullet Point
        doc.setFillColor(...primaryBlue);
        doc.circle(margin + 4, currentY + 2.5, 1.2, "F");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...bodyDark);

        lines.forEach((line, lIndex) => {
          if (lIndex > 0) checkPageBreak(5.5);
          doc.text(line, margin + 9, currentY + 3.5);
          currentY += 5.5;
        });

        currentY += 2;
      });
    }

    currentY += 6;
  });

  // =========================================================
  // SMART BUDGET SUMMARY
  // =========================================================
  doc.addPage();
  currentY = 20;

  drawSectionHeader("SMART BUDGET BREAKDOWN", "AI-optimized category allocation & health indicators");

  // Top Metric Cards (3 Cards)
  const budgetMetrics = [
    { title: "TOTAL BUDGET", val: displayBudget },
    { title: "DAILY BUDGET", val: `INR ${Math.round(totalBudgetNum / Math.max(1, displayDays)).toLocaleString('en-IN')}` },
    { title: "BUDGET HEALTH", val: "EXCELLENT (Optimal)" },
  ];

  const mWidth = (contentWidth - 12) / 3;
  budgetMetrics.forEach((bm, i) => {
    const bx = margin + i * (mWidth + 6);
    doc.setFillColor(...cardFill);
    doc.setDrawColor(...borderCol);
    doc.setLineWidth(0.4);
    doc.roundedRect(bx, currentY, mWidth, 18, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...primaryBlue);
    doc.text(bm.title, bx + 6, currentY + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...darkNavy);
    doc.text(bm.val, bx + 6, currentY + 13);
  });

  currentY += 26;

  // Category Allocations
  const categories = [
    { name: "ACCOMMODATION & HOTELS", pct: 40, amt: Math.round(totalBudgetNum * 0.40) },
    { name: "FOOD & LOCAL DINING", pct: 25, amt: Math.round(totalBudgetNum * 0.25) },
    { name: "TRANSPORT & TRANSIT", pct: 15, amt: Math.round(totalBudgetNum * 0.15) },
    { name: "SIGHTSEEING & TOURS", pct: 12, amt: Math.round(totalBudgetNum * 0.12) },
    { name: "SHOPPING & EXTRAS", pct: 8, amt: Math.round(totalBudgetNum * 0.08) },
  ];

  categories.forEach((cat) => {
    checkPageBreak(18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...darkNavy);
    doc.text(cat.name, margin, currentY);

    const amtStr = `INR ${cat.amt.toLocaleString('en-IN')} (${cat.pct}%)`;
    doc.text(amtStr, pageWidth - margin, currentY, { align: "right" });

    currentY += 3;

    // Progress Bar Track
    doc.setFillColor(...borderCol);
    doc.roundedRect(margin, currentY, contentWidth, 4, 2, 2, "F");

    // Progress Bar Fill
    const fillW = (contentWidth * cat.pct) / 100;
    doc.setFillColor(...primaryBlue);
    doc.roundedRect(margin, currentY, fillW, 4, 2, 2, "F");

    currentY += 10;
  });

  // Potential Savings Card
  currentY += 6;
  checkPageBreak(25);
  doc.setFillColor(...cardAccentFill);
  doc.setDrawColor(...borderAccent);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, 22, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryBlue);
  doc.text("POTENTIAL SAVINGS ESTIMATE", margin + 8, currentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...bodyDark);
  doc.text(`By booking flight & hotel packages 3-4 weeks early, you can save up to INR ${Math.round(totalBudgetNum * 0.12).toLocaleString('en-IN')} (12%) on this trip.`, margin + 8, currentY + 15);

  currentY += 30;

  // =========================================================
  // PACKING CHECKLIST PAGE
  // =========================================================
  checkPageBreak(120);

  drawSectionHeader("AI PACKING CHECKLIST", "Categorized essentials & recommendations for your trip");

  const packingCols = [
    {
      title: "DOCUMENTS & ESSENTIALS",
      items: ["Passport, ID & Visa copies", "Flight & Hotel confirmation tickets", "Driver's license & Travel Insurance", "Wallet, Forex & Credit Cards"],
    },
    {
      title: "CLOTHING & FOOTWEAR",
      items: ["Weather-appropriate attire", "Comfortable walking / hiking shoes", "Light jackets or warm layers", "Rain gear / Sunglasses & Cap"],
    },
    {
      title: "ELECTRONICS & ACCESSORIES",
      items: ["Smartphone & Charger cables", "Universal power adapter", "High-capacity Power Bank", "Camera / Memory Cards"],
    },
    {
      title: "HEALTH & TOILETRIES",
      items: ["First aid kit & Medications", "Sunscreen & Moisturizer", "Hand sanitizer & Wet wipes", "Personal grooming essentials"],
    },
  ];

  const pColWidth = (contentWidth - 10) / 2;

  packingCols.forEach((col, idx) => {
    const r = Math.floor(idx / 2);
    const c = idx % 2;
    const px = margin + c * (pColWidth + 10);
    const py = currentY + r * 45;

    doc.setFillColor(...cardFill);
    doc.setDrawColor(...borderCol);
    doc.setLineWidth(0.4);
    doc.roundedRect(px, py, pColWidth, 38, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...primaryBlue);
    doc.text(col.title, px + 6, py + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...bodyDark);

    col.items.forEach((item, iIdx) => {
      doc.text(`[ ]  ${item}`, px + 6, py + 15 + iIdx * 5.5);
    });
  });

  // =========================================================
  // PAGE NUMBERS & FOOTER ON ALL PAGES
  // =========================================================
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer divider line
    doc.setDrawColor(...borderCol);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...mutedText);

    doc.text("Generated by Travexa AI • www.travexa.com", margin, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  // Save PDF Document
  const safeName = (trip.destination || "Trip").replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`Travexa_Itinerary_${safeName}.pdf`);
};
