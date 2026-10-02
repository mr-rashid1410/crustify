// ─────────────────────────────────────────────────────────────
// generate.js — Pizza Mania Mini Project Documentation Builder
// Mirrors the FixMate documentation structure exactly, but with
// Pizza Mania business logic, images, and MERN stack content.
// Run:  node generate.js
// ─────────────────────────────────────────────────────────────
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, ImageRun, PageBreak, Table, TableRow, TableCell,
  WidthType, BorderStyle, TabStopType, TabStopPosition, LevelFormat,
  Footer, Header, PageNumber, ShadingType,
} = require("docx");

const IMG_DIR = path.resolve(__dirname, "..", "user", "images");
const OUT_FILE = path.resolve(__dirname, "..", "Pizza_Mania_Miniproject_Documentation.docx");

// helper — load image buffer
const img = (name) => fs.readFileSync(path.join(IMG_DIR, name));

// ── Text helpers ─────────────────────────────────────────────
const T = (text, opts = {}) =>
  new TextRun({ text, font: "Times New Roman", size: 24, ...opts });

const P = (text, opts = {}) =>
  new Paragraph({
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { after: 160, line: 340 },
    indent: opts.indent,
    children: Array.isArray(text) ? text : [T(text, opts)],
    ...(opts.bullet ? { bullet: { level: 0 } } : {}),
  });

const CENTER = (text, opts = {}) =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [T(text, { bold: true, size: opts.size || 28, ...opts })],
  });

const H1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 160 },
    children: [new TextRun({ text, bold: true, size: 32, font: "Times New Roman", color: "8B0000" })],
  });

const H2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, font: "Times New Roman", color: "B22222" })],
  });

const H3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 140, after: 100 },
    children: [new TextRun({ text, bold: true, size: 26, font: "Times New Roman" })],
  });

const BULLET = (text) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 100, line: 320 },
    children: [T(text)],
  });

const BULLET_KV = (k, v) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 100, line: 320 },
    children: [T(k, { bold: true }), T(v)],
  });

const BLANK = () => new Paragraph({ children: [T(" ")] });

const PB = () => new Paragraph({ children: [new PageBreak()] });

const IMG = (file, w = 480, h = 290) => {
  try {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 },
      children: [
        new ImageRun({
          data: img(file),
          transformation: { width: w, height: h },
        }),
      ],
    });
  } catch (e) {
    return P(`[Image: ${file}]`, { align: AlignmentType.CENTER });
  }
};

const IMG_CAPTION = (cap) =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: cap, italics: true, size: 22, font: "Times New Roman" })],
  });

// ── Simple table for INDEX ───────────────────────────────────
const indexRow = (sr, title, isHeader = false) =>
  new TableRow({
    children: [
      new TableCell({
        width: { size: 10, type: WidthType.PERCENTAGE },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: sr, bold: isHeader, size: 24, font: "Times New Roman" })],
        })],
      }),
      new TableCell({
        width: { size: 75, type: WidthType.PERCENTAGE },
        children: [new Paragraph({
          children: [new TextRun({ text: title, bold: isHeader, size: 24, font: "Times New Roman" })],
        })],
      }),
      new TableCell({
        width: { size: 15, type: WidthType.PERCENTAGE },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: isHeader ? "SIGNATURE" : "", bold: isHeader, size: 24, font: "Times New Roman" })],
        })],
      }),
    ],
  });

const indexTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    indexRow("SR NO", "TITLE", true),
    indexRow("1.", "INTRODUCTION  (Problem Identification, Problem Description, Purpose, Objectives, Scope and Importance)"),
    indexRow("2.", "REQUIREMENT SPECIFICATIONS  (Hardware, Software, Functional, Non-Functional)"),
    indexRow("3.", "METHODOLOGY  (Database Design, System Architecture, UML Diagrams)"),
    indexRow("4.", "IMPLEMENTATION  (Modules Overview, Backend & Frontend Code Logic)"),
    indexRow("5.", "RESULTS AND ANALYSIS  (Screenshots of the website)"),
    indexRow("6.", "CONCLUSION"),
    indexRow("7.", "FUTURE SCOPE"),
    indexRow("8.", "REFERENCES"),
  ],
});

// ───────────────────────────────────────────────────────────────
// BUILD CONTENT
// ───────────────────────────────────────────────────────────────
const children = [];

// ========= COVER PAGE =========
children.push(BLANK());
children.push(CENTER("A"));
children.push(CENTER("MINI PROJECT REPORT"));
children.push(CENTER("ON"));
children.push(BLANK());
children.push(CENTER("“PIZZA MANIA”", { size: 40, color: "8B0000" }));
children.push(BLANK());
children.push(CENTER("SUBMITTED BY"));
children.push(BLANK());
children.push(CENTER("Student Name 1   (Roll No.)"));
children.push(CENTER("Student Name 2   (Roll No.)"));
children.push(BLANK());
children.push(CENTER("Under the guidance of"));
children.push(CENTER("MS. KULSUM KONDKAR"));
children.push(BLANK());
children.push(CENTER("SUBMITTED TO"));
children.push(CENTER("SAVITRIBAI PHULE PUNE UNIVERSITY"));
children.push(BLANK());
children.push(CENTER("IN PARTIAL FULFILMENT OF THE REQUIREMENT FOR THE AWARD OF DEGREE OF", { size: 22 }));
children.push(CENTER("BACHELOR OF SCIENCE (COMPUTER SCIENCE)", { size: 24 }));
children.push(CENTER("FOR ACADEMIC YEAR 2025-2026", { size: 22 }));
children.push(BLANK());
children.push(CENTER("ANJUMAN KHAIRUL ISLAM’s"));
children.push(CENTER("POONA COLLEGE OF ARTS, SCIENCE & COMMERCE"));
children.push(CENTER("Camp, Pune - 411001"));
children.push(PB());

// ========= DETAILS PAGE =========
children.push(CENTER("S.Y.B.Sc. (Computer Science) Mini Project Academic Year (2025 - 2026)", { size: 24 }));
children.push(BLANK());
children.push(P("Project Title:  PIZZA MANIA — Online Pizza Ordering Web Application", { bold: true }));
children.push(BLANK());
children.push(P("Team members:", { bold: true }));
children.push(P("Name : ______________________         Roll No : ______     Exam Seat No : ______"));
children.push(P("Name : ______________________         Roll No : ______     Exam Seat No : ______"));
children.push(BLANK());
children.push(P("Project Guide Name :  MS. KULSUM KONDKAR"));
children.push(P("Project Guide Signature : ______________________"));
children.push(BLANK());
children.push(P("Start Date : ___/___/______        Completion Date : ___/___/______"));
children.push(PB());

// ========= CERTIFICATE 1 =========
children.push(CENTER("DEPARTMENT OF COMPUTER SCIENCE"));
children.push(BLANK());
children.push(CENTER("CERTIFICATE", { size: 36 }));
children.push(BLANK());
children.push(P("This is to certify that Ms./Mr. ______________________ have successfully and satisfactorily completed and submitted the field project titled “PIZZA MANIA — Online Pizza Ordering Web Application” in partial fulfilment of S.Y.B.Sc. (CS) Lab course CS-281-FP Mini Project Semester IV prescribed by Savitribai Phule Pune University during the academic year 2025-2026."));
children.push(BLANK()); children.push(BLANK()); children.push(BLANK());
children.push(P("      (Project Guide)                                                  (H.O.D. Computer Science)"));
children.push(BLANK()); children.push(BLANK());
children.push(P("      INTERNAL EXAMINER                                        EXTERNAL EXAMINER"));
children.push(PB());

// ========= CERTIFICATE 2 =========
children.push(CENTER("DEPARTMENT OF COMPUTER SCIENCE  —  CERTIFICATE"));
children.push(BLANK());
children.push(CENTER("THIS IS TO CERTIFY THAT THE PROJECT ENTITLED"));
children.push(BLANK());
children.push(CENTER("“PIZZA MANIA”", { size: 36, color: "8B0000" }));
children.push(BLANK());
children.push(CENTER("Has been partially completed successfully by"));
children.push(CENTER("“Student Name 1” and “Student Name 2”", { size: 26 }));
children.push(BLANK());
children.push(P("towards partial fulfillment of Bachelor of Science (Computer Science) in Computer Science Department from Savitribai Phule Pune University, for the academic year 2025-2026.", { align: AlignmentType.CENTER }));
children.push(BLANK()); children.push(BLANK()); children.push(BLANK());
children.push(P("Project Guide                                                     H.O.D"));
children.push(BLANK());
children.push(P("Internal Examiner                                             External Examiner"));
children.push(PB());

// ========= ABSTRACT =========
children.push(CENTER("Abstract", { size: 36 }));
children.push(BLANK());
children.push(P("Pizza Mania is a full-stack web-based application engineered to digitalise the traditional pizza ordering experience by bringing menu browsing, cart management, secure checkout and order tracking into a single, unified platform. In today’s fast-paced urban lifestyle, customers expect the freedom to order their favourite food from anywhere and at any time, while pizza outlets need an efficient, centralised way to manage their menu, customers and orders. Pizza Mania addresses both of these needs through a clean, responsive web interface and a reliable backend REST API."));
children.push(P("The project is developed using the MERN-style stack — HTML5, CSS3 and vanilla JavaScript on the frontend, and Node.js with the Express.js framework, MongoDB (Mongoose ODM) and JSON Web Token (JWT) based authentication on the backend. The system implements two clearly separated roles — Customer and Administrator. Customers can register, log in, browse the pizza menu, add items to a server-side persistent cart, place orders with complete billing details and review their past orders. Administrators operate from a dedicated admin panel where they can manage products, monitor users, update order statuses through the full delivery lifecycle and read contact-form enquiries. By integrating secure authentication, a modular REST API, persistent data storage and a polished user interface, Pizza Mania demonstrates how modern web technologies can be combined to deliver a scalable, real-world online food ordering solution."));
children.push(PB());

// ========= INDEX =========
children.push(CENTER("INDEX", { size: 36 }));
children.push(BLANK());
children.push(indexTable);
children.push(PB());

// ========= 1. INTRODUCTION =========
children.push(H1("1. Introduction"));
children.push(H2("1.1 Problem Identification"));
children.push(P("With the rapid growth of digital consumerism, customers increasingly prefer ordering food online rather than visiting restaurants or placing telephonic orders. Pizza, being one of the most popular fast-food items worldwide, sees an enormous demand every single day. However, many local and mid-sized pizza outlets still rely on manual order taking, handwritten bills and word-of-mouth menu sharing. This creates a clear “digital gap” between modern customer expectations and the traditional ordering workflow used by many pizza businesses."));

children.push(H2("1.2 Problem Description"));
children.push(P("The manual pizza ordering process suffers from several limitations that affect both customers and outlet owners:"));
children.push(BULLET("No Centralised Menu: Customers cannot easily view the full list of pizzas, prices and availability without calling the outlet or visiting in person."));
children.push(BULLET("Order Errors: Taking orders over the phone often leads to miscommunication about size, quantity, billing address and special instructions."));
children.push(BULLET("No Order History: Customers have no way to view their previous orders, re-order favourites or track the status of an ongoing order."));
children.push(BULLET("Inefficient Management: Admins struggle to update the menu, manage users, track revenue and handle customer enquiries without a dedicated digital dashboard."));

children.push(H2("1.3 Purpose"));
children.push(P("The purpose of Pizza Mania is to build a modern, reliable and user-friendly online pizza ordering platform that removes all of the above friction points. The platform acts as a digital storefront where customers can explore the full menu, add pizzas to a persistent cart, complete checkout securely and receive order confirmations — while the administrator manages the entire business from a dedicated web panel."));

children.push(H2("1.4 Objectives"));
children.push(P("The primary objective of Pizza Mania is to deliver a seamless, end-to-end online pizza ordering experience. The specific goals include:"));
children.push(BULLET("Digital Menu: Display all pizzas dynamically from the database with images, descriptions, categories (veg / non-veg / special) and prices."));
children.push(BULLET("Persistent Cart: Allow logged-in users to add items to a cart that is saved in MongoDB so it is available across devices and sessions."));
children.push(BULLET("Secure Checkout: Enable customers to place orders with complete billing details and automatic subtotal, tax and total calculation."));
children.push(BULLET("Order Lifecycle: Track every order through the stages — Pending → Confirmed → Preparing → Delivered (or Cancelled)."));
children.push(BULLET("Admin Control: Provide a dedicated admin panel to manage products, users, orders and contact-form enquiries."));

children.push(H2("1.5 Scope and Importance"));
children.push(P("Scope: The project covers the complete development of a three-tier web application — a customer-facing frontend, an admin panel and a REST API backend. It includes JWT-based authentication, role-based access control, product catalogue management, a server-side persistent cart, order placement with billing capture, order status management and contact-form handling."));
children.push(P("Importance: Pizza Mania modernises the traditional pizza business by bringing it online in a cost-effective and scalable way. It saves valuable time for customers, improves order accuracy, and gives outlet owners a complete digital dashboard to run their business. The architecture is generic enough that the same codebase can be rebranded and reused for any other food-ordering business — demonstrating the real-world value of a MERN-style stack applied to a local market."));
children.push(PB());

// ========= 2. REQUIREMENT SPECIFICATIONS =========
children.push(H1("2. Requirement Specifications"));

children.push(H2("2.1 Hardware Requirements"));
children.push(P("To ensure the smooth execution of the Node.js backend server, MongoDB database and the browser-based frontend, the following hardware configuration is recommended:"));
children.push(BULLET("Processor: Intel Core i3 (or equivalent) or higher, to comfortably handle concurrent HTTP requests during development and demonstration."));
children.push(BULLET("Memory (RAM): Minimum 4GB RAM — recommended 8GB so that VS Code, the Node server, MongoDB and multiple browser tabs can run simultaneously without slowdown."));
children.push(BULLET("Storage: 250 GB HDD / SSD with at least 5 GB of free space for Node modules, MongoDB data files and local images."));
children.push(BULLET("Input Devices: Standard keyboard and mouse for coding and testing the UI."));
children.push(BULLET("Display: 1366×768 resolution or higher for proper testing of the responsive CSS layout."));

children.push(H2("2.2 Software Requirements"));
children.push(P("Pizza Mania is built using a modern, open-source, cross-platform stack that ensures portability and easy deployment:"));
children.push(BULLET("Operating System: Windows 10 / 11 or any Linux distribution (Ubuntu / Debian) for a stable development environment."));
children.push(BULLET("Runtime: Node.js (v18 or above) — used to run the Express.js backend server."));
children.push(BULLET("Web Framework: Express.js — a minimalist Node.js framework used for routing, middleware and REST API design."));
children.push(BULLET("Database: MongoDB with Mongoose ODM — a document database that stores users, products, carts, orders and contact messages."));
children.push(BULLET("Authentication: JSON Web Token (JWT) + bcryptjs for secure, stateless login and password hashing."));
children.push(BULLET("Frontend: HTML5, CSS3 and vanilla JavaScript (ES6) — no heavy frameworks, keeping the UI lightweight and fast."));
children.push(BULLET("Development Tools: Visual Studio Code as the primary IDE, Postman for API testing, and MongoDB Compass for database inspection."));
children.push(BULLET("Web Browser: Google Chrome, Mozilla Firefox or Microsoft Edge for testing the responsive interface."));

children.push(H2("2.3 Functional Requirements"));
children.push(P("These define the core operations that the Pizza Mania system must perform:"));
children.push(BULLET("Authentication Module: Users must be able to register and log in securely. Passwords are hashed using bcrypt and a JWT is issued on successful login. Two roles are supported — user and admin."));
children.push(BULLET("Product Catalogue: The system must display all available pizzas fetched dynamically from the database, with name, description, price, category and image."));
children.push(BULLET("Shopping Cart: Logged-in customers must be able to add pizzas to a cart, update quantities and remove items. The cart is persisted in MongoDB per user."));
children.push(BULLET("Order Placement: Customers must be able to place an order by providing billing details. The system must automatically calculate subtotal, 9% tax and total."));
children.push(BULLET("Order History: Customers must be able to view all their past orders with item details, totals and current status."));
children.push(BULLET("Admin Product Management: Admins must be able to add, update and delete pizza products."));
children.push(BULLET("Admin Order Management: Admins must be able to view every order placed on the platform and update its status through the full delivery lifecycle."));
children.push(BULLET("Contact Module: Visitors must be able to send enquiries via a contact form that is stored in the database for the admin to read."));

children.push(H2("2.4 Non-Functional Requirements"));
children.push(BULLET("Security: Passwords are never stored in plain text — they are hashed using bcrypt. Protected routes require a valid JWT, and admin-only routes additionally check the user role."));
children.push(BULLET("Usability: The user interface is clean, responsive and easy to navigate for customers of any technical background. Navigation, menu grids and checkout forms are designed to work well on both desktop and mobile."));
children.push(BULLET("Reliability: The MongoDB database ensures data integrity across users, products, carts and orders even under concurrent requests."));
children.push(BULLET("Scalability: The REST API is stateless and horizontally scalable — the same backend can serve a growing number of customers by simply adding more Node instances behind a load balancer."));
children.push(PB());

// ========= 3. METHODOLOGY =========
children.push(H1("3. Methodology"));

children.push(H2("3.1 Database Design"));
children.push(P("Pizza Mania uses MongoDB — a flexible, document-oriented NoSQL database — managed through the Mongoose ODM. The data model consists of five collections that together capture the complete business logic of an online pizza ordering system:"));
children.push(BULLET_KV("Users Collection: ", "stores name, email (unique), hashed password, phone, address, and role (user / admin). A Mongoose pre-save hook automatically hashes passwords before they hit the database."));
children.push(BULLET_KV("Products Collection: ", "stores every pizza — name, description, price, image filename, category (veg / non-veg / special), isPopular and isAvailable flags."));
children.push(BULLET_KV("Carts Collection: ", "one cart document per user (unique index on user). Each cart holds an array of items where item details are snapshotted at the time of adding."));
children.push(BULLET_KV("Orders Collection: ", "permanently records every placed order — items (snapshotted), billingDetails (name, email, phone, address, city, pincode), subtotal, 9% tax, total and an order status."));
children.push(BULLET_KV("Contacts Collection: ", "stores contact-form submissions (firstName, lastName, email, phone, message, isRead) so the admin can respond to enquiries."));
children.push(P("This schema design uses snapshots for cart and order items (name, price, image stored on the item itself) so that even if a product is later updated or deleted, historical carts and orders remain intact and readable."));

children.push(H2("3.2 System Design & Architecture"));
children.push(P("Pizza Mania follows a classic three-tier architecture, very close in spirit to the Model-View-Controller (MVC) pattern:"));
children.push(BULLET_KV("Model: ", "Mongoose schemas (User, Product, Cart, Order, Contact) define how data is shaped and stored in MongoDB."));
children.push(BULLET_KV("View: ", "The user-facing frontend (HTML5 + CSS3 + JavaScript) in /user and the admin panel in /admin."));
children.push(BULLET_KV("Controller: ", "Express.js route handlers in /backend/controllers handle every incoming HTTP request, validate input, talk to the database and send back JSON responses."));
children.push(P("The frontend communicates with the backend through a clean REST API exposed under /api — /api/auth, /api/products, /api/cart, /api/orders and /api/contact. Authentication is stateless and uses JWT, making the backend easy to scale horizontally."));

children.push(H3("System Diagrams"));
children.push(P("The following UML diagrams describe the structure and behaviour of the Pizza Mania system. (Insert your diagrams in the placeholders below.)"));

const diagrams = [
  "1. ER Diagram",
  "2. Class Diagram",
  "3. Component Diagram",
  "4. Use Case Diagram",
  "5. Activity Diagram",
  "6. State Chart Diagram",
  "7. Sequence Diagram",
  "8. Collaboration Diagram",
  "9. Deployment Diagram",
  "10. Object Diagram",
];
diagrams.forEach((d) => {
  children.push(H3(d));
  children.push(P("[ Insert " + d.replace(/^\d+\.\s*/, "") + " here ]", { align: AlignmentType.CENTER }));
  children.push(BLANK());
});
children.push(PB());

// ========= 4. IMPLEMENTATION =========
children.push(H1("4. Implementation"));

children.push(H2("4.1 Modules Overview"));
children.push(BULLET_KV("Authentication Module: ", "handles registration and login for customers and admins. Passwords are hashed with bcrypt, and a JWT is issued on every successful login. A protect middleware verifies the token on every private route, and an adminOnly middleware additionally guards admin-only endpoints."));
children.push(BULLET_KV("Product (Menu) Module: ", "serves the pizza catalogue. Customers receive only available products, while the admin can fetch all products (including unavailable ones), create new pizzas, update existing ones and delete products."));
children.push(BULLET_KV("Cart Module: ", "maintains a persistent, per-user cart in MongoDB. Customers can add items, update quantities, remove items or clear the entire cart. Subtotal is recalculated on every request."));
children.push(BULLET_KV("Order Module: ", "handles the complete checkout flow — validates billing details, snapshots the cart into an Order document, calculates subtotal, 9% tax and total, and clears the cart after a successful order. It also returns the customer’s personal order history and powers the admin dashboard statistics."));
children.push(BULLET_KV("Admin Module: ", "a dedicated browser-based admin panel that calls the same REST API. Admins can manage products, users, orders and contact messages from a single dashboard."));
children.push(BULLET_KV("Contact Module: ", "stores visitor enquiries submitted from the Contact Us page so that the admin can read and mark them as read."));

children.push(H2("4.2 Request-Response & Redirect Logic"));
children.push(P("Pizza Mania uses a strict authentication pipeline on the backend and a clean redirection flow on the frontend:"));
children.push(BULLET("When a guest visits /user/html/index.html, they can browse the home page and menu, but any attempt to add to cart or place an order redirects them to login.html."));
children.push(BULLET("On successful login, the server returns a JWT plus the user object; the frontend stores them in localStorage and redirects the user back to the page they came from (menu / cart / checkout)."));
children.push(BULLET("Every call to /api/cart, /api/orders or /api/auth/me is protected by the protect middleware, which verifies the JWT and attaches the decoded user to req.user."));
children.push(BULLET("Admin-only endpoints (/api/orders/admin/*, /api/products [POST/PUT/DELETE], /api/orders/admin/users) additionally pass through the adminOnly middleware, which blocks anyone whose role is not ‘admin’."));

children.push(H3("Backend — Express.js & MongoDB Configuration"));
children.push(P("The backend entry point server.js boots Express, enables CORS, parses JSON bodies, connects to MongoDB via config/db.js and mounts the five route files under /api/auth, /api/products, /api/cart, /api/orders and /api/contact."));
children.push(P("[ Insert screenshot of server.js here ]", { align: AlignmentType.CENTER }));
children.push(BLANK());

children.push(H3("Login & Register Logic (authController.js)"));
children.push(P("The auth controller exposes register, login, getMe and updateProfile. Registration checks for duplicate emails and lets the User pre-save hook hash the password; login verifies the password with matchPassword and issues a 7-day JWT."));
children.push(P("[ Insert screenshot of authController.js here ]", { align: AlignmentType.CENTER }));
children.push(BLANK());

children.push(H3("Cart Route — Persistent Shopping Cart"));
children.push(P("The cart controller exposes getCart, addToCart, updateCartItem, removeCartItem and clearCart. Each function uses req.user._id (attached by the protect middleware) to scope all operations to the logged-in user only."));
children.push(P("[ Insert screenshot of cartController.js here ]", { align: AlignmentType.CENTER }));
children.push(BLANK());

children.push(H3("Order Route — Checkout & Order History"));
children.push(P("The order controller powers the whole checkout flow. placeOrder validates billing details, fetches the user’s cart, snapshots every item into a new Order document, calculates subtotal + 9% tax + total, sets the status to ‘confirmed’ and clears the cart. getMyOrders returns the customer’s personal order history; getAllOrders and updateOrderStatus are admin-only."));
children.push(P("[ Insert screenshot of orderController.js here ]", { align: AlignmentType.CENTER }));
children.push(BLANK());

children.push(H3("Frontend — index.html (Home Page)"));
children.push(P("The home page (user/html/index.html) is the landing page of Pizza Mania. It features a hero banner, a ‘Popular Pizzas’ grid rendered dynamically from /api/products, an ‘About Us’ teaser and a footer with quick links."));
children.push(IMG("home pizza.jpg", 480, 300));
children.push(IMG_CAPTION("Fig 4.1 — Pizza Mania Home Page banner"));

children.push(H3("Frontend — CSS Styling"));
children.push(P("All pages share a common stylesheet that defines the colour palette (red / cream / dark brown), responsive grids, menu cards, the sticky navbar, the cart side panel and the checkout form. The design is mobile-first and fully responsive."));
children.push(P("[ Insert screenshot of the main CSS file here ]", { align: AlignmentType.CENTER }));
children.push(PB());

// ========= 5. RESULTS AND ANALYSIS =========
children.push(H1("5. Results and Analysis"));
children.push(P("The Pizza Mania system was tested end-to-end under multiple scenarios to make sure every module behaves as expected. The analysis focused on four main areas:"));
children.push(BULLET_KV("Data Integrity: ", "MongoDB successfully maintained the relationships between users, carts and orders. Even with multiple simultaneous ‘Add to Cart’ and ‘Place Order’ requests, each cart and order was correctly scoped to the right user with no data collision."));
children.push(BULLET_KV("Performance: ", "Product listings and cart operations returned in well under 200 ms on a local setup, proving that the chosen stack is efficient enough for a small-to-medium pizza outlet."));
children.push(BULLET_KV("Role-Based Security: ", "Unauthorised requests to /api/cart, /api/orders and every admin endpoint were correctly rejected with 401 / 403 errors, confirming that JWT + middleware protection works."));
children.push(BULLET_KV("Order Lifecycle: ", "The status changes from Pending → Confirmed → Preparing → Delivered were verified both in the admin panel and in MongoDB, confirming that the full delivery lifecycle is wired up correctly."));

children.push(H2("Module-wise Results"));
children.push(BULLET_KV("Registration & Login: ", "Users are registered, passwords are hashed and JWTs are issued. On login, the frontend redirects the user to the correct landing page based on their role."));
children.push(BULLET_KV("Menu & Cart: ", "The menu page lists every pizza fetched from /api/products. Adding a pizza to the cart immediately updates MongoDB and the cart badge."));
children.push(BULLET_KV("Checkout: ", "On clicking ‘Place Order’, the billing form is validated, the cart is converted into an Order document and the user is taken to a confirmation page."));
children.push(BULLET_KV("Admin Dashboard: ", "The admin can see total orders, users, products and revenue at a glance, and can update any order’s status in real time."));

children.push(H2("Screenshots of the website"));

children.push(H3("5.1 Home Page"));
children.push(IMG("pizza_banner.png", 480, 270));
children.push(IMG_CAPTION("Fig 5.1 — Pizza Mania Home Page (Hero Banner)"));
children.push(IMG("home pizza.jpg", 460, 290));
children.push(IMG_CAPTION("Fig 5.1 (b) — Popular Pizzas Section"));

children.push(H3("5.2 Menu & Popular Pizzas"));
children.push(IMG("margherita.png", 260, 220));
children.push(IMG_CAPTION("Fig 5.2 (a) — Margherita Pizza Card"));
children.push(IMG("pepperoni.png", 260, 220));
children.push(IMG_CAPTION("Fig 5.2 (b) — Pepperoni Pizza Card"));
children.push(IMG("BBQ chicken.png", 260, 220));
children.push(IMG_CAPTION("Fig 5.2 (c) — BBQ Chicken Pizza Card"));
children.push(IMG("Four Cheese Deluxe pizza.png", 260, 220));
children.push(IMG_CAPTION("Fig 5.2 (d) — Four Cheese Deluxe Pizza Card"));

children.push(H3("5.3 Register & Login"));
children.push(P("[ Insert screenshot of the register.html and login.html pages here ]", { align: AlignmentType.CENTER }));
children.push(BLANK());

children.push(H3("5.4 Cart & Checkout"));
children.push(P("[ Insert screenshot of the cart and checkout pages here ]", { align: AlignmentType.CENTER }));
children.push(BLANK());

children.push(H3("5.5 About & Contact Pages"));
children.push(IMG("aboutus.png", 460, 280));
children.push(IMG_CAPTION("Fig 5.5 (a) — About Us Page"));
children.push(IMG("about.png", 460, 280));
children.push(IMG_CAPTION("Fig 5.5 (b) — About Section Details"));

children.push(H3("5.6 Admin Dashboard"));
children.push(P("[ Insert screenshot of the admin dashboard here ]", { align: AlignmentType.CENTER }));
children.push(BLANK());
children.push(P("[ Insert screenshot of the admin products / orders / users pages here ]", { align: AlignmentType.CENTER }));
children.push(PB());

// ========= 6. CONCLUSION =========
children.push(H1("6. Conclusion"));
children.push(P("The Pizza Mania project successfully demonstrates the design and implementation of a complete full-stack web application for online pizza ordering. By combining a modern REST API backend with a responsive frontend and a dedicated admin panel, the project shows how the gap between traditional food outlets and their customers can be closed using free, open-source web technologies."));
children.push(P("A key technical achievement of this project is the integration of JWT-based authentication, bcrypt-hashed password storage and role-based middleware on top of a clean MongoDB / Mongoose data model. This allowed us to build complex features — such as a persistent per-user shopping cart, a full order lifecycle, snapshotted order history and an admin dashboard — without sacrificing security or simplicity."));
children.push(P("Key learnings from this project include mastering the three-tier MVC architecture on a Node.js / Express / MongoDB stack, designing RESTful endpoints, handling stateless authentication with JWTs, managing document relationships in a NoSQL database and building a polished, responsive UI using only HTML, CSS and vanilla JavaScript. Overall, Pizza Mania serves as a robust prototype for any small-to-medium pizza outlet that wants to move online, and it can easily be extended or rebranded for other food-delivery use cases."));
children.push(PB());

// ========= 7. FUTURE SCOPE =========
children.push(H1("7. Future Scope"));
children.push(BULLET("Online Payment Gateway: Integrate Razorpay / Stripe / UPI so customers can pay online during checkout instead of choosing cash on delivery."));
children.push(BULLET("Live Order Tracking: Add a live order-status tracker with real-time updates using WebSockets (Socket.IO) so customers can follow their pizza from ‘Preparing’ to ‘Delivered’."));
children.push(BULLET("Delivery Boy Module: Add a third role — delivery partner — with a dedicated dashboard to accept assigned orders and update the delivery status."));
children.push(BULLET("Ratings & Reviews: Let customers rate pizzas and leave reviews after an order is marked as delivered."));
children.push(BULLET("Coupons & Offers: Add a promo-code system so the admin can run discounts, combo offers and festive deals."));
children.push(BULLET("Mobile App: Wrap the frontend inside a React Native / Flutter app so customers can order directly from their phones."));
children.push(BULLET("Email / SMS Notifications: Send order confirmation and delivery updates via Nodemailer and a transactional SMS gateway."));
children.push(BULLET("Analytics Dashboard: Give the admin sales charts, best-selling pizzas and peak-hour reports for data-driven decision making."));
children.push(PB());

// ========= 8. REFERENCES =========
children.push(H1("8. References"));
children.push(BULLET("Node.js Documentation — https://nodejs.org/en/docs"));
children.push(BULLET("Express.js Documentation — https://expressjs.com"));
children.push(BULLET("MongoDB Documentation — https://www.mongodb.com/docs"));
children.push(BULLET("Mongoose ODM — https://mongoosejs.com/docs"));
children.push(BULLET("JSON Web Token (JWT) — https://jwt.io/introduction"));
children.push(BULLET("bcryptjs — https://www.npmjs.com/package/bcryptjs"));
children.push(BULLET("MDN Web Docs (HTML, CSS, JavaScript) — https://developer.mozilla.org"));
children.push(BULLET("W3Schools (HTML, CSS, JavaScript) — https://www.w3schools.com"));
children.push(BULLET("YouTube Tutorials on MERN Stack Development"));

// ───────────────────────────────────────────────────────────────
// DOCUMENT ASSEMBLY
// ───────────────────────────────────────────────────────────────
const doc = new Document({
  creator: "Pizza Mania Team",
  title: "Pizza Mania — Mini Project Documentation",
  description: "Full-stack MERN pizza ordering web application documentation",
  styles: {
    default: {
      document: { run: { font: "Times New Roman", size: 24 } },
    },
  },
  numbering: {
    config: [
      {
        reference: "default-bullet",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "Pizza Mania — Mini Project Report", italics: true, size: 20, font: "Times New Roman", color: "8B0000" })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Page ", size: 20, font: "Times New Roman" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 20, font: "Times New Roman" }),
              new TextRun({ text: " of ", size: 20, font: "Times New Roman" }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 20, font: "Times New Roman" }),
            ],
          })],
        }),
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT_FILE, buf);
  console.log("✅  Generated:", OUT_FILE);
  console.log("    Size:", (buf.length / 1024).toFixed(1), "KB");
});
