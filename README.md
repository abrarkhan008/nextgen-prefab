# NextGen Pre Fab — Billing App

A mobile-friendly billing app for **NextGen Pre Fab**. It creates 3 types of PDF documents:

1. **Quotation** — with building/structure specification (pillars, rafters, purlins, cladding) and cost items
2. **DC Bill** (Delivery Challan) — same layout as your DC_TEMPLATE.pdf
3. **Tax Invoice** — same layout as your TAX_INVOICE_TEMPLATE.pdf

Everything is saved on the phone itself (works fully offline). You can Download the PDF or Share it straight to WhatsApp.

---

## PART 1 — Try it on your laptop first (VS Code)

1. Install **Node.js** if you don't have it: https://nodejs.org (choose the LTS version). This gives you the `npm` command.
2. Unzip this project folder and open it in **VS Code** (File → Open Folder).
3. Open the Terminal inside VS Code (Terminal → New Terminal) and run:
   ```
   npm install
   ```
   This downloads all the pieces the app needs. Only needs to be done once.
4. Run:
   ```
   npm run dev
   ```
   It will print a link like `http://localhost:5173`. Ctrl+Click it (or paste in your browser) to see the app.
5. Try creating a Quotation, a DC Bill, and a Tax Invoice. Press "PDF" to download one and check it looks right.

To stop the app, click in the terminal and press `Ctrl + C`.

---

## PART 2 — Where to change things (in simple words)

| What you want to change | Which file to open |
|---|---|
| Company name, address, GST no, bank details, GST % | Open the app itself → **Settings** page (no code needed!). This is saved on the device. |
| The exact wording/layout printed on the **DC Bill PDF** | `src/utils/pdf/dcPdf.js` |
| The exact wording/layout printed on the **Tax Invoice PDF** | `src/utils/pdf/invoicePdf.js` |
| The exact wording/layout printed on the **Quotation PDF** | `src/utils/pdf/quotationPdf.js` |
| What fields you fill in on the Quotation screen | `src/pages/QuotationEditor.jsx` |
| What fields you fill in on the DC Bill screen | `src/pages/DCEditor.jsx` |
| What fields you fill in on the Tax Invoice screen | `src/pages/InvoiceEditor.jsx` |
| Colors / look of the app | `tailwind.config.js` (the `steel` and `safety` colors) |
| The 3 big buttons on the home screen | `src/pages/Home.jsx` |

**Rule of thumb:** the `pdf` files control what prints on paper. The `pages` files (Editor screens) control what boxes you see and fill in on your phone. If you want to add a new box (e.g. "Site Engineer Name"), you add it in the Editor page AND then reference it in the matching pdf file so it actually prints.

You do **not** need Android Studio to test any of this — steps above (`npm run dev`) work entirely in the browser on your laptop, which is faster for making changes.

---

## PART 3 — Turn it into an installable APK (Android Studio)

This is done only once your changes look correct in the browser.

1. Make sure you have **Android Studio** installed and opened at least once (so it finishes its own setup).
2. In the VS Code terminal, inside the project folder, run this **one time only**:
   ```
   npm run cap:add
   ```
   This creates an `android` folder in your project — the native Android project.
3. Every time you make a change to the app and want to update the APK, run:
   ```
   npm run cap:sync
   ```
   This rebuilds the web app and copies it into the Android project.
4. Open the Android project in Android Studio:
   ```
   npm run cap:open
   ```
   (Or manually: Android Studio → Open → select the `android` folder inside your project.)
5. In Android Studio, wait for it to finish "Gradle sync" (bottom status bar), then:
   - To test on your own phone: plug your phone in with USB (enable "USB debugging" in phone's Developer Options), then press the green ▶ Run button in Android Studio.
   - To get an installable **APK file**: go to menu **Build → Build App Bundle(s) / APK(s) → Build APK(s)**. When it finishes, click "locate" in the popup — that's your `app-debug.apk`. Copy that file to your phone and tap it to install (you may need to allow "install from unknown sources" once).

That's it — same app, now as a real Android icon on your home screen, working fully offline.

---

## Notes on features

- **Mic button (🎤)** next to description/notes fields: tap it, speak, and it types what you said. This uses your phone's built-in speech recognition (built into Chrome/Android WebView) — no extra setup needed.
- **Share button**: opens your phone's normal share sheet with the PDF attached — pick WhatsApp there like you would for a photo.
- **Save button**: stores the document on the device so you can find it again later from the Home screen or "View all" (History).
- **Steel weight calculator** (Quotation only): enter Flange Width/Thickness, Web Width/Thickness, Length and Qty for Pillar C1/C2/C3 or Rafter R1–R5, and tap "+ Add computed weight to items" — it calculates the weight in KG using the same formula as your Excel sheet (`Width(mm) x Length(m) x Thickness(mm) x 0.00785`) and adds it as a priced line item automatically.
- **GST**: CGST/SGST % are set once in Settings and apply automatically to Tax Invoices. For Quotations, GST is optional (checkbox).

## If something breaks

- Run `npm install` again if you get "module not found" errors.
- Run `npm run build` to check for errors before syncing to Android — if it prints "built in ..." with no red errors, you're safe to sync.
