import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const ORG_ID = "org_demo";

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("🌱 Starting seed...");

  // ─── Cert Bodies ──────────────────────────────────────────────────────────
  console.log("Creating cert bodies...");
  const [ouBody, kofkBody, badatzBody] = await Promise.all([
    prisma.certBody.upsert({
      where: { id: "cb_ou" },
      update: {},
      create: { id: "cb_ou", organizationId: ORG_ID, name: "OU", nameEn: "Orthodox Union", country: "US", isActive: true },
    }),
    prisma.certBody.upsert({
      where: { id: "cb_kofk" },
      update: {},
      create: { id: "cb_kofk", organizationId: ORG_ID, name: "KOF-K", nameEn: "Kof-K Kosher", country: "US", isActive: true },
    }),
    prisma.certBody.upsert({
      where: { id: "cb_badatz" },
      update: {},
      create: { id: "cb_badatz", organizationId: ORG_ID, name: 'בד"צ עדה חרדית', nameEn: "Badatz Edah Chareidis", country: "IL", isActive: true },
    }),
  ]);

  // ─── Supervision Levels ───────────────────────────────────────────────────
  console.log("Creating supervision levels...");
  await Promise.all([
    prisma.supervisionLevel.upsert({
      where: { id: "sl_factory" },
      update: {},
      create: { id: "sl_factory", organizationId: ORG_ID, name: "ייצור מפעל", nameEn: "Factory Production", color: "#3B82F6" },
    }),
    prisma.supervisionLevel.upsert({
      where: { id: "sl_lab" },
      update: {},
      create: { id: "sl_lab", organizationId: ORG_ID, name: "בדיקת מעבדה", nameEn: "Lab Testing", color: "#8B5CF6" },
    }),
    prisma.supervisionLevel.upsert({
      where: { id: "sl_wine" },
      update: {},
      create: { id: "sl_wine", organizationId: ORG_ID, name: "יין ואלכוהול", nameEn: "Wine & Alcohol", color: "#EF4444" },
    }),
  ]);

  // ─── Dealers (Kashrut Agents) ─────────────────────────────────────────────
  console.log("Creating dealers...");
  const [dealerEurope, dealerAmerica] = await Promise.all([
    prisma.dealer.upsert({
      where: { id: "dl_europe" },
      update: {},
      create: {
        id: "dl_europe",
        organizationId: ORG_ID,
        name: "Euro Kosher Ltd.",
        contactName: "יעקב שטרן",
        phone: "+32-2-5551234",
        email: "stern@eurokosher.eu",
        notes: "סוכן אירופה — בלגיה, צרפת, הולנד",
        isActive: true,
      },
    }),
    prisma.dealer.upsert({
      where: { id: "dl_america" },
      update: {},
      create: {
        id: "dl_america",
        organizationId: ORG_ID,
        name: "American Kosher Agency",
        contactName: "אברהם ברג",
        phone: "+1-212-5559876",
        email: "berg@americankosher.com",
        notes: "סוכן אמריקה הצפונית ואמריקה הלטינית",
        isActive: true,
      },
    }),
  ]);

  // ─── Clients ──────────────────────────────────────────────────────────────
  console.log("Creating clients...");
  const [clientCohen, clientIsraeliFood, clientGourmet, clientChocolate] = await Promise.all([
    prisma.client.upsert({
      where: { id: "cl_cohen" },
      update: { defaultDealerId: dealerAmerica.id },
      create: {
        id: "cl_cohen",
        organizationId: ORG_ID,
        name: 'יבוא אחים כהן בע"מ',
        nameEn: "Cohen Brothers Import Ltd.",
        type: "IMPORTER",
        contactName: "משה כהן",
        email: "moshe@cohen-import.co.il",
        phone: "03-5551234",
        address: "רחוב הברזל 12, תל אביב",
        certRelease: "AFTER_PAYMENT",
        requiresQuote: false,
        defaultDealerId: dealerAmerica.id,
      },
    }),
    prisma.client.upsert({
      where: { id: "cl_ifood" },
      update: { defaultDealerId: dealerEurope.id },
      create: {
        id: "cl_ifood",
        organizationId: ORG_ID,
        name: 'ישראל פוד אימפורט בע"מ',
        nameEn: "Israeli Food Import Ltd.",
        type: "IMPORTER",
        contactName: "רחל לוי",
        email: "rachel@israelifood.co.il",
        phone: "02-6664321",
        address: "רחוב יפו 55, ירושלים",
        certRelease: "IMMEDIATE",
        requiresQuote: true,
        defaultDealerId: dealerEurope.id,
      },
    }),
    prisma.client.upsert({
      where: { id: "cl_gourmet" },
      update: {},
      create: {
        id: "cl_gourmet",
        organizationId: ORG_ID,
        name: "מסעדת הגורמה",
        type: "BUSINESS",
        contactName: "אברהם שפיר",
        email: "info@gourmet-rest.co.il",
        phone: "04-8887654",
        address: "שדרות הנשיא 3, חיפה",
        certRelease: "IMMEDIATE",
        requiresQuote: false,
      },
    }),
    prisma.client.upsert({
      where: { id: "cl_choco" },
      update: { defaultDealerId: dealerEurope.id },
      create: {
        id: "cl_choco",
        organizationId: ORG_ID,
        name: "שוקולד ד'לוקס יבוא ושיווק",
        nameEn: "Deluxe Chocolate Import & Marketing",
        type: "BOTH",
        contactName: "שרה גולד",
        email: "sarah@deluxe-choco.co.il",
        phone: "09-9998765",
        address: "רחוב הצורן 7, נתניה",
        certRelease: "AFTER_PAYMENT",
        requiresQuote: false,
        defaultDealerId: dealerEurope.id,
      },
    }),
  ]);

  // ─── Additional Clients ───────────────────────────────────────────────────
  console.log("Creating additional clients...");
  const [clientWine, clientBiscuit, clientHotel, clientSpice] = await Promise.all([
    prisma.client.upsert({
      where: { id: "cl_wine" },
      update: { defaultDealerId: dealerEurope.id },
      create: {
        id: "cl_wine",
        organizationId: ORG_ID,
        name: 'פרמיום יין ואלכוהול בע"מ',
        nameEn: "Premium Wine & Spirits Import Ltd.",
        type: "IMPORTER",
        contactName: "דוד כרמי",
        email: "david@premiumwine.co.il",
        phone: "03-7776543",
        address: "רחוב הכרם 18, ראשון לציון",
        certRelease: "AFTER_PAYMENT",
        requiresQuote: true,
        defaultDealerId: dealerEurope.id,
      },
    }),
    prisma.client.upsert({
      where: { id: "cl_biscuit" },
      update: { defaultDealerId: dealerAmerica.id },
      create: {
        id: "cl_biscuit",
        organizationId: ORG_ID,
        name: 'גולדן ביסקוויט יבוא בע"מ',
        nameEn: "Golden Biscuit Import Ltd.",
        type: "IMPORTER",
        contactName: "יעל זהבי",
        email: "yael@goldenbiscuit.co.il",
        phone: "08-9994567",
        address: "שדרות בן גוריון 45, אשדוד",
        certRelease: "IMMEDIATE",
        requiresQuote: false,
        defaultDealerId: dealerAmerica.id,
      },
    }),
    prisma.client.upsert({
      where: { id: "cl_hotel" },
      update: {},
      create: {
        id: "cl_hotel",
        organizationId: ORG_ID,
        name: 'מלון הנסיך — ירושלים',
        nameEn: "Prince Hotel Jerusalem",
        type: "BUSINESS",
        contactName: "נחמן ברגר",
        email: "nachman@princehotel.co.il",
        phone: "02-5001234",
        address: "רחוב המלך דוד 7, ירושלים",
        certRelease: "IMMEDIATE",
        requiresQuote: false,
      },
    }),
    prisma.client.upsert({
      where: { id: "cl_spice" },
      update: { defaultDealerId: dealerAmerica.id },
      create: {
        id: "cl_spice",
        organizationId: ORG_ID,
        name: 'תבלינים ד׳עולם יבוא בע"מ',
        nameEn: "World Spices Import Ltd.",
        type: "IMPORTER",
        contactName: "מרים עזרא",
        email: "miriam@worldspices.co.il",
        phone: "04-6662222",
        address: "רחוב העלייה 33, חיפה",
        certRelease: "AFTER_PAYMENT",
        requiresQuote: true,
        defaultDealerId: dealerAmerica.id,
      },
    }),
  ]);

  // ─── Sites ────────────────────────────────────────────────────────────────
  console.log("Creating sites...");
  const [siteBelgium, siteArgentina, siteFrance, siteRestaurant, siteUSA] = await Promise.all([
    prisma.site.upsert({
      where: { id: "st_belgium" },
      update: {},
      create: {
        id: "st_belgium",
        organizationId: ORG_ID,
        clientId: clientChocolate.id,
        name: "Choco Deluxe NV",
        type: "FACTORY",
        address: "Rue du Chocolat 14, Brussels",
        country: "BE",
        timezone: "Europe/Brussels",
        latitude: 50.8503,
        longitude: 4.3517,
        internalReport: true,
        rabbinateReport: true,
      },
    }),
    prisma.site.upsert({
      where: { id: "st_argentina" },
      update: {},
      create: {
        id: "st_argentina",
        organizationId: ORG_ID,
        clientId: clientCohen.id,
        name: "Carne Premium SA",
        type: "FACTORY",
        address: "Av. Libertador 2500, Buenos Aires",
        country: "AR",
        timezone: "America/Argentina/Buenos_Aires",
        latitude: -34.6037,
        longitude: -58.3816,
        internalReport: false,
        rabbinateReport: true,
      },
    }),
    prisma.site.upsert({
      where: { id: "st_france" },
      update: {},
      create: {
        id: "st_france",
        organizationId: ORG_ID,
        clientId: clientIsraeliFood.id,
        name: "Fromagerie Dupont",
        type: "FACTORY",
        address: "12 Rue du Fromage, Lyon",
        country: "FR",
        timezone: "Europe/Paris",
        latitude: 45.748,
        longitude: 4.8467,
        internalReport: true,
        rabbinateReport: false,
      },
    }),
    prisma.site.upsert({
      where: { id: "st_restaurant" },
      update: {},
      create: {
        id: "st_restaurant",
        organizationId: ORG_ID,
        clientId: clientGourmet.id,
        name: "מסעדת הגורמה — חיפה",
        type: "RESTAURANT",
        address: "שדרות הנשיא 3, חיפה",
        country: "IL",
        timezone: "Asia/Jerusalem",
        latitude: 32.794,
        longitude: 34.9896,
        internalReport: true,
        rabbinateReport: true,
      },
    }),
    prisma.site.upsert({
      where: { id: "st_usa" },
      update: {},
      create: {
        id: "st_usa",
        organizationId: ORG_ID,
        clientId: clientCohen.id,
        name: "Cohen Meat USA LLC",
        type: "WAREHOUSE",
        address: "500 Industry Blvd, Chicago IL",
        country: "US",
        timezone: "America/Chicago",
        latitude: 41.8781,
        longitude: -87.6298,
        internalReport: true,
        rabbinateReport: false,
      },
    }),
  ]);

  // ─── Products ─────────────────────────────────────────────────────────────
  console.log("Creating products...");
  await Promise.all([
    prisma.product.upsert({
      where: { id: "pr_milk_choco" },
      update: {},
      create: {
        id: "pr_milk_choco",
        organizationId: ORG_ID,
        clientId: clientChocolate.id,
        siteId: siteBelgium.id,
        name: "שוקולד חלב פרמיום",
        nameEn: "Premium Milk Chocolate",
        category: "שוקולד",
      },
    }),
    prisma.product.upsert({
      where: { id: "pr_dark_choco" },
      update: {},
      create: {
        id: "pr_dark_choco",
        organizationId: ORG_ID,
        clientId: clientChocolate.id,
        siteId: siteBelgium.id,
        name: "שוקולד מריר 70%",
        nameEn: "Dark Chocolate 70%",
        category: "שוקולד",
      },
    }),
    prisma.product.upsert({
      where: { id: "pr_beef" },
      update: {},
      create: {
        id: "pr_beef",
        organizationId: ORG_ID,
        clientId: clientCohen.id,
        siteId: siteArgentina.id,
        name: "בשר בקר קפוא — פילה",
        nameEn: "Frozen Beef Fillet",
        category: "בשר",
      },
    }),
    prisma.product.upsert({
      where: { id: "pr_ground_beef" },
      update: {},
      create: {
        id: "pr_ground_beef",
        organizationId: ORG_ID,
        clientId: clientCohen.id,
        siteId: siteArgentina.id,
        name: "בשר טחון קפוא",
        nameEn: "Frozen Ground Beef",
        category: "בשר",
      },
    }),
    prisma.product.upsert({
      where: { id: "pr_cheese" },
      update: {},
      create: {
        id: "pr_cheese",
        organizationId: ORG_ID,
        clientId: clientIsraeliFood.id,
        siteId: siteFrance.id,
        name: "גבינה צהובה צרפתית",
        nameEn: "French Yellow Cheese",
        category: "מוצרי חלב",
      },
    }),
    prisma.product.upsert({
      where: { id: "pr_brie" },
      update: {},
      create: {
        id: "pr_brie",
        organizationId: ORG_ID,
        clientId: clientIsraeliFood.id,
        siteId: siteFrance.id,
        name: "גבינת ברי",
        nameEn: "Brie Cheese",
        category: "מוצרי חלב",
      },
    }),
  ]);

  // ─── Additional Sites ─────────────────────────────────────────────────────
  console.log("Creating additional sites...");
  await Promise.all([
    prisma.site.upsert({
      where: { id: "st_italy_wine" },
      update: {},
      create: {
        id: "st_italy_wine", organizationId: ORG_ID, clientId: clientWine.id,
        name: "Cantina Rossi SRL", type: "FACTORY",
        address: "Via del Vino 22, Verona", country: "IT",
        timezone: "Europe/Rome", latitude: 45.4384, longitude: 10.9916,
        internalReport: true, rabbinateReport: true,
      },
    }),
    prisma.site.upsert({
      where: { id: "st_uk_biscuit" },
      update: {},
      create: {
        id: "st_uk_biscuit", organizationId: ORG_ID, clientId: clientBiscuit.id,
        name: "Golden Bake Factory Ltd.", type: "FACTORY",
        address: "Baker Street 100, Manchester", country: "GB",
        timezone: "Europe/London", latitude: 53.4808, longitude: -2.2426,
        internalReport: true, rabbinateReport: false,
      },
    }),
    prisma.site.upsert({
      where: { id: "st_hotel_jlm" },
      update: {},
      create: {
        id: "st_hotel_jlm", organizationId: ORG_ID, clientId: clientHotel.id,
        name: "מלון הנסיך — מטבח ראשי", type: "RESTAURANT",
        address: "רחוב המלך דוד 7, ירושלים", country: "IL",
        timezone: "Asia/Jerusalem", latitude: 31.7767, longitude: 35.2285,
        internalReport: true, rabbinateReport: true,
      },
    }),
    prisma.site.upsert({
      where: { id: "st_india_spice" },
      update: {},
      create: {
        id: "st_india_spice", organizationId: ORG_ID, clientId: clientSpice.id,
        name: "Spice World Pvt. Ltd.", type: "FACTORY",
        address: "Industrial Area, Kochi, Kerala", country: "IN",
        timezone: "Asia/Kolkata", latitude: 9.9312, longitude: 76.2673,
        internalReport: false, rabbinateReport: true,
      },
    }),
  ]);

  // ─── Additional Products ───────────────────────────────────────────────────
  console.log("Creating additional products...");
  await Promise.all([
    prisma.product.upsert({
      where: { id: "pr_red_wine" },
      update: {},
      create: { id: "pr_red_wine", organizationId: ORG_ID, clientId: clientWine.id, siteId: "st_italy_wine", name: "יין אדום פרמיום — קיאנטי", nameEn: "Chianti Premium Red Wine", category: "יין" },
    }),
    prisma.product.upsert({
      where: { id: "pr_white_wine" },
      update: {},
      create: { id: "pr_white_wine", organizationId: ORG_ID, clientId: clientWine.id, siteId: "st_italy_wine", name: "יין לבן — פינו גריג׳יו", nameEn: "Pinot Grigio White Wine", category: "יין" },
    }),
    prisma.product.upsert({
      where: { id: "pr_biscuit_choco" },
      update: {},
      create: { id: "pr_biscuit_choco", organizationId: ORG_ID, clientId: clientBiscuit.id, siteId: "st_uk_biscuit", name: "ביסקוויט שוקולד", nameEn: "Chocolate Biscuit", category: "מאפים" },
    }),
    prisma.product.upsert({
      where: { id: "pr_biscuit_vanilla" },
      update: {},
      create: { id: "pr_biscuit_vanilla", organizationId: ORG_ID, clientId: clientBiscuit.id, siteId: "st_uk_biscuit", name: "ביסקוויט וניל קרם", nameEn: "Vanilla Cream Biscuit", category: "מאפים" },
    }),
    prisma.product.upsert({
      where: { id: "pr_hotel_catering" },
      update: {},
      create: { id: "pr_hotel_catering", organizationId: ORG_ID, clientId: clientHotel.id, siteId: "st_hotel_jlm", name: "קייטרינג אירועים", nameEn: "Event Catering", category: "מסעדנות" },
    }),
    prisma.product.upsert({
      where: { id: "pr_spice_mix" },
      update: {},
      create: { id: "pr_spice_mix", organizationId: ORG_ID, clientId: clientSpice.id, siteId: "st_india_spice", name: "תערובת תבלינים מזרחית", nameEn: "Eastern Spice Mix", category: "תבלינים" },
    }),
    prisma.product.upsert({
      where: { id: "pr_turmeric" },
      update: {},
      create: { id: "pr_turmeric", organizationId: ORG_ID, clientId: clientSpice.id, siteId: "st_india_spice", name: "כורכום טחון", nameEn: "Ground Turmeric", category: "תבלינים" },
    }),
  ]);

  // ─── Raw Materials ────────────────────────────────────────────────────────
  console.log("Creating raw materials...");
  await Promise.all([
    // Milk Chocolate — Belgium
    prisma.rawMaterial.upsert({
      where: { id: "rm_cocoa" },
      update: { kosherType: "PAREVE" },
      create: { id: "rm_cocoa", productId: "pr_milk_choco", name: "קקאו גולמי", supplier: "Barry Callebaut", country: "CI", status: "APPROVED", kosherType: "PAREVE", expiresAt: daysFromNow(120), notes: "תעודת כשרות OU" },
    }),
    prisma.rawMaterial.upsert({
      where: { id: "rm_milk_powder" },
      update: { kosherType: "DAIRY", certificateIssuedBy: "Fonterra Kosher" },
      create: { id: "rm_milk_powder", productId: "pr_milk_choco", name: "אבקת חלב", supplier: "Fonterra", country: "NZ", status: "APPROVED", kosherType: "DAIRY", certificateIssuedBy: "Fonterra Kosher", expiresAt: daysFromNow(45) },
    }),
    prisma.rawMaterial.upsert({
      where: { id: "rm_lecithin" },
      update: { kosherType: "PAREVE" },
      create: { id: "rm_lecithin", productId: "pr_milk_choco", name: "לציטין סויה", supplier: "ADM", country: "US", status: "IN_REVIEW", kosherType: "PAREVE" },
    }),
    // Dark Chocolate — Belgium
    prisma.rawMaterial.upsert({
      where: { id: "rm_cocoa_dark" },
      update: { kosherType: "PAREVE" },
      create: { id: "rm_cocoa_dark", productId: "pr_dark_choco", name: "קקאו 70% גולמי", supplier: "Cargill", country: "CI", status: "APPROVED", kosherType: "PAREVE", expiresAt: daysFromNow(200) },
    }),
    prisma.rawMaterial.upsert({
      where: { id: "rm_vanilla" },
      update: { kosherType: "PAREVE" },
      create: { id: "rm_vanilla", productId: "pr_dark_choco", name: "וניל טבעי", supplier: "Nielsen-Massey", country: "MG", status: "NEEDS_INFO", kosherType: "PAREVE" },
    }),
    // Beef — Argentina
    prisma.rawMaterial.upsert({
      where: { id: "rm_beef_cuts" },
      update: { kosherType: "MEAT" },
      create: { id: "rm_beef_cuts", productId: "pr_beef", name: "נתחי בקר גולמי", supplier: "JBS Argentina", country: "AR", status: "APPROVED", kosherType: "MEAT", expiresAt: daysFromNow(90) },
    }),
    prisma.rawMaterial.upsert({
      where: { id: "rm_salt" },
      update: { kosherType: "PAREVE" },
      create: { id: "rm_salt", productId: "pr_beef", name: "מלח כשר", supplier: "Morton", country: "US", status: "APPROVED", kosherType: "PAREVE", expiresAt: daysFromNow(365) },
    }),
    // Ground Beef — Argentina
    prisma.rawMaterial.upsert({
      where: { id: "rm_ground_beef_cuts" },
      update: { kosherType: "MEAT" },
      create: { id: "rm_ground_beef_cuts", productId: "pr_ground_beef", name: "בשר טחון גולמי", supplier: "JBS Argentina", country: "AR", status: "PENDING", kosherType: "MEAT" },
    }),
    // Cheese — France
    prisma.rawMaterial.upsert({
      where: { id: "rm_milk_fr" },
      update: { kosherType: "DAIRY" },
      create: { id: "rm_milk_fr", productId: "pr_cheese", name: "חלב פסטרי מלא", supplier: "Lactalis", country: "FR", status: "APPROVED", kosherType: "DAIRY", expiresAt: daysFromNow(-10) },
    }),
    prisma.rawMaterial.upsert({
      where: { id: "rm_rennet" },
      update: { kosherType: "DAIRY", certificateIssuedBy: "Chr. Hansen Kosher" },
      create: { id: "rm_rennet", productId: "pr_cheese", name: "רנט כשר", supplier: "Chr. Hansen", country: "DK", status: "APPROVED", kosherType: "DAIRY", certificateIssuedBy: "Chr. Hansen Kosher", expiresAt: daysFromNow(300) },
    }),
    // Brie — France
    prisma.rawMaterial.upsert({
      where: { id: "rm_cream_brie" },
      update: { kosherType: "DAIRY" },
      create: { id: "rm_cream_brie", productId: "pr_brie", name: "שמנת חלב טרי", supplier: "Bongrain", country: "FR", status: "IN_REVIEW", kosherType: "DAIRY" },
    }),
    prisma.rawMaterial.upsert({
      where: { id: "rm_mold_brie" },
      update: { kosherType: "PAREVE" },
      create: { id: "rm_mold_brie", productId: "pr_brie", name: "עובש לבן Penicillium", supplier: "Danisco", country: "DK", status: "REJECTED", kosherType: "PAREVE", notes: "נדרש אישור מחדש מגוף הכשרות" },
    }),
  ]);

  // ─── Raw Material Approvals ───────────────────────────────────────────────
  console.log("Creating raw material approvals...");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upsertApproval = (id: string, rawMaterialId: string, certBodyId: string, status: string, opts: { approvedAt?: Date; expiresAt?: Date; yearRound?: boolean; passover?: boolean; kitniyot?: boolean; classificationOverride?: string } = {}) =>
    prisma.rawMaterialApproval.upsert({
      where: { rawMaterialId_certBodyId: { rawMaterialId, certBodyId } },
      update: { status: status as "APPROVED" | "PENDING" | "REJECTED" | "IN_REVIEW" | "EXPIRED" | "NEEDS_INFO", ...opts },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: { id, rawMaterialId, certBodyId, status: status as any, yearRound: opts.yearRound ?? true, passover: opts.passover ?? false, kitniyot: opts.kitniyot ?? false, classificationOverride: opts.classificationOverride ?? null, approvedAt: opts.approvedAt ?? null, expiresAt: opts.expiresAt ?? null },
    });

  await Promise.all([
    // ── קקאו גולמי (pr_milk_choco) — פרווה ─────────────────────────────────
    upsertApproval("rma_cocoa_ou",   "rm_cocoa", "cb_ou",    "APPROVED", { approvedAt: daysFromNow(-300), expiresAt: daysFromNow(65),  yearRound: true, passover: true, kitniyot: true }),
    upsertApproval("rma_cocoa_kofk", "rm_cocoa", "cb_kofk",  "APPROVED", { approvedAt: daysFromNow(-180), expiresAt: daysFromNow(185), yearRound: true, passover: false }),
    upsertApproval("rma_cocoa_bd",   "rm_cocoa", "cb_badatz","PENDING",  { yearRound: true, passover: false }),

    // ── אבקת חלב (pr_milk_choco) — חלבי ────────────────────────────────────
    upsertApproval("rma_milk_ou",   "rm_milk_powder", "cb_ou",   "APPROVED", { approvedAt: daysFromNow(-200), expiresAt: daysFromNow(45),  yearRound: true, passover: false }),
    upsertApproval("rma_milk_kofk", "rm_milk_powder", "cb_kofk", "PENDING",  { yearRound: true, passover: false }),

    // ── לציטין סויה (pr_milk_choco) — פרווה עם אפשרות DE ──────────────────
    upsertApproval("rma_lec_ou",   "rm_lecithin", "cb_ou",   "IN_REVIEW", { yearRound: true, classificationOverride: "D.E." }),
    upsertApproval("rma_lec_kofk", "rm_lecithin", "cb_kofk", "REJECTED",  { yearRound: false }),

    // ── קקאו 70% (pr_dark_choco) — פרווה ───────────────────────────────────
    upsertApproval("rma_cocoa70_ou",   "rm_cocoa_dark", "cb_ou",   "APPROVED", { approvedAt: daysFromNow(-100), expiresAt: daysFromNow(200), yearRound: true, passover: true, kitniyot: true }),
    upsertApproval("rma_cocoa70_kofk", "rm_cocoa_dark", "cb_kofk", "APPROVED", { approvedAt: daysFromNow(-90),  expiresAt: daysFromNow(210), yearRound: true, passover: true, kitniyot: false }),

    // ── וניל טבעי (pr_dark_choco) — פרווה ──────────────────────────────────
    upsertApproval("rma_vanilla_ou",   "rm_vanilla", "cb_ou",   "NEEDS_INFO", { yearRound: true }),
    upsertApproval("rma_vanilla_kofk", "rm_vanilla", "cb_kofk", "PENDING",    { yearRound: true }),

    // ── נתחי בקר (pr_beef) — בשרי ──────────────────────────────────────────
    upsertApproval("rma_beef_bd", "rm_beef_cuts", "cb_badatz", "APPROVED", { approvedAt: daysFromNow(-400), expiresAt: daysFromNow(90),  yearRound: true, passover: true, kitniyot: true }),
    upsertApproval("rma_beef_ou", "rm_beef_cuts", "cb_ou",     "APPROVED", { approvedAt: daysFromNow(-200), expiresAt: daysFromNow(160), yearRound: true, passover: true }),

    // ── מלח כשר (pr_beef) — פרווה ───────────────────────────────────────────
    upsertApproval("rma_salt_bd", "rm_salt", "cb_badatz", "APPROVED", { approvedAt: daysFromNow(-300), expiresAt: daysFromNow(365), yearRound: true, passover: true, kitniyot: true }),
    upsertApproval("rma_salt_ou", "rm_salt", "cb_ou",     "APPROVED", { approvedAt: daysFromNow(-300), expiresAt: daysFromNow(365), yearRound: true, passover: true, kitniyot: true }),

    // ── חלב פסטרי (pr_cheese) — חלבי ────────────────────────────────────────
    upsertApproval("rma_milk_fr_bd", "rm_milk_fr", "cb_badatz", "EXPIRED",   { yearRound: true, passover: false }),
    upsertApproval("rma_milk_fr_ou", "rm_milk_fr", "cb_ou",     "APPROVED",  { approvedAt: daysFromNow(-400), expiresAt: daysFromNow(-10), yearRound: true, passover: false }),

    // ── רנט כשר (pr_cheese) — חלבי ──────────────────────────────────────────
    upsertApproval("rma_rennet_bd", "rm_rennet", "cb_badatz", "APPROVED", { approvedAt: daysFromNow(-100), expiresAt: daysFromNow(300), yearRound: true, passover: false }),
    upsertApproval("rma_rennet_ou", "rm_rennet", "cb_ou",     "APPROVED", { approvedAt: daysFromNow(-100), expiresAt: daysFromNow(300), yearRound: true, passover: false, classificationOverride: "Cholov Stam" }),
  ]);
  console.log("  Raw material approvals: 20");

  // ─── Mashgichim ───────────────────────────────────────────────────────────
  console.log("Creating mashgichim...");

  const devMashgiach = await prisma.mashgiach.findFirst({ where: { organizationId: ORG_ID } });

  const mashgiachYosef = devMashgiach
    ? await prisma.mashgiach.update({
        where: { id: devMashgiach.id },
        data: {
          name: "יוסף לוי",
          nameEn: "Yosef Levy",
          phone: "050-1234567",
          email: "mashgiach@kashrut.com",
          city: "ירושלים",
          citizenships: ["IL", "US"],
          activeRegions: ["IL", "US", "BE", "FR"],
          languages: { "עברית": "native", "אנגלית": "fluent", "צרפתית": "basic" },
          salaryModel: "DAILY",
          salaryRate: 450,
          expensesType: "VARIABLE",
        },
      })
    : await prisma.mashgiach.create({
        data: {
          organizationId: ORG_ID,
          name: "יוסף לוי",
          nameEn: "Yosef Levy",
          phone: "050-1234567",
          email: "mashgiach@kashrut.com",
          city: "ירושלים",
          citizenships: ["IL", "US"],
          activeRegions: ["IL", "US", "BE", "FR"],
          languages: { "עברית": "native", "אנגלית": "fluent", "צרפתית": "basic" },
          salaryModel: "DAILY",
          salaryRate: 450,
          expensesType: "VARIABLE",
        },
      });

  const [mashgiachDavid, mashgiachSarah, mashgiachMoshe] = await Promise.all([
    prisma.mashgiach.upsert({
      where: { id: "mg_david" },
      update: { languages: { "עברית": "native", "אנגלית": "fluent", "ספרדית": "basic" } },
      create: {
        id: "mg_david",
        organizationId: ORG_ID,
        name: "דוד שמיר",
        nameEn: "David Shamir",
        phone: "052-9876543",
        email: "david.shamir@example.com",
        city: "בני ברק",
        citizenships: ["IL"],
        activeRegions: ["IL", "AR", "US"],
        languages: { "עברית": "native", "אנגלית": "fluent", "ספרדית": "basic" },
        salaryModel: "DAILY",
        salaryRate: 500,
        expensesType: "VARIABLE",
      },
    }),
    prisma.mashgiach.upsert({
      where: { id: "mg_sarah" },
      update: { languages: { "עברית": "native", "צרפתית": "native", "אנגלית": "fluent" } },
      create: {
        id: "mg_sarah",
        organizationId: ORG_ID,
        name: "שרה כץ",
        nameEn: "Sara Katz",
        phone: "054-3334444",
        email: "sara.katz@example.com",
        city: "תל אביב",
        citizenships: ["IL", "FR"],
        activeRegions: ["IL", "FR", "BE"],
        languages: { "עברית": "native", "צרפתית": "native", "אנגלית": "fluent" },
        salaryModel: "HOURLY",
        salaryRate: 80,
        expensesType: "FIXED",
        fixedExpenses: 300,
      },
    }),
    prisma.mashgiach.upsert({
      where: { id: "mg_moshe" },
      update: { languages: { "עברית": "native", "אנגלית": "basic", "ארמית": "fluent" } },
      create: {
        id: "mg_moshe",
        organizationId: ORG_ID,
        name: "משה גרינברג",
        nameEn: "Moshe Greenberg",
        phone: "058-5556666",
        email: "moshe.g@example.com",
        city: "מודיעין",
        citizenships: ["IL"],
        activeRegions: ["IL", "AR"],
        languages: { "עברית": "native", "אנגלית": "basic", "ארמית": "fluent" },
        salaryModel: "DAILY",
        salaryRate: 420,
        expensesType: "VARIABLE",
      },
    }),
  ]);

  // ─── Projects ─────────────────────────────────────────────────────────────
  console.log("Creating projects...");
  const [projBelgium, projArgentina, projFrance, projRestaurant, projUSA] = await Promise.all([
    prisma.project.upsert({
      where: { id: "pj_belgium" },
      update: { dealerId: dealerEurope.id },
      create: {
        id: "pj_belgium",
        organizationId: ORG_ID,
        clientId: clientChocolate.id,
        siteId: siteBelgium.id,
        type: "ANNUAL",
        status: "ACTIVE",
        openedAt: daysFromNow(-120),
        plannedVisitAt: daysFromNow(12),
        plannedVisitEnd: daysFromNow(14),
        certBodyId: ouBody.id,
        dealerId: dealerEurope.id,
      },
    }),
    prisma.project.upsert({
      where: { id: "pj_argentina" },
      update: { dealerId: dealerAmerica.id },
      create: {
        id: "pj_argentina",
        organizationId: ORG_ID,
        clientId: clientCohen.id,
        siteId: siteArgentina.id,
        type: "ANNUAL",
        status: "ACTIVE",
        openedAt: daysFromNow(-200),
        plannedVisitAt: daysFromNow(3),
        plannedVisitEnd: daysFromNow(7),
        certBodyId: badatzBody.id,
        dealerId: dealerAmerica.id,
      },
    }),
    prisma.project.upsert({
      where: { id: "pj_france" },
      update: { dealerId: dealerEurope.id },
      create: {
        id: "pj_france",
        organizationId: ORG_ID,
        clientId: clientIsraeliFood.id,
        siteId: siteFrance.id,
        type: "ANNUAL",
        status: "ACTIVE",
        openedAt: daysFromNow(-90),
        plannedVisitAt: daysFromNow(20),
        plannedVisitEnd: daysFromNow(21),
        certBodyId: kofkBody.id,
        dealerId: dealerEurope.id,
      },
    }),
    prisma.project.upsert({
      where: { id: "pj_restaurant" },
      update: {},
      create: {
        id: "pj_restaurant",
        organizationId: ORG_ID,
        clientId: clientGourmet.id,
        siteId: siteRestaurant.id,
        type: "ANNUAL",
        status: "ACTIVE",
        openedAt: daysFromNow(-30),
        certBodyId: badatzBody.id,
      },
    }),
    prisma.project.upsert({
      where: { id: "pj_usa" },
      update: { dealerId: dealerAmerica.id },
      create: {
        id: "pj_usa",
        organizationId: ORG_ID,
        clientId: clientCohen.id,
        siteId: siteUSA.id,
        type: "SPECIFIC",
        status: "PENDING",
        openedAt: daysFromNow(-10),
        plannedVisitAt: daysFromNow(35),
        plannedVisitEnd: daysFromNow(36),
        certBodyId: ouBody.id,
        dealerId: dealerAmerica.id,
      },
    }),
  ]);

  // ─── Assignments ──────────────────────────────────────────────────────────
  console.log("Creating assignments...");
  await Promise.all([
    // עתידי — בלגיה, יוסף, מאושר ע"י מפעל
    prisma.assignment.upsert({
      where: { id: "as_belgium_future" },
      update: {},
      create: {
        id: "as_belgium_future",
        organizationId: ORG_ID,
        projectId: projBelgium.id,
        siteId: siteBelgium.id,
        mashgiachId: mashgiachYosef.id,
        type: "ANNUAL",
        status: "SITE_CONFIRMED",
        scheduledAt: daysFromNow(12),
        scheduledEnd: daysFromNow(14),
        siteArrangesTravel: true,
        travelDetails: "טיסה EL-AL, מלון נרשם ע\"י המפעל",
      },
    }),
    // עתידי — צרפת, שרה
    prisma.assignment.upsert({
      where: { id: "as_france_future" },
      update: {},
      create: {
        id: "as_france_future",
        organizationId: ORG_ID,
        projectId: projFrance.id,
        siteId: siteFrance.id,
        mashgiachId: mashgiachSarah.id,
        type: "ANNUAL",
        status: "CREATED",
        scheduledAt: daysFromNow(20),
        scheduledEnd: daysFromNow(21),
        siteArrangesTravel: false,
      },
    }),
    // עתידי — ארגנטינה, דוד, יצא לדרך
    prisma.assignment.upsert({
      where: { id: "as_argentina_future" },
      update: {},
      create: {
        id: "as_argentina_future",
        organizationId: ORG_ID,
        projectId: projArgentina.id,
        siteId: siteArgentina.id,
        mashgiachId: mashgiachDavid.id,
        type: "ANNUAL",
        status: "DEPARTED",
        scheduledAt: daysFromNow(3),
        scheduledEnd: daysFromNow(7),
        siteArrangesTravel: true,
      },
    }),
    // עתידי — ארה"ב, משה
    prisma.assignment.upsert({
      where: { id: "as_usa_future" },
      update: {},
      create: {
        id: "as_usa_future",
        organizationId: ORG_ID,
        projectId: projUSA.id,
        siteId: siteUSA.id,
        mashgiachId: mashgiachMoshe.id,
        type: "SPECIFIC",
        status: "CREATED",
        scheduledAt: daysFromNow(35),
        scheduledEnd: daysFromNow(36),
        siteArrangesTravel: false,
      },
    }),
    // ממתין לסגירה — מסעדה, משה, הגיע ואין דוח
    prisma.assignment.upsert({
      where: { id: "as_restaurant_pending" },
      update: {},
      create: {
        id: "as_restaurant_pending",
        organizationId: ORG_ID,
        projectId: projRestaurant.id,
        siteId: siteRestaurant.id,
        mashgiachId: mashgiachMoshe.id,
        type: "ANNUAL",
        status: "ARRIVED",
        scheduledAt: daysFromNow(-5),
        scheduledEnd: daysFromNow(-4),
        actualStart: daysFromNow(-5),
        siteArrangesTravel: false,
      },
    }),
    // ממתין לסגירה — בלגיה, יוסף, הסתיים ואין דוח
    prisma.assignment.upsert({
      where: { id: "as_belgium_pending" },
      update: {},
      create: {
        id: "as_belgium_pending",
        organizationId: ORG_ID,
        projectId: projBelgium.id,
        siteId: siteBelgium.id,
        mashgiachId: mashgiachYosef.id,
        type: "ANNUAL",
        status: "COMPLETED",
        scheduledAt: daysFromNow(-15),
        scheduledEnd: daysFromNow(-13),
        actualStart: daysFromNow(-15),
        actualEnd: daysFromNow(-13),
        siteArrangesTravel: true,
      },
    }),
    // הסתיים — ארגנטינה, דוד, דוח הוגש
    prisma.assignment.upsert({
      where: { id: "as_argentina_done" },
      update: {},
      create: {
        id: "as_argentina_done",
        organizationId: ORG_ID,
        projectId: projArgentina.id,
        siteId: siteArgentina.id,
        mashgiachId: mashgiachDavid.id,
        type: "ANNUAL",
        status: "REPORTED",
        scheduledAt: daysFromNow(-60),
        scheduledEnd: daysFromNow(-56),
        actualStart: daysFromNow(-60),
        actualEnd: daysFromNow(-56),
        siteArrangesTravel: true,
      },
    }),
    // הסתיים — צרפת, שרה, מאושר
    prisma.assignment.upsert({
      where: { id: "as_france_done" },
      update: {},
      create: {
        id: "as_france_done",
        organizationId: ORG_ID,
        projectId: projFrance.id,
        siteId: siteFrance.id,
        mashgiachId: mashgiachSarah.id,
        type: "ANNUAL",
        status: "APPROVED",
        scheduledAt: daysFromNow(-90),
        scheduledEnd: daysFromNow(-89),
        actualStart: daysFromNow(-90),
        actualEnd: daysFromNow(-89),
        siteArrangesTravel: false,
      },
    }),
  ]);

  // ─── Hologram Batch ───────────────────────────────────────────────────────
  console.log("Creating hologram batch...");
  await prisma.hologramBatch.upsert({
    where: { id: "hb_batch1" },
    update: {},
    create: {
      id: "hb_batch1",
      organizationId: ORG_ID,
      rangeFrom: 100000,
      rangeTo: 100999,
      notes: "מנה ראשונה 2025",
    },
  });

  // ─── Certificates ─────────────────────────────────────────────────────────
  console.log("Creating certificates...");
  await Promise.all([
    prisma.certificate.upsert({
      where: { id: "cert_belgium" },
      update: {},
      create: {
        id: "cert_belgium",
        organizationId: ORG_ID,
        projectId: projBelgium.id,
        clientId: clientChocolate.id,
        certBodyId: ouBody.id,
        status: "SENT",
        issuedAt: daysFromNow(-120),
        expiresAt: daysFromNow(245),
      },
    }),
    prisma.certificate.upsert({
      where: { id: "cert_argentina" },
      update: {},
      create: {
        id: "cert_argentina",
        organizationId: ORG_ID,
        projectId: projArgentina.id,
        clientId: clientCohen.id,
        certBodyId: badatzBody.id,
        status: "READY_TO_SEND",
        issuedAt: daysFromNow(-200),
        expiresAt: daysFromNow(165),
      },
    }),
    prisma.certificate.upsert({
      where: { id: "cert_restaurant" },
      update: {},
      create: {
        id: "cert_restaurant",
        organizationId: ORG_ID,
        projectId: projRestaurant.id,
        clientId: clientGourmet.id,
        certBodyId: badatzBody.id,
        status: "WAITING_PAYMENT",
        issuedAt: daysFromNow(-30),
        expiresAt: daysFromNow(335),
      },
    }),
  ]);

  // ─── Client Price Items (Rate Cards) ─────────────────────────────────────
  console.log("Creating client price items...");
  await Promise.all([
    // כהן — תעריפים בדולר
    prisma.clientPriceItem.upsert({
      where: { id: "pi_cohen_day" },
      update: {},
      create: { id: "pi_cohen_day",   clientId: clientCohen.id,     name: "יום עבודה",          unitLabel: "יום",    price: 400,  currency: "USD", order: 0 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_cohen_fly" },
      update: {},
      create: { id: "pi_cohen_fly",   clientId: clientCohen.id,     name: "טיסה",               unitLabel: "כיוון",  price: 800,  currency: "USD", order: 1 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_cohen_hotel" },
      update: {},
      create: { id: "pi_cohen_hotel", clientId: clientCohen.id,     name: "לינה",               unitLabel: "לילה",   price: 150,  currency: "USD", order: 2 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_cohen_meal" },
      update: {},
      create: { id: "pi_cohen_meal",  clientId: clientCohen.id,     name: "כלכלה",              unitLabel: "יום",    price: 75,   currency: "USD", order: 3 },
    }),
    // ישראל פוד — תעריפים באירו
    prisma.clientPriceItem.upsert({
      where: { id: "pi_ifood_day" },
      update: {},
      create: { id: "pi_ifood_day",   clientId: clientIsraeliFood.id, name: "יום עבודה",        unitLabel: "יום",    price: 350,  currency: "EUR", order: 0 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_ifood_fly" },
      update: {},
      create: { id: "pi_ifood_fly",   clientId: clientIsraeliFood.id, name: "טיסה",             unitLabel: "כיוון",  price: 600,  currency: "EUR", order: 1 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_ifood_hotel" },
      update: {},
      create: { id: "pi_ifood_hotel", clientId: clientIsraeliFood.id, name: "לינה",             unitLabel: "לילה",   price: 120,  currency: "EUR", order: 2 },
    }),
    // שוקולד ד'לוקס — תעריפים בדולר
    prisma.clientPriceItem.upsert({
      where: { id: "pi_choco_day" },
      update: {},
      create: { id: "pi_choco_day",   clientId: clientChocolate.id,  name: "יום עבודה",         unitLabel: "יום",    price: 450,  currency: "USD", order: 0 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_choco_fly" },
      update: {},
      create: { id: "pi_choco_fly",   clientId: clientChocolate.id,  name: "טיסה",              unitLabel: "כיוון",  price: 900,  currency: "USD", order: 1 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_choco_hotel" },
      update: {},
      create: { id: "pi_choco_hotel", clientId: clientChocolate.id,  name: "לינה",              unitLabel: "לילה",   price: 160,  currency: "USD", order: 2 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_choco_meal" },
      update: {},
      create: { id: "pi_choco_meal",  clientId: clientChocolate.id,  name: "כלכלה",             unitLabel: "יום",    price: 80,   currency: "USD", order: 3 },
    }),
    // מסעדת הגורמה — בשקלים
    prisma.clientPriceItem.upsert({
      where: { id: "pi_gourmet_visit" },
      update: {},
      create: { id: "pi_gourmet_visit", clientId: clientGourmet.id, name: "ביקור שנתי",          unitLabel: "ביקור",  price: 2500, currency: "ILS", order: 0 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_gourmet_mgmt" },
      update: {},
      create: { id: "pi_gourmet_mgmt",  clientId: clientGourmet.id, name: "דמי ניהול שנתיים",   unitLabel: "שנה",    price: 3600, currency: "ILS", order: 1 },
    }),
    // פרמיום יין — באירו
    prisma.clientPriceItem.upsert({
      where: { id: "pi_wine_day" },
      update: {},
      create: { id: "pi_wine_day",   clientId: clientWine.id, name: "יום עבודה",    unitLabel: "יום",   price: 380, currency: "EUR", order: 0 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_wine_fly" },
      update: {},
      create: { id: "pi_wine_fly",   clientId: clientWine.id, name: "טיסה",         unitLabel: "כיוון", price: 650, currency: "EUR", order: 1 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_wine_hotel" },
      update: {},
      create: { id: "pi_wine_hotel", clientId: clientWine.id, name: "לינה",         unitLabel: "לילה",  price: 130, currency: "EUR", order: 2 },
    }),
    // גולדן ביסקוויט — בלירה שטרלינג
    prisma.clientPriceItem.upsert({
      where: { id: "pi_bisc_day" },
      update: {},
      create: { id: "pi_bisc_day",   clientId: clientBiscuit.id, name: "יום עבודה", unitLabel: "יום",   price: 320, currency: "GBP", order: 0 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_bisc_fly" },
      update: {},
      create: { id: "pi_bisc_fly",   clientId: clientBiscuit.id, name: "טיסה",      unitLabel: "כיוון", price: 550, currency: "GBP", order: 1 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_bisc_hotel" },
      update: {},
      create: { id: "pi_bisc_hotel", clientId: clientBiscuit.id, name: "לינה",      unitLabel: "לילה",  price: 110, currency: "GBP", order: 2 },
    }),
    // מלון הנסיך — בשקלים
    prisma.clientPriceItem.upsert({
      where: { id: "pi_hotel_visit" },
      update: {},
      create: { id: "pi_hotel_visit", clientId: clientHotel.id, name: "ביקור שבועי", unitLabel: "ביקור", price: 800,  currency: "ILS", order: 0 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_hotel_mgmt" },
      update: {},
      create: { id: "pi_hotel_mgmt",  clientId: clientHotel.id, name: "דמי ניהול",  unitLabel: "חודש",  price: 1200, currency: "ILS", order: 1 },
    }),
    // תבלינים ד'עולם — בדולר
    prisma.clientPriceItem.upsert({
      where: { id: "pi_spice_day" },
      update: {},
      create: { id: "pi_spice_day",   clientId: clientSpice.id, name: "יום עבודה",  unitLabel: "יום",   price: 350, currency: "USD", order: 0 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_spice_fly" },
      update: {},
      create: { id: "pi_spice_fly",   clientId: clientSpice.id, name: "טיסה",       unitLabel: "כיוון", price: 700, currency: "USD", order: 1 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_spice_hotel" },
      update: {},
      create: { id: "pi_spice_hotel", clientId: clientSpice.id, name: "לינה",       unitLabel: "לילה",  price: 90,  currency: "USD", order: 2 },
    }),
    prisma.clientPriceItem.upsert({
      where: { id: "pi_spice_meal" },
      update: {},
      create: { id: "pi_spice_meal",  clientId: clientSpice.id, name: "כלכלה",      unitLabel: "יום",   price: 50,  currency: "USD", order: 3 },
    }),
  ]);

  // ─── Project Line Items ───────────────────────────────────────────────────
  console.log("Creating project line items...");
  await Promise.all([
    // פרויקט בלגיה — שוקולד ד'לוקס (USD)
    prisma.projectLineItem.upsert({
      where: { id: "li_bel_day" },
      update: {},
      create: { id: "li_bel_day",   projectId: projBelgium.id,   priceItemId: "pi_choco_day",   description: "יום עבודה — בלגיה",     quantity: 2,   unitPrice: 450,  currency: "USD", order: 0 },
    }),
    prisma.projectLineItem.upsert({
      where: { id: "li_bel_fly" },
      update: {},
      create: { id: "li_bel_fly",   projectId: projBelgium.id,   priceItemId: "pi_choco_fly",   description: "טיסה הלוך–חזור",         quantity: 2,   unitPrice: 900,  currency: "USD", order: 1, notes: "EL-AL TLV-BRU" },
    }),
    prisma.projectLineItem.upsert({
      where: { id: "li_bel_hotel" },
      update: {},
      create: { id: "li_bel_hotel", projectId: projBelgium.id,   priceItemId: "pi_choco_hotel", description: "לינה — בריסל",            quantity: 2,   unitPrice: 160,  currency: "USD", order: 2 },
    }),
    prisma.projectLineItem.upsert({
      where: { id: "li_bel_meal" },
      update: {},
      create: { id: "li_bel_meal",  projectId: projBelgium.id,   priceItemId: "pi_choco_meal",  description: "כלכלה",                    quantity: 2,   unitPrice: 80,   currency: "USD", order: 3 },
    }),
    // פרויקט ארגנטינה — כהן (USD)
    prisma.projectLineItem.upsert({
      where: { id: "li_arg_day" },
      update: {},
      create: { id: "li_arg_day",   projectId: projArgentina.id, priceItemId: "pi_cohen_day",   description: "יום עבודה — בואנוס איירס", quantity: 5,   unitPrice: 400,  currency: "USD", order: 0 },
    }),
    prisma.projectLineItem.upsert({
      where: { id: "li_arg_fly" },
      update: {},
      create: { id: "li_arg_fly",   projectId: projArgentina.id, priceItemId: "pi_cohen_fly",   description: "טיסה הלוך–חזור",           quantity: 2,   unitPrice: 800,  currency: "USD", order: 1, notes: "דרך מיאמי" },
    }),
    prisma.projectLineItem.upsert({
      where: { id: "li_arg_hotel" },
      update: {},
      create: { id: "li_arg_hotel", projectId: projArgentina.id, priceItemId: "pi_cohen_hotel", description: "לינה",                      quantity: 5,   unitPrice: 150,  currency: "USD", order: 2 },
    }),
    prisma.projectLineItem.upsert({
      where: { id: "li_arg_meal" },
      update: {},
      create: { id: "li_arg_meal",  projectId: projArgentina.id, priceItemId: "pi_cohen_meal",  description: "כלכלה",                     quantity: 5,   unitPrice: 75,   currency: "USD", order: 3 },
    }),
    // פרויקט צרפת — ישראל פוד (EUR)
    prisma.projectLineItem.upsert({
      where: { id: "li_fr_day" },
      update: {},
      create: { id: "li_fr_day",    projectId: projFrance.id,    priceItemId: "pi_ifood_day",   description: "יום עבודה — ליון",          quantity: 1,   unitPrice: 350,  currency: "EUR", order: 0 },
    }),
    prisma.projectLineItem.upsert({
      where: { id: "li_fr_fly" },
      update: {},
      create: { id: "li_fr_fly",    projectId: projFrance.id,    priceItemId: "pi_ifood_fly",   description: "טיסה הלוך–חזור",            quantity: 2,   unitPrice: 600,  currency: "EUR", order: 1 },
    }),
    prisma.projectLineItem.upsert({
      where: { id: "li_fr_hotel" },
      update: {},
      create: { id: "li_fr_hotel",  projectId: projFrance.id,    priceItemId: "pi_ifood_hotel", description: "לינה — ליון",               quantity: 1,   unitPrice: 120,  currency: "EUR", order: 2 },
    }),
    // פרויקט מסעדה — גורמה (ILS)
    prisma.projectLineItem.upsert({
      where: { id: "li_rst_visit" },
      update: {},
      create: { id: "li_rst_visit", projectId: projRestaurant.id, priceItemId: "pi_gourmet_visit", description: "ביקור שנתי 2025",         quantity: 1,   unitPrice: 2500, currency: "ILS", order: 0 },
    }),
    prisma.projectLineItem.upsert({
      where: { id: "li_rst_mgmt" },
      update: {},
      create: { id: "li_rst_mgmt",  projectId: projRestaurant.id, priceItemId: "pi_gourmet_mgmt",  description: "דמי ניהול שנתיים 2025",   quantity: 1,   unitPrice: 3600, currency: "ILS", order: 1 },
    }),
  ]);

  // ─── Alerts ───────────────────────────────────────────────────────────────
  console.log("Creating alerts...");
  await Promise.all([
    prisma.alert.upsert({
      where: { id: "al_cert_expire" },
      update: {},
      create: {
        id: "al_cert_expire",
        organizationId: ORG_ID,
        type: "CERT_EXPIRING",
        severity: "IMPORTANT",
        title: "תעודת כשרות עומדת לפוג",
        description: "תעודת כשרות של Carne Premium SA פוקעת בעוד 165 ימים",
        entityType: "Certificate",
        entityId: "cert_argentina",
        isDismissed: false,
      },
    }),
    prisma.alert.upsert({
      where: { id: "al_payment" },
      update: {},
      create: {
        id: "al_payment",
        organizationId: ORG_ID,
        type: "PAYMENT_OVERDUE",
        severity: "URGENT",
        title: "תעודה ממתינה לתשלום",
        description: "מסעדת הגורמה — תעודה ממתינה לתשלום מזה 30 יום",
        entityType: "Certificate",
        entityId: "cert_restaurant",
        isDismissed: false,
      },
    }),
    prisma.alert.upsert({
      where: { id: "al_report" },
      update: {},
      create: {
        id: "al_report",
        organizationId: ORG_ID,
        type: "REPORT_NOT_SUBMITTED",
        severity: "IMPORTANT",
        title: "דוח לא הוגש",
        description: "ביקור בבלגיה הסתיים לפני 15 יום — דוח טרם הוגש",
        entityType: "Assignment",
        entityId: "as_belgium_pending",
        isDismissed: false,
      },
    }),
  ]);

  console.log("\n✅ Seed completed!");
  console.log("  Clients: 8 (4 מקוריים + יין, ביסקוויט, מלון, תבלינים)");
  console.log("  Sites: 9 (5 מקוריים + 4 חדשים)");
  console.log("  Products: 13 (6 מקוריים + 7 חדשים)");
  console.log("  Mashgichim: 4 (יוסף, דוד, שרה, משה)");
  console.log("  Projects: 5");
  console.log("  Assignments: 8 (4 עתידיים, 2 ממתינים לסגירה, 2 הסתיימו)");
  console.log("  Certificates: 3");
  console.log("  Alerts: 3");
  console.log("  Client price items: 27 (כרטיסי תעריפים)");
  console.log("  Project line items: 13 (שורות חיוב בפרויקטים)");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
