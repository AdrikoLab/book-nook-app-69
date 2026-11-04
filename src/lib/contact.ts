export const CONTACT_PHONE = "+256770890961";
export const CONTACT_EMAIL = "adrikoceasaralpha@gmail.com";
export const PAYMENT_NUMBER = "+256770890961";
export const PAYMENT_NAME = "Adriko Ceasar";

export function whatsappLink(text: string) {
  return `https://wa.me/${CONTACT_PHONE.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

/** WhatsApp message for renewing/unlocking a business, with payment instructions. */
export function renewalMessage(opts: {
  businessName?: string | null | undefined;
  businessId?: string | null | undefined;
  planName?: string | undefined;
  price?: string | undefined;
}) {
  const lines = [
    "Hi BookFlow, I'd like to renew my subscription.",
    "",
    "*Business to unlock:*",
    `Name: ${opts.businessName ?? "—"}`,
    `ID: ${opts.businessId ?? "—"}`,
  ];
  if (opts.planName) lines.push(`Plan: ${opts.planName}${opts.price ? ` (${opts.price}/month)` : ""}`);
  lines.push(
    "",
    "*Payment details:*",
    `Send payment to: ${PAYMENT_NUMBER}`,
    `Name: ${PAYMENT_NAME}`,
    "",
    "I understand my account will be reactivated once the payment is received.",
  );
  return lines.join("\n");
}
