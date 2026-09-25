/**
 * Development/initial content. Services, solutions and FAQs describe what
 * Cyber Nexa Solution offers and are safe to publish after review.
 * Projects and blog posts are SAMPLE content (isSample = true) and are
 * labelled as such on the public site — replace them with real work.
 * No testimonials, team members or client claims are seeded on purpose.
 */

export const services = [
  {
    title: "Web Development", icon: "Globe",
    shortDescription: "Fast, secure company websites and landing pages that explain what you do and turn visitors into enquiries.",
    description: "Your website is often the first conversation a customer has with your business. We build sites that load quickly, read clearly on every device and are easy for your team to update.\n\nEvery site includes a content management system, search-engine foundations, analytics and a contact flow that routes enquiries to the right person.",
    features: ["Responsive design for phones, tablets and desktops", "Content management your team can use", "Technical SEO and structured data", "Contact and lead capture forms", "Performance and accessibility checks", "Hosting, SSL and deployment setup"],
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL"],
  },
  {
    title: "Web Application Development", icon: "AppWindow",
    shortDescription: "Custom browser-based applications: portals, dashboards and internal tools built around your workflow.",
    description: "When a spreadsheet or generic SaaS tool stops fitting, a web application can. We design and build secure, multi-user applications — customer portals, booking systems, internal dashboards and more — with role-based access, audit trails and integrations.",
    features: ["User accounts and role-based permissions", "Dashboards and reporting", "Workflow and approval flows", "Integrations with existing systems", "Automated testing", "Documentation and handover"],
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Prisma", "Docker"],
  },
  {
    title: "Mobile App Development", icon: "Smartphone",
    shortDescription: "iOS and Android apps for customers and field teams, built from one shared codebase.",
    description: "We build cross-platform mobile apps that feel native on both iOS and Android — for customers ordering and booking, or for staff working away from a desk. Apps connect to your existing back office and support offline use where it matters.",
    features: ["iOS and Android from one codebase", "Push notifications", "Offline-friendly data sync", "Secure sign-in", "App Store and Play Store publishing", "Crash and usage monitoring"],
    technologies: ["React Native", "Expo", "TypeScript", "Firebase", "REST & GraphQL APIs"],
  },
  {
    title: "AI Solutions", icon: "BrainCircuit",
    shortDescription: "Practical AI that reads documents, answers questions and speeds up repetitive decisions.",
    description: "We help you find the places where AI saves real time — summarising documents, extracting data from forms, drafting replies, classifying requests — and build it into the tools your team already uses, with human review where accuracy matters.",
    features: ["Use-case discovery workshop", "Document understanding and data extraction", "Retrieval over your own knowledge base", "Human-in-the-loop review", "Cost and quality monitoring", "Data privacy controls"],
    technologies: ["Large language models", "Python", "Vector search", "Node.js", "OCR"],
  },
  {
    title: "AI Chatbots", icon: "MessagesSquare",
    shortDescription: "Assistants that answer customer questions from your own content and hand over to a person when needed.",
    description: "A well-built chatbot answers common questions instantly, day or night, using your own policies, products and FAQs — and knows when to pass the conversation to your team. We build assistants for websites, WhatsApp and internal help desks.",
    features: ["Answers grounded in your content", "Website, WhatsApp and internal channels", "Hand-over to a human agent", "Lead capture into your CRM", "Conversation analytics", "Multilingual support"],
    technologies: ["Large language models", "Retrieval-augmented generation", "WhatsApp Business API", "Node.js"],
  },
  {
    title: "Custom Software", icon: "Code2",
    shortDescription: "Software designed for the way your business actually operates, not the other way round.",
    description: "Some processes are unique to your business and give you an edge. We turn them into reliable software — from a single-purpose tool to a complete operations platform — with clear milestones and regular demos so you always know where the project stands.",
    features: ["Requirements and process mapping", "Clickable prototypes before development", "Iterative delivery with regular demos", "Security built in from the start", "Maintenance and support plans"],
    technologies: ["TypeScript", "Node.js", "Python", "PostgreSQL", "Cloud infrastructure"],
  },
  {
    title: "CRM Systems", icon: "Users",
    shortDescription: "Track leads, customers and follow-ups in one place so no opportunity slips through.",
    description: "We build and configure CRM systems that match your sales process: lead capture from your website and campaigns, pipelines, reminders, email history and reports your managers will actually use.",
    features: ["Lead capture from web forms", "Sales pipeline stages", "Follow-up reminders and tasks", "Customer history and notes", "Team assignment and permissions", "Reports and exports"],
    technologies: ["React", "Node.js", "PostgreSQL", "Email integrations"],
  },
  {
    title: "ERP Systems", icon: "Building2",
    shortDescription: "Connect finance, inventory, purchasing and HR so everyone works from the same numbers.",
    description: "An ERP ties your core operations together. We implement modular ERP systems — starting with the modules you need most — and integrate them with the tools you already rely on, so data is entered once and trusted everywhere.",
    features: ["Inventory and purchasing", "Sales orders and invoicing", "Accounting integration", "HR and payroll modules", "Multi-branch support", "Role-based dashboards"],
    technologies: ["Node.js", "PostgreSQL", "React", "Accounting system APIs"],
  },
  {
    title: "POS Systems", icon: "ShoppingCart",
    shortDescription: "Point-of-sale for retail and restaurants, connected to stock, customers and reporting.",
    description: "Fast checkout matters, and so does everything behind it. Our POS systems handle sales, returns, discounts and multiple payment methods, keep stock up to date across branches, and give owners live reports from anywhere.",
    features: ["Fast checkout on tablets or terminals", "Barcode and receipt printer support", "Real-time stock updates", "Multi-branch reporting", "Offline mode", "Customer loyalty"],
    technologies: ["React", "Electron", "Node.js", "PostgreSQL"],
  },
  {
    title: "Business Management Systems", icon: "LayoutDashboard",
    shortDescription: "One system for the day-to-day running of your business: jobs, staff, customers and reports.",
    description: "For growing businesses juggling several tools, we build a single management system covering the essentials — jobs or orders, scheduling, staff, customers, documents and reporting — shaped around how your team works.",
    features: ["Job and order tracking", "Staff scheduling", "Customer records", "Document management", "Approvals", "Management reporting"],
    technologies: ["React", "Node.js", "PostgreSQL", "Cloud hosting"],
  },
  {
    title: "Automation", icon: "Workflow",
    shortDescription: "Remove repetitive manual work: data entry, report building, notifications and hand-offs.",
    description: "We look for the tasks your team repeats every day and automate them — syncing data between systems, generating reports, sending reminders and routing requests — so people can focus on work that needs judgement.",
    features: ["Process review to find time savings", "System-to-system data sync", "Scheduled reports", "Email and WhatsApp notifications", "Error alerts and monitoring"],
    technologies: ["Node.js", "Python", "n8n", "Webhooks", "Cloud functions"],
  },
  {
    title: "API Development", icon: "Plug",
    shortDescription: "Secure, documented APIs that let your systems, apps and partners exchange data reliably.",
    description: "We design REST and GraphQL APIs with clear documentation, authentication, rate limiting and versioning — ready for your own apps, partners or public developers.",
    features: ["REST and GraphQL design", "Authentication and API keys", "Rate limiting and monitoring", "OpenAPI documentation", "Versioning strategy", "Automated tests"],
    technologies: ["Node.js", "TypeScript", "OpenAPI", "PostgreSQL", "Redis"],
  },
  {
    title: "System Integrations", icon: "Network",
    shortDescription: "Connect payment gateways, accounting, e-commerce, messaging and legacy systems.",
    description: "Disconnected systems create double entry and errors. We integrate the tools you rely on — payment gateways, accounting software, e-commerce platforms, messaging services and older in-house systems — so information flows automatically.",
    features: ["Payment gateway integration", "Accounting and ERP connectors", "E-commerce platform sync", "SMS, email and WhatsApp", "Legacy system bridges", "Monitoring and retries"],
    technologies: ["REST APIs", "Webhooks", "Message queues", "Node.js"],
  },
  {
    title: "UI/UX Design", icon: "PenTool",
    shortDescription: "Research-led interface design that makes software easy to learn and pleasant to use.",
    description: "Good design reduces training time and support requests. We interview users, map their tasks and prototype interfaces you can click through and test before any code is written.",
    features: ["User research and interviews", "User flows and wireframes", "Interactive prototypes", "Design systems", "Usability testing", "Accessibility review"],
    technologies: ["Figma", "Prototyping", "Design systems"],
  },
  {
    title: "Cloud Solutions", icon: "Cloud",
    shortDescription: "Reliable, secure hosting with backups, monitoring and costs you can predict.",
    description: "We move applications to the cloud, set up automated deployments and backups, and monitor performance and costs — so your systems stay online and your team isn't woken at 3 a.m.",
    features: ["Cloud migration", "Automated deployments (CI/CD)", "Backups and disaster recovery", "Monitoring and alerting", "Security hardening", "Cost optimisation"],
    technologies: ["AWS", "Google Cloud", "Docker", "Vercel", "Cloudflare"],
  },
];

export const solutions = [
  { title: "Restaurant Management", icon: "UtensilsCrossed", industry: "Hospitality",
    summary: "Orders, tables, kitchen tickets, delivery and stock in one connected system.",
    description: "Run the front of house and the kitchen from one system. Orders flow from tables, counter and delivery apps straight to the kitchen display, stock is deducted as dishes are sold, and owners see sales and food cost by branch.",
    challenges: ["Orders lost between waiters and kitchen", "Stock and wastage hard to track", "Delivery orders managed on separate tablets"],
    features: ["Table and counter ordering", "Kitchen display system", "Delivery platform integration", "Recipe-based stock deduction", "Branch reporting"],
    technologies: ["POS", "Tablet apps", "Cloud reporting"] },
  { title: "Retail Management", icon: "Store", industry: "Retail",
    summary: "POS, inventory, suppliers and customer loyalty across one or many stores.",
    description: "Keep every shelf and every branch in sync. Sales update stock instantly, reorder points trigger purchase orders, and loyalty programmes reward repeat customers.",
    challenges: ["Stock counts that never match", "No single view across branches", "Slow checkout at peak times"],
    features: ["Fast checkout", "Multi-store inventory", "Purchase orders", "Loyalty and promotions", "Sales analytics"],
    technologies: ["POS", "Barcode scanning", "Cloud sync"] },
  { title: "Travel Management", icon: "Plane", industry: "Travel & Tourism",
    summary: "Bookings, itineraries, visas, payments and customer communication for travel agencies.",
    description: "Manage packages, bookings and customer documents in one place, generate itineraries and invoices automatically, and keep travellers informed by email and WhatsApp.",
    challenges: ["Bookings scattered across emails and spreadsheets", "Manual itinerary and invoice creation", "Tracking payments and visa documents"],
    features: ["Package and booking management", "Itinerary generation", "Payment tracking", "Document checklist", "Customer notifications"],
    technologies: ["Web application", "Payment gateways", "WhatsApp API"] },
  { title: "Education Platforms", icon: "GraduationCap", industry: "Education",
    summary: "Admissions, classes, attendance, fees and online learning for schools and academies.",
    description: "From admission forms to report cards, give administrators, teachers, students and parents one platform — with online classes and course material where needed.",
    challenges: ["Paper-based admissions and attendance", "Fee collection follow-ups", "Parents lacking visibility"],
    features: ["Online admissions", "Attendance and timetables", "Fee management", "Learning management", "Parent portal"],
    technologies: ["Web & mobile apps", "Video integration", "Payment gateways"] },
  { title: "Healthcare Systems", icon: "HeartPulse", industry: "Healthcare",
    summary: "Appointments, patient records, billing and reminders for clinics and practices.",
    description: "Reduce no-shows and paperwork with online booking, reminders, digital patient records and billing — built with privacy and access control as first principles.",
    challenges: ["Missed appointments", "Paper patient files", "Billing errors"],
    features: ["Online appointment booking", "Patient records", "Prescriptions and notes", "Billing and invoicing", "Automated reminders"],
    technologies: ["Web application", "SMS/WhatsApp reminders", "Encrypted storage"] },
  { title: "Inventory Management", icon: "Package", industry: "Wholesale & Distribution",
    summary: "Real-time stock across warehouses, with purchasing, transfers and batch tracking.",
    description: "Know what you have, where it is and when to reorder. Track stock movements, batches and expiry dates across locations, with barcode scanning and supplier purchase orders.",
    challenges: ["Stock-outs and overstock", "Manual stock counts", "No batch or expiry tracking"],
    features: ["Multi-warehouse stock", "Barcode scanning", "Transfers and adjustments", "Batch and expiry tracking", "Reorder alerts"],
    technologies: ["Web & mobile apps", "Barcode scanners", "Cloud database"] },
  { title: "CRM", icon: "Contact", industry: "Sales & Services",
    summary: "Capture every lead, track every conversation and never miss a follow-up.",
    description: "A CRM shaped around your sales process — leads from your website and campaigns, clear pipeline stages, reminders and reports that show what's working.",
    challenges: ["Leads forgotten in inboxes", "No visibility of the sales pipeline", "Customer history in people's heads"],
    features: ["Web lead capture", "Pipeline management", "Tasks and reminders", "Email history", "Sales reports"],
    technologies: ["Web application", "Email integration", "Analytics"] },
  { title: "POS", icon: "CreditCard", industry: "Retail",
    summary: "Reliable point-of-sale with offline mode, multiple payment methods and live reporting.",
    description: "A point-of-sale system your cashiers can learn in minutes, that keeps selling when the internet drops and syncs sales, stock and reports as soon as it's back.",
    challenges: ["Checkout stops when the internet drops", "End-of-day reconciliation takes hours", "No live sales view for owners"],
    features: ["Offline-first checkout", "Cash, card and wallet payments", "Shift and cash drawer management", "Receipts and returns", "Live dashboard"],
    technologies: ["Desktop & tablet POS", "Cloud sync", "Hardware integration"] },
  { title: "AI Customer Support", icon: "Bot", industry: "Customer Service",
    summary: "An AI assistant that answers routine questions and routes the rest to your team.",
    description: "Answer common questions instantly across your website and WhatsApp using your own knowledge base, with seamless hand-over to a human and a full conversation history.",
    challenges: ["Repetitive questions overwhelm staff", "Slow replies outside office hours", "Inconsistent answers"],
    features: ["Knowledge-base answers", "Website and WhatsApp channels", "Human hand-over", "Ticket creation", "Quality monitoring"],
    technologies: ["Large language models", "Retrieval-augmented generation", "Help desk integration"] },
  { title: "Booking Systems", icon: "CalendarCheck", industry: "Services",
    summary: "Online booking, payments and reminders for appointments, rooms, classes or equipment.",
    description: "Let customers book and pay online 24/7 while your team manages availability, staff and resources from one calendar.",
    challenges: ["Phone-only bookings", "Double bookings", "No-shows without deposits"],
    features: ["Online booking pages", "Deposits and payments", "Staff and resource calendars", "Reminders", "Booking analytics"],
    technologies: ["Web application", "Payment gateways", "Calendar sync"] },
];

export const projects = [
  {
    title: "Multi-branch Restaurant Operations Platform (Sample)", category: "Business Systems", clientName: null, isSample: true, featured: true,
    summary: "Sample case study showing how we would structure a restaurant POS, kitchen display and stock platform.",
    description: "This is an illustrative example of the kind of project we deliver. It is not a real client engagement — replace it with your own case studies from the admin panel.",
    problem: "A restaurant group with several branches takes orders on paper, reconciles cash by hand each night and cannot see food cost or stock levels until month end.",
    solution: "A tablet POS connected to kitchen displays in each branch, recipe-based stock deduction, and a cloud dashboard showing sales, top dishes and stock alerts across branches in real time.",
    technologies: ["React", "Node.js", "PostgreSQL", "Tablet POS"],
    features: ["Table and takeaway ordering", "Kitchen display screens", "Recipe-based stock", "Branch dashboard"],
  },
  {
    title: "AI Support Assistant for a Service Business (Sample)", category: "AI Solutions", clientName: null, isSample: true, featured: true,
    summary: "Sample case study of a website and WhatsApp assistant answering questions from a company knowledge base.",
    description: "Illustrative example only — not a real client project. It shows how an AI assistant project is scoped and delivered.",
    problem: "A service company receives hundreds of repetitive questions each week about pricing, availability and policies, delaying replies to customers who need a person.",
    solution: "An AI assistant grounded in the company's own documents answers routine questions on the website and WhatsApp, captures leads, and hands complex conversations to staff with full context.",
    technologies: ["LLM", "Retrieval-augmented generation", "WhatsApp Business API", "Node.js"],
    features: ["Knowledge-base answers", "Lead capture", "Human hand-over", "Conversation analytics"],
  },
  {
    title: "Travel Agency Booking & CRM Portal (Sample)", category: "Web Applications", clientName: null, isSample: true, featured: false,
    summary: "Sample case study of a booking, itinerary and customer management portal for a travel agency.",
    description: "Illustrative example only — not a real client project.",
    problem: "Bookings, payments and customer documents live across email threads and spreadsheets, making it slow to prepare itineraries and easy to miss payment deadlines.",
    solution: "A web portal where agents manage packages and bookings, generate itineraries and invoices in one click, track payments and document checklists, and notify travellers automatically.",
    technologies: ["React", "TypeScript", "PostgreSQL", "Payment gateway"],
    features: ["Package builder", "Itinerary PDFs", "Payment tracking", "Customer notifications"],
  },
];

export const faqs = [
  { category: "Working with us", question: "How does a project usually start?", answer: "With a free discovery call. We learn about your business, the problem you want to solve and any constraints. Afterwards we send a written proposal with scope, timeline and cost." },
  { category: "Working with us", question: "Do you work with small businesses?", answer: "Yes. Many of our projects start small — a website, a single automation or a focused internal tool — and grow as the business does." },
  { category: "Working with us", question: "Can you work with our existing systems?", answer: "Usually, yes. We integrate with accounting software, payment gateways, e-commerce platforms and many in-house systems through their APIs or, where needed, custom connectors." },
  { category: "Pricing & timelines", question: "How much does a project cost?", answer: "It depends on scope. After discovery we provide a fixed-price proposal for clearly defined work, or a monthly retainer for ongoing development. You'll always know the cost before work begins." },
  { category: "Pricing & timelines", question: "How long does it take?", answer: "A business website typically takes 3–6 weeks. Web and mobile applications usually take 2–6 months depending on complexity. We deliver in stages so you see progress every one to two weeks." },
  { category: "Ownership & support", question: "Who owns the code and data?", answer: "You do. On final payment, the source code, designs and data belong to your business, and we hand over documentation and access." },
  { category: "Ownership & support", question: "Do you provide support after launch?", answer: "Yes. We offer support and maintenance plans covering security updates, monitoring, backups, bug fixes and improvements." },
  { category: "Security & AI", question: "How do you keep our data secure?", answer: "Security is part of every project: encrypted connections, hashed passwords, role-based access, audit logs, regular backups and hosting with reputable cloud providers." },
  { category: "Security & AI", question: "Is our data used to train AI models?", answer: "No. We configure AI providers so your data isn't used for model training, and we can keep sensitive data out of AI processing entirely where required." },
];

export const blogCategories = [
  { name: "AI & Automation", slug: "ai-automation", description: "Practical uses of AI and automation in business." },
  { name: "Business Systems", slug: "business-systems", description: "CRM, ERP, POS and the systems that run a business." },
  { name: "Web & Mobile", slug: "web-mobile", description: "Websites, web applications and mobile apps." },
];

export const blogPosts = [
  {
    title: "How AI Is Changing Everyday Business Operations", slug: "how-ai-is-changing-business", category: "ai-automation", tags: ["AI", "Operations"],
    excerpt: "Beyond the hype: the practical, low-risk places where AI is already saving small and medium businesses time.",
    content: `*This is a sample article included with the platform. Edit or replace it from the admin panel.*

AI gets most of its attention from dramatic demos, but its most useful business applications are quiet and practical. They take repetitive work off people's desks and give them time back for the parts of the job that need judgement.

## Start with the repetitive work

Look for tasks that are frequent, rule-based and text-heavy:

- Reading incoming emails or forms and routing them to the right person
- Extracting data from invoices, receipts or application forms
- Drafting first replies to common customer questions
- Summarising long documents or meeting notes

## Keep a person in the loop

For anything customer-facing or financial, design the system so AI proposes and a person approves. This keeps quality high while still saving most of the time.

## Measure before and after

Track how long the task took before, how long it takes now and how often the AI's output needs correcting. These numbers tell you whether to expand the system or adjust it.

## Protect your data

Choose providers and settings that don't use your data for training, keep sensitive fields out of prompts where possible, and log what the system does.

AI is most valuable when it's treated as another well-designed tool in your business, not a replacement for understanding how your business works.`,
  },
  {
    title: "Spreadsheets to Systems: Signs Your Business Needs a CRM", slug: "signs-your-business-needs-a-crm", category: "business-systems", tags: ["CRM", "Sales"],
    excerpt: "If leads live in inboxes and follow-ups live in someone's memory, it may be time for a proper CRM.",
    content: `*This is a sample article included with the platform. Edit or replace it from the admin panel.*

Spreadsheets are a great way to start tracking customers. But as a business grows, a few warning signs appear.

## Leads go missing

Enquiries arrive by email, phone, website and social media. If there's no single place they all land, some will be forgotten.

## Nobody knows the pipeline

Ask "how many deals are we likely to close this month?" If answering means calling three people, you need a shared pipeline.

## Customer history leaves with employees

When a salesperson leaves, their notes and relationships often leave too. A CRM keeps that history with the business.

## What to look for

A good CRM should capture leads automatically, make the next action obvious, and produce reports without manual work. Most importantly, it should match how your team actually sells — which is why many businesses choose a CRM configured or built around their process.`,
  },
  {
    title: "What Makes a Business Website Actually Work", slug: "what-makes-a-business-website-work", category: "web-mobile", tags: ["Websites", "SEO"],
    excerpt: "A good-looking website isn't enough. Here's what separates sites that generate enquiries from sites that just exist.",
    content: `*This is a sample article included with the platform. Edit or replace it from the admin panel.*

Most business websites look fine. Far fewer generate steady enquiries. The difference is usually in the fundamentals.

## Clear, specific messaging

Visitors should understand what you do, who it's for and why you're different within a few seconds.

## Speed

Every extra second of loading costs visitors, especially on mobile networks. Optimise images, keep scripts lean and use a good host.

## An obvious next step

Each page should make it easy to take action: call, book, request a quote or start a project.

## Proof and trust

Real case studies, clear contact details and a physical presence build credibility. Invented testimonials do the opposite.

## Maintained content

A site your team can update easily stays accurate. A content management system turns the website from a one-off project into a living asset.`,
  },
];
