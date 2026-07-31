import { jsPDF } from "jspdf";

export const generateItineraryPDF = (trip, days, displayDays) => {
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

  // Color Palette
  const darkBlue = [29, 78, 216]; // #1d4ed8 - Primary headings & accent
  const bodyTextDark = [30, 41, 59]; // #1e293b - Dark gray/black for body text
  const mutedText = [100, 116, 139]; // #64748b - Muted labels
  const cardBg = [248, 250, 252]; // #f8fafc
  const borderColor = [226, 232, 240]; // #e2e8f0

  // Helper for page breaks
  const checkPageBreak = (neededHeight) => {
    if (currentY + neededHeight > pageHeight - 22) {
      doc.addPage();
      currentY = 20;
      return true;
    }
    return false;
  };

  // ---------------------------------------------------------
  // Header: Travexa Title & Document Metadata
  // ---------------------------------------------------------
  const drawHeader = () => {
    // Accent Top Line
    doc.setFillColor(...darkBlue);
    doc.rect(0, 0, pageWidth, 5, "F");

    currentY = 18;

    // Document Title: Helvetica Bold, 24pt, Dark Blue
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...darkBlue);
    doc.text("TRAVEXA", margin, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...mutedText);
    doc.text("AI TRAVEL PLANNER", margin, currentY + 6);

    // Sub-header on Right
    const todayStr = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...darkBlue);
    doc.text("AI Travel Itinerary", pageWidth - margin, currentY, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...mutedText);
    doc.text(`Generated: ${todayStr}`, pageWidth - margin, currentY + 6, { align: "right" });

    currentY += 12;

    // Divider Line
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 10;
  };

  drawHeader();

  // ---------------------------------------------------------
  // Trip Information Overview Section
  // ---------------------------------------------------------
  const overviewHeight = 42;
  doc.setFillColor(...cardBg);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, overviewHeight, 3, 3, "FD");

  const colWidth = contentWidth / 3;
  const row1Y = currentY + 9;
  const row2Y = currentY + 26;

  const displayDate =
    trip.startDate && trip.endDate
      ? `${new Date(trip.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${new Date(trip.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
      : trip.startDate || trip.travelDate || "Flexible Dates";

  const displayTravelers =
    trip.numberOfTravelers || trip.travellers || trip.travelers || 1;
  const displayBudget =
    typeof trip.budget === "number"
      ? `₹${new Intl.NumberFormat("en-IN").format(trip.budget)}`
      : trip.budget || "N/A";
  const displayStyle =
    trip.preferences?.travelStyle || trip.travelStyle || "General";

  // Column 1
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("DESTINATION", margin + 6, row1Y);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkBlue);
  doc.text(String(trip.destination || "N/A"), margin + 6, row1Y + 6);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("TRAVEL DATES", margin + 6, row2Y);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...bodyTextDark);
  doc.text(String(displayDate), margin + 6, row2Y + 6);

  // Column 2
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("DURATION", margin + colWidth + 6, row1Y);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...bodyTextDark);
  doc.text(`${displayDays} Days`, margin + colWidth + 6, row1Y + 6);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("TRAVELERS", margin + colWidth + 6, row2Y);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...bodyTextDark);
  doc.text(`${displayTravelers} ${displayTravelers === 1 ? "Person" : "People"}`, margin + colWidth + 6, row2Y + 6);

  // Column 3
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("BUDGET", margin + colWidth * 2 + 6, row1Y);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...bodyTextDark);
  doc.text(String(displayBudget), margin + colWidth * 2 + 6, row1Y + 6);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("TRAVEL STYLE", margin + colWidth * 2 + 6, row2Y);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...bodyTextDark);
  doc.text(String(displayStyle), margin + colWidth * 2 + 6, row2Y + 6);

  currentY += overviewHeight + 14;

  // ---------------------------------------------------------
  // Itinerary Section Title (18pt Bold, Dark Blue)
  // ---------------------------------------------------------
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkBlue);
  doc.text("Detailed Day-by-Day Itinerary", margin, currentY);
  currentY += 12;

  // ---------------------------------------------------------
  // Day-by-Day Itinerary Loop
  // ---------------------------------------------------------
  days.forEach((day, dayIndex) => {
    checkPageBreak(35);

    // Day Header Pill Badge
    doc.setFillColor(...darkBlue);
    doc.roundedRect(margin, currentY, 28, 8, 2, 2, "F");

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(`DAY ${day.day || dayIndex + 1}`, margin + 14, currentY + 5.5, { align: "center" });

    // Section Heading: Helvetica Bold, 18pt, Dark Blue
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkBlue);
    doc.text(String(day.title || `Day ${dayIndex + 1} Plan`), margin + 34, currentY + 6.2);

    currentY += 11;

    // Day Divider Line
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // Activities Loop (Body text: Helvetica Normal, 12pt, Dark Gray/Black)
    const activities = Array.isArray(day.activities)
      ? day.activities
      : typeof day.activities === "string"
      ? [day.activities]
      : [];

    activities.forEach((act) => {
      const cleanAct = String(act).replace(/^[-*•\d.]+\s*/, "").replace(/\*\*/g, "");

      // Body text font setting
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      const lines = doc.splitTextToSize(cleanAct, contentWidth - 12);
      const requiredSpace = lines.length * 6.5 + 4;
      checkPageBreak(requiredSpace);

      // Bullet Point Icon (Dark Blue)
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkBlue);
      doc.text("•", margin + 2, currentY + 4);

      // Activity Lines (12pt Normal, Dark Gray/Black)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(...bodyTextDark);

      lines.forEach((line, lIndex) => {
        if (lIndex > 0) checkPageBreak(6.5);
        doc.text(line, margin + 9, currentY + 4);
        currentY += 6.5; // Increased line spacing for readability
      });

      currentY += 3; // Section spacing between activities
    });

    currentY += 10; // Section spacing between days
  });

  // ---------------------------------------------------------
  // Optional Sections: Travel Tips & Packing Checklist
  // ---------------------------------------------------------
  checkPageBreak(55);

  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 12;

  // Section Heading: 18pt Bold, Dark Blue
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkBlue);
  doc.text("Travel Tips & Packing Checklist", margin, currentY);
  currentY += 10;

  const tipColWidth = (contentWidth - 12) / 2;

  // Left Column: Essential Travel Tips
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkBlue);
  doc.text("Essential Travel Tips", margin, currentY);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...bodyTextDark);
  const tips = [
    "• Carry digital & printed copies of tickets & IDs.",
    "• Save offline maps & local emergency numbers.",
    "• Check weather forecasts prior to daily excursions.",
  ];
  tips.forEach((tip, idx) => {
    doc.text(tip, margin, currentY + 8 + idx * 7);
  });

  // Right Column: Packing Checklist
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkBlue);
  doc.text("Packing Checklist", margin + tipColWidth + 12, currentY);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...bodyTextDark);
  const packing = [
    "• Travel documents, passports & wallet",
    "• Universal charger, power bank & adapters",
    "• Comfortable footwear & suitable attire",
  ];
  packing.forEach((item, idx) => {
    doc.text(item, margin + tipColWidth + 12, currentY + 8 + idx * 7);
  });

  currentY += 34;

  // Notes Section
  checkPageBreak(25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("IMPORTANT NOTES", margin, currentY);
  currentY += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedText);
  doc.text(
    "This itinerary was generated by Travexa AI. Activity times, attraction schedules, and route recommendations are subject to local conditions.",
    margin,
    currentY,
    { maxWidth: contentWidth }
  );

  // ---------------------------------------------------------
  // Page Numbers & Footer on All Pages
  // ---------------------------------------------------------
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...mutedText);

    doc.text("Travexa AI Travel Planner — www.travexa.com", margin, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  // Save PDF Document
  const safeName = (trip.destination || "Trip").replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`Travexa_Itinerary_${safeName}.pdf`);
};
