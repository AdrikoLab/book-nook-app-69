import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Bookflow" },
      {
        name: "description",
        content:
          "The terms that apply when you use Bookflow to take bookings, manage your team and grow your service business.",
      },
      { property: "og:title", content: "Bookflow Terms of Service" },
      {
        property: "og:description",
        content: "Plans, billing, responsible use and account terms for Bookflow, a product of Adrikolabs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

const EFFECTIVE_DATE = "3 November 2026";

const sections = [
  {
    id: "welcome",
    title: "1. Welcome to Bookflow",
    body: [
      "Bookflow is an appointment management and customer engagement platform that helps businesses manage bookings, organize their services, connect with their customers and grow. Bookflow is developed and operated by Adrikolabs.",
      "By creating an account or using Bookflow, you agree to these terms. They are written to be clear and fair, and they apply to every business owner, team member and visitor who uses the platform.",
    ],
  },
  {
    id: "account",
    title: "2. Your Bookflow Account",
    body: [
      "When you create an account you get your own workspace where you can set up your business profile, add your services, invite your team members and manage your bookings. You are in control of your workspace: you can update your business details, adjust your services and manage your team at any time.",
      "Please keep your sign-in details private and your business and contact information accurate, so your customers can always reach you and your bookings run smoothly. If you believe someone has accessed your account without permission, contact us and we will help you secure it.",
    ],
  },
  {
    id: "billing",
    title: "3. Plans, Subscriptions and Billing",
    body: [
      "Bookflow offers a free trial and several paid plans so you can choose what fits your business. Paid plans are billed monthly in advance, and the price, staff limits and features of each plan are shown clearly on the pricing page before you pay.",
      "New businesses start with a 7-day free trial so you can explore the platform fully before deciding. When your trial ends, you can choose the plan that suits you to keep your workspace active. You can upgrade to a larger plan at any time as your business grows.",
      "We believe in pricing transparency: the amount you see is the amount you pay, and we will always tell you before anything about your plan's pricing changes.",
    ],
  },
  {
    id: "managing-subscription",
    title: "4. Managing Your Subscription",
    body: [
      "You can cancel your subscription at any time — there are no lock-in contracts. When you cancel, your workspace stays fully available until the end of the period you have already paid for.",
      "Because plans are billed in advance, fees already charged for the current period are not refunded for partial periods. If you believe a payment was made in error, contact us and we will review it with you fairly.",
    ],
  },
  {
    id: "responsible-use",
    title: "5. Responsible Use of Bookflow",
    body: [
      "Bookflow is built for professional businesses, and we ask that you use it professionally: communicate respectfully with your customers, send messages only to people who have booked with you or agreed to hear from you, and use the platform for lawful activities.",
      "Every business on Bookflow is independent. Please respect other businesses on the platform and use only your own workspace and data.",
    ],
  },
  {
    id: "your-data",
    title: "6. Your Business Data and Customer Information",
    body: [
      "Your business content and customer records belong to you. Bookflow does not claim ownership of the information you add to your workspace, and we use it only to provide the service to you — running your booking page, sending your reminders and producing your reports.",
      "As a business, you are responsible for managing your customers' information responsibly and having permission to contact the customers you add. On our side, each business's data is kept separate at the database level, and we are committed to protecting the information entrusted to us.",
      "Bookflow is the platform provider; the services booked through Bookflow are provided by the individual businesses, who are responsible for delivering them.",
    ],
  },
  {
    id: "availability",
    title: "7. Platform Availability and Improvements",
    body: [
      "We work continuously to keep Bookflow fast, reliable and available, and we regularly release updates, new features and improvements — many of them suggested by businesses like yours.",
      "Occasionally the platform may be briefly unavailable for maintenance or an unexpected issue. When this happens we work to restore service quickly, and where maintenance is planned we aim to schedule it at quiet times. We appreciate your patience as we keep improving Bookflow for you.",
    ],
  },
  {
    id: "support",
    title: "8. Customer Support",
    body: [
      "If you ever need help — setting up your page, understanding a feature, or sorting out a payment — our support team is happy to assist. You can reach us through the contact page or the support section of your dashboard.",
      "Your feedback and suggestions are genuinely welcome. Much of what Bookflow is today comes from listening to the businesses that use it.",
    ],
  },
  {
    id: "changes",
    title: "9. Changes to These Terms",
    body: [
      "As Bookflow grows, we may update these terms from time to time. When we make meaningful changes, we will let you know through the platform or by email before they take effect, and the latest version will always be available on this page with its effective date.",
      "Continuing to use Bookflow after an update means you accept the updated terms.",
    ],
  },
  {
    id: "closure",
    title: "10. Account Closure and Data Management",
    body: [
      "You can close your account at any time by contacting us. Where available, we will help you export your business and customer records before closure, so you never lose the information your business depends on.",
      "After closure, we retain records only for as long as needed to meet legal and accounting obligations, and then delete them.",
    ],
  },
  {
    id: "commitment",
    title: "11. Our Commitment",
    body: [
      "Bookflow exists to help your business thrive. Our commitment is to give you dependable tools, honest pricing and real human support — so you can turn first-time customers into regular customers.",
    ],
  },
];

function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span>Terms of Service</span>
        </nav>

        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">Effective date: {EFFECTIVE_DATE}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          These terms explain how Bookflow works for you and your business. We have written them in plain language so
          they are easy to read. Related documents:{" "}
          <Link to="/privacy" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <a href="#managing-subscription" className="font-medium text-primary hover:underline">
            Refund and Cancellation Policy
          </a>
          .
        </p>

        <nav aria-label="Table of contents" className="surface-panel mt-8 p-5">
          <h2 className="text-sm font-semibold">On this page</h2>
          <ol className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-muted-foreground hover:text-primary">
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-14 border-t border-border pt-8 text-center">
          <p className="font-display text-lg font-semibold">
            Bookflow – Manage Bookings. Build Relationships. Grow Your Business.
          </p>
          <p className="mt-2 text-sm italic text-muted-foreground">A product of Adrikolabs.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
