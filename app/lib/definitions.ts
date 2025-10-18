// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type StudentCount = {
  month_name: string;
  cumulative_count: number;
};

export type LatestStudent = {
  id: string;
  first_name: string;
  last_name: string;
  grade: string;
  department: string;
  created_at: string;
};

export type StudentField = {
  id: string;
  first_name: string;
  last_name: string;
};

export type Student = {
  id: string;
  first_name: string;
  last_name: string;
  grade: string;
  department?: string | null;
}

export type Instructor = {
  id: string;
  first_name: string;
  last_name: string;
}

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  role_id: string;
}

export type Session = {
  id: string;
  student_id: string;
  estimated_time: string;
  check_in: Date;
  check_out: Date;
}

export type FormattedSessionsTable = {
  id: string;
  first_name: string;
  last_name: string;
  grade: string;
  department: string;
  check_in: string;
  check_out: string | null;
  estimated_time: number;
};
