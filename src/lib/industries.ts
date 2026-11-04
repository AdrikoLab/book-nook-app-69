/** Central industry configuration: every industry-specific word comes from here. */
export type Industry = {
  key: string;
  category: string; // value stored in businesses.category
  staffSingular: string;
  staffPlural: string;
  staffRoleHint: string;
  serviceLabel: string;
  welcomeLine: string;
  chooseStaffTitle: string;
};

export const INDUSTRIES: Industry[] = [
  { key: "salon", welcomeLine: "Relax, refresh and let us take care of you.", category: "Salon & Spa", staffSingular: "Stylist", staffPlural: "Stylists", staffRoleHint: "Stylist, nail tech, therapist…", serviceLabel: "Treatment", chooseStaffTitle: "Choose your stylist" },
  { key: "barbershop", welcomeLine: "Fresh cuts and sharp looks, booked in seconds.", category: "Barbershop", staffSingular: "Barber", staffPlural: "Barbers", staffRoleHint: "Barber, senior barber…", serviceLabel: "Cut", chooseStaffTitle: "Choose your barber" },
  { key: "clinic", welcomeLine: "Your health and comfort come first.", category: "Clinic & Health", staffSingular: "Practitioner", staffPlural: "Practitioners", staffRoleHint: "Doctor, nurse, dentist…", serviceLabel: "Consultation", chooseStaffTitle: "Choose your practitioner" },
  { key: "photography", welcomeLine: "Let's capture moments worth remembering.", category: "Photography", staffSingular: "Photographer", staffPlural: "Photographers", staffRoleHint: "Lead photographer, assistant…", serviceLabel: "Session", chooseStaffTitle: "Choose your photographer" },
  { key: "consulting", welcomeLine: "Expert advice, at a time that suits you.", category: "Consulting", staffSingular: "Consultant", staffPlural: "Consultants", staffRoleHint: "Advisor, coach, consultant…", serviceLabel: "Meeting", chooseStaffTitle: "Choose your consultant" },
  { key: "fitness", welcomeLine: "Your stronger, healthier self starts here.", category: "Fitness & Wellness", staffSingular: "Trainer", staffPlural: "Trainers", staffRoleHint: "Personal trainer, yoga instructor…", serviceLabel: "Class", chooseStaffTitle: "Choose your trainer" },
  { key: "repair", welcomeLine: "Reliable help, right when you need it.", category: "Repair & Home Services", staffSingular: "Technician", staffPlural: "Technicians", staffRoleHint: "Technician, mechanic, cleaner…", serviceLabel: "Job", chooseStaffTitle: "Choose your technician" },
  { key: "other", welcomeLine: "We can't wait to see you.", category: "Other", staffSingular: "Team member", staffPlural: "Team", staffRoleHint: "Role or title…", serviceLabel: "Service", chooseStaffTitle: "Choose who you'd like to see" },
];

export const INDUSTRY_CATEGORIES = INDUSTRIES.map((i) => i.category);

export function industryFor(category?: string | null): Industry {
  return INDUSTRIES.find((i) => i.category === category || i.key === category) ?? INDUSTRIES[INDUSTRIES.length - 1]!;
}
