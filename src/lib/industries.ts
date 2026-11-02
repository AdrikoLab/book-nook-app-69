/** Central industry configuration: every industry-specific word comes from here. */
export type Industry = {
  key: string;
  category: string; // value stored in businesses.category
  staffSingular: string;
  staffPlural: string;
  staffRoleHint: string;
  serviceLabel: string;
  chooseStaffTitle: string;
};

export const INDUSTRIES: Industry[] = [
  { key: "salon", category: "Salon & Spa", staffSingular: "Stylist", staffPlural: "Stylists", staffRoleHint: "Stylist, nail tech, therapist…", serviceLabel: "Treatment", chooseStaffTitle: "Choose your stylist" },
  { key: "barbershop", category: "Barbershop", staffSingular: "Barber", staffPlural: "Barbers", staffRoleHint: "Barber, senior barber…", serviceLabel: "Cut", chooseStaffTitle: "Choose your barber" },
  { key: "clinic", category: "Clinic & Health", staffSingular: "Practitioner", staffPlural: "Practitioners", staffRoleHint: "Doctor, nurse, dentist…", serviceLabel: "Consultation", chooseStaffTitle: "Choose your practitioner" },
  { key: "photography", category: "Photography", staffSingular: "Photographer", staffPlural: "Photographers", staffRoleHint: "Lead photographer, assistant…", serviceLabel: "Session", chooseStaffTitle: "Choose your photographer" },
  { key: "consulting", category: "Consulting", staffSingular: "Consultant", staffPlural: "Consultants", staffRoleHint: "Advisor, coach, consultant…", serviceLabel: "Meeting", chooseStaffTitle: "Choose your consultant" },
  { key: "fitness", category: "Fitness & Wellness", staffSingular: "Trainer", staffPlural: "Trainers", staffRoleHint: "Personal trainer, yoga instructor…", serviceLabel: "Class", chooseStaffTitle: "Choose your trainer" },
  { key: "repair", category: "Repair & Home Services", staffSingular: "Technician", staffPlural: "Technicians", staffRoleHint: "Technician, mechanic, cleaner…", serviceLabel: "Job", chooseStaffTitle: "Choose your technician" },
  { key: "other", category: "Other", staffSingular: "Team member", staffPlural: "Team", staffRoleHint: "Role or title…", serviceLabel: "Service", chooseStaffTitle: "Choose who you'd like to see" },
];

export const INDUSTRY_CATEGORIES = INDUSTRIES.map((i) => i.category);

export function industryFor(category?: string | null): Industry {
  return INDUSTRIES.find((i) => i.category === category || i.key === category) ?? INDUSTRIES[INDUSTRIES.length - 1]!;
}
