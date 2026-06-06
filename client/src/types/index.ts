export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
  phone: string;
  subject: string;
  groupCount?: number;
}

export interface Group {
  _id: string;
  name: string;
  teacher: { _id: string; name: string; subject: string };
  subject: string;
  level: 'Primaire' | 'Collège' | 'Lycée' | 'Bac';
  schedule: string;
  monthlyPrice: number;
  students: { _id: string; firstName: string; lastName: string; parentPhone?: string }[];
}

export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  level: string;
  parentPhone: string;
  groups: { _id: string; name: string; subject: string; monthlyPrice?: number }[];
}

export interface Attendance {
  student: { _id: string; firstName: string; lastName: string };
  present: boolean;
}

export interface Session {
  _id: string;
  group: string;
  date: string;
  attendances: Attendance[];
}

export interface Payment {
  _id: string;
  student: { _id: string; firstName: string; lastName: string };
  group: { _id: string; name: string; monthlyPrice: number };
  month: string;
  status: 'paid' | 'unpaid';
  paidAt: string | null;
  note: string;
}

export interface DashboardData {
  totalStudents: number;
  totalTeachers: number;
  totalGroups: number;
  revenueThisMonth: number;
  unpaidThisMonth: Payment[];
}
