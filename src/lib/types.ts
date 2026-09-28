export type UserRole = 'STUDENT' | 'LECTURER' | 'STAFF' | 'TECHNICIAN' | 'ADMIN';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_VENDOR' | 'RESOLVED' | 'CLOSED' | 'REJECTED_SPAM';

export type SystemHealthStatus = 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  identifier?: string | null; // NIM atau NIP
  department?: string | null; // Prodi atau Unit
  phone?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
  icon: string;
  slaHours: number;
  isActive: boolean;
}

export interface TicketMessage {
  id: number;
  ticketId: string;
  senderName: string;
  senderRole: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface TicketTimeline {
  id: number;
  ticketId: string;
  title: string;
  description?: string | null;
  statusCode: string;
  actorName: string;
  createdAt: string;
}

export interface Feedback {
  id: number;
  ticketId: string;
  rating: number; // 1 to 5
  comment?: string | null;
  createdAt: string;
}

export interface SecurityLog {
  id: number;
  ticketNumber?: string | null;
  reporterEmail: string;
  incidentType: string; // 'SPAM_TICKET' | 'BOT_ATTEMPT' | 'USER_BLOCKED'
  reason: string;
  actionTaken: string;
  actorName: string;
  ipAddress?: string | null;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  categoryId: number;
  category?: Category;
  priority: TicketPriority;
  status: TicketStatus;
  requesterName: string;
  requesterEmail: string;
  requesterRole: string;
  requesterId?: string | null;
  requesterPhone?: string | null;
  locationBuilding: string;
  locationRoom: string;
  assignedToId?: string | null;
  assignedTo?: User | null;
  slaDueAt?: string | null;
  resolvedAt?: string | null;
  isSpamFlagged?: boolean;
  spamReason?: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
  timelines?: TicketTimeline[];
  feedback?: Feedback | null;
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  tags?: string | null;
  views: number;
  helpfulCount: number;
  createdAt: string;
}

export interface ServiceStatus {
  id: number;
  serviceName: string;
  description?: string | null;
  status: SystemHealthStatus;
  uptimePercent: number;
  lastChecked: string;
}

export interface ResolutionTrendItem {
  day: string;
  created: number;
  resolved: number;
}

export interface CategoryResolutionSpeed {
  categoryName: string;
  avgHours: number;
  targetSla: number;
}

export interface AnalyticsSummary {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  spamTicketsCount: number;
  slaCompliancePercent: number;
  averageResolutionHours: number;
  averageCsat: number;
  totalFeedback: number;
  categoryDistribution: {
    categoryName: string;
    count: number;
  }[];
  weeklyResolutionTrend: ResolutionTrendItem[];
  categoryResolutionSpeed: CategoryResolutionSpeed[];
  recentActivity: {
    id: string;
    ticketNumber: string;
    action: string;
    actor: string;
    time: string;
  }[];
  securityLogs: SecurityLog[];
}
