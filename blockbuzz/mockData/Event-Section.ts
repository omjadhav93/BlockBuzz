interface EventData {
    id: string;
    title: string;
    description: string;
    city: string;
    venue: string;
    venue_type: string;
    startTime: string;
    endTime: string;
    capacity: number;
    published: boolean;
    cancelled: boolean;
    status?: string;
}

interface EventResponse {
    events: {
        Upcoming: EventData[];
        Attended: EventData[];
    }
}

export const mockEventResponse: EventResponse = {
    events: {
        Upcoming: [
            {
                id: "evt-up-001",
                title: "Tech Innovators Meetup",
                description: "A networking meetup for developers, founders, and tech enthusiasts.",
                city: "Bengaluru",
                venue: "WeWork Galaxy",
                venue_type: "Co-working Space",
                startTime: "2026-02-01T10:00:00+05:30",
                endTime: "2026-02-01T13:00:00+05:30",
                capacity: 150,
                published: true,
                cancelled: false,
                status: "Scheduled",
            },
            {
                id: "evt-up-002",
                title: "AI & ML Conference",
                description: "Deep dive into AI trends, ML models, and real-world applications.",
                city: "Mumbai",
                venue: "Jio World Convention Centre",
                venue_type: "Convention Center",
                startTime: "2026-02-10T09:00:00+05:30",
                endTime: "2026-02-10T17:00:00+05:30",
                capacity: 500,
                published: true,
                cancelled: false,
                status: "Scheduled",
            },
            {
                id: "evt-up-003",
                title: "Open Source Contribution Jam",
                description: "Hands-on session on contributing to open source projects.",
                city: "Delhi",
                venue: "T-Hub Delhi",
                venue_type: "Innovation Hub",
                startTime: "2026-01-28T11:00:00+05:30",
                endTime: "2026-01-28T15:00:00+05:30",
                capacity: 120,
                published: true,
                cancelled: false,
                status: "Registration Open",
            },
            {
                id: "evt-up-004",
                title: "Product Design Workshop",
                description: "Learn product thinking, UX research, and design systems.",
                city: "Chennai",
                venue: "IIT Research Park",
                venue_type: "Workshop Space",
                startTime: "2026-02-05T14:00:00+05:30",
                endTime: "2026-02-05T18:00:00+05:30",
                capacity: 80,
                published: true,
                cancelled: false,
                status: "Few Seats Left",
            },
            {
                id: "evt-up-005",
                title: "DevOps Live Bootcamp",
                description: "CI/CD, Docker, Kubernetes, and cloud-native best practices.",
                city: "Hyderabad",
                venue: "Microsoft Reactor",
                venue_type: "Tech Campus",
                startTime: "2026-02-15T10:00:00+05:30",
                endTime: "2026-02-15T16:00:00+05:30",
                capacity: 200,
                published: true,
                cancelled: false,
                status: "Scheduled",
            },
        ],

        Attended: [
            {
                id: "evt-at-001",
                title: "Frontend Dev Hangout",
                description: "Community meetup for frontend developers and designers.",
                city: "Gurugram",
                venue: "91Springboard",
                venue_type: "Co-working Space",
                startTime: "2025-12-10T16:00:00+05:30",
                endTime: "2025-12-10T18:30:00+05:30",
                capacity: 100,
                published: true,
                cancelled: false,
                status: "Completed",
            },
            {
                id: "evt-at-002",
                title: "Backend Engineering Talk",
                description: "Scaling APIs, databases, and distributed systems.",
                city: "Jaipur",
                venue: "Startup Oasis",
                venue_type: "Incubation Center",
                startTime: "2025-11-22T15:00:00+05:30",
                endTime: "2025-11-22T17:00:00+05:30",
                capacity: 90,
                published: true,
                cancelled: false,
                status: "Completed",
            },
            {
                id: "evt-at-003",
                title: "Cybersecurity Awareness Session",
                description: "Understanding modern security threats and prevention.",
                city: "Kolkata",
                venue: "NASSCOM Centre",
                venue_type: "Conference Hall",
                startTime: "2025-10-18T11:30:00+05:30",
                endTime: "2025-10-18T14:00:00+05:30",
                capacity: 120,
                published: true,
                cancelled: false,
                status: "Completed",
            },
            {
                id: "evt-at-004",
                title: "Women in Tech Panel",
                description: "Panel discussion featuring women leaders in technology.",
                city: "Indore",
                venue: "IIM Indore Auditorium",
                venue_type: "Auditorium",
                startTime: "2025-09-05T17:30:00+05:30",
                endTime: "2025-09-05T19:30:00+05:30",
                capacity: 300,
                published: true,
                cancelled: false,
                status: "Completed",
            },
            {
                id: "evt-at-005",
                title: "System Design Masterclass",
                description: "Design scalable systems with real-world case studies.",
                city: "Varanasi",
                venue: "Tech Knowledge Hub",
                venue_type: "Training Center",
                startTime: "2025-08-20T10:00:00+05:30",
                endTime: "2025-08-20T15:00:00+05:30",
                capacity: 60,
                published: true,
                cancelled: false,
                status: "Completed",
            },
        ],
    },
};
