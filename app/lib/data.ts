import postgres from "postgres";
import {
  StudentField,
  Student,
  Session,
  LatestStudent,
  FormattedSessionsTable,
  Instructor,
} from "@/app/lib/definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function fetchStudentsCount() {
  try {
    const data = await sql<
      {
        month_name: string;
        year: number;
        cumulative_count: number;
      }[]
    >`
      WITH first_month AS (
        -- Get the first student's created_at month (truncated to month)
        SELECT DATE_TRUNC('month', MIN(created_at)) AS start_month
        FROM students
      ),
      months AS (
        -- Generate 12 months starting from that first month
        SELECT generate_series(
          (SELECT start_month FROM first_month),
          (SELECT start_month FROM first_month) + interval '11 month',
          interval '1 month'
        ) AS month
      ),
      monthly AS (
        -- Count students per month
        SELECT 
          DATE_TRUNC('month', created_at) AS month,
          COUNT(*) AS monthly_count
        FROM students
        GROUP BY DATE_TRUNC('month', created_at)
      )
      SELECT 
        TO_CHAR(m.month, 'Month') AS month_name,
        EXTRACT(YEAR FROM m.month)::int AS year,
        COALESCE(SUM(monthly_count) OVER (
          ORDER BY m.month
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ), 0) AS cumulative_count
      FROM months m
      LEFT JOIN monthly s ON m.month = s.month
      ORDER BY m.month;
    `;

    // Extract distinct years for convenience
    const years = Array.from(new Set(data.map((d) => d.year)));

    return { data, years };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch student count data.");
  }
}

export async function fetchLatestStudents() {
  try {
    const data = await sql<LatestStudent[]>`
      SELECT *
      FROM students
      ORDER BY students.created_at DESC
      LIMIT 5`;

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest students.");
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const numberOfSessionsPromise = sql<{ count: string }[]>`
      SELECT COUNT(*) FROM sessions
    `;
    const numberOfStudentsPromise = sql<{ count: string }[]>`
      SELECT COUNT(*) FROM students
    `;
    const numberOfGradesPromise = sql<{ grade_count: string }[]>`
      SELECT COUNT(DISTINCT grade) AS grade_count
      FROM students
    `;
    const averageSessionsPerStudentPromise = sql<{ avg: string }[]>`
      SELECT AVG(session_count) AS avg
      FROM (
        SELECT COUNT(*) AS session_count
        FROM sessions
        GROUP BY student_id
      ) AS session_counts;
    `;

    const data = await Promise.all([
      numberOfSessionsPromise,
      numberOfStudentsPromise,
      numberOfGradesPromise,
      averageSessionsPerStudentPromise,
    ]);

    const numberOfSessions = Number(data[0][0]?.count || "0");
    const numberOfStudents = Number(data[1][0]?.count || "0");
    const numberOfGrades = Number(data[2][0]?.grade_count ?? "0");
    const averageSessionsPerStudent = Number(data[3][0]?.avg || "0").toFixed(0);

    return {
      numberOfSessions,
      numberOfStudents,
      numberOfGrades,
      averageSessionsPerStudent,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredSessions(
  query: string,
  currentPage: number,
  from: string,
  to: string
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    let dateFilter = sql``;
    if (from && to) {
      dateFilter = sql`AND sessions.check_in >= ${from} AND sessions.check_in <= ${to}`;
    } else if (from) {
      dateFilter = sql`AND sessions.check_in >= ${from}`;
    } else if (to) {
      dateFilter = sql`AND sessions.check_in <= ${to}`;
    }

    const sessions = await sql<FormattedSessionsTable[]>`
      SELECT
        sessions.id,
        sessions.check_in,
        sessions.check_out,
        sessions.estimated_time,
        students.first_name,
        students.last_name,
        students.grade,
        students.department
      FROM sessions
      JOIN students ON sessions.student_id = students.id
      WHERE (
      students.first_name ILIKE ${`%${query}%`} OR
        students.last_name ILIKE ${`%${query}%`} OR
        students.grade ILIKE ${`%${query}%`} OR
        students.department ILIKE ${`%${query}%`}
      )
      ${dateFilter}
      ORDER BY sessions.check_in DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return sessions;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch sessions.");
  }
}

export async function fetchFilteredStudents(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const data = await sql<Student[]>`
		SELECT * FROM students
		WHERE
		  students.first_name ILIKE ${`%${query}%`} OR
        students.last_name ILIKE ${`%${query}%`} OR
        students.grade ILIKE ${`%${query}%`} OR
        students.department ILIKE ${`%${query}%`}
		ORDER BY students.first_name ASC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
	  `;

    return data;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch students table.");
  }
}

export async function fetchStudentsPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM students
    WHERE
      students.first_name ILIKE ${`%${query}%`} OR
      students.last_name ILIKE ${`%${query}%`} OR
      students.grade ILIKE ${`%${query}%`} OR
      students.department ILIKE ${`%${query}%`}
  `;

    const totalStudents = Number(data[0].count);
    const totalPages = Math.ceil(totalStudents / ITEMS_PER_PAGE);
    return { totalPages, totalStudents };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of students.");
  }
}

export async function fetchInstructorsPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM instructors
    WHERE
      instructors.first_name ILIKE ${`%${query}%`} OR
      instructors.last_name ILIKE ${`%${query}%`}
  `;

    const totalInstructors = Number(data[0].count);
    const totalPages = Math.ceil(totalInstructors / ITEMS_PER_PAGE);
    return { totalPages, totalInstructors };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of instructors.");
  }
}

export async function fetchFilteredInstructors(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const data = await sql<Instructor[]>`
		SELECT * FROM instructors
		WHERE
		  instructors.first_name ILIKE ${`%${query}%`} OR
        instructors.last_name ILIKE ${`%${query}%`}
		ORDER BY instructors.first_name ASC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
	  `;

    return data;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch instructor table.");
  }
}

export async function fetchFilteredSessionsByStudent(
  query: string,
  currentPage: number,
  id: string
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const sessions = await sql<FormattedSessionsTable[]>`
      SELECT
        sessions.id,
        sessions.check_in,
        sessions.check_out,
        sessions.estimated_time,
        students.first_name,
        students.last_name,
        students.grade,
        students.department
      FROM sessions
      JOIN students ON sessions.student_id = students.id
      WHERE
        sessions.student_id = ${id} AND (
        students.first_name ILIKE ${`%${query}%`} OR
        students.last_name ILIKE ${`%${query}%`} OR
        students.grade ILIKE ${`%${query}%`} OR
        students.department ILIKE ${`%${query}%`}
      )
      ORDER BY sessions.check_in DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return sessions;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch sessions.");
  }
}

export async function fetchSessionsByStudentPages(query: string, id: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM sessions
    JOIN students ON sessions.student_id = students.id
    WHERE
      sessions.student_id = ${id} AND (
      students.first_name ILIKE ${`%${query}%`} OR
      students.last_name ILIKE ${`%${query}%`} OR
      students.grade ILIKE ${`%${query}%`} OR
      students.department ILIKE ${`%${query}%`}
    )
  `;

    const totalSessions = Number(data[0].count);
    const totalPages = Math.ceil(totalSessions / ITEMS_PER_PAGE);
    return { totalPages, totalSessions };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of sessions.");
  }
}

export async function fetchSessionsPages(
  query: string,
  from: string,
  to: string
) {
  try {
    let dateFilter = sql``;
    if (from && to) {
      dateFilter = sql`AND sessions.check_in >= ${from} AND sessions.check_in <= ${to}`;
    } else if (from) {
      dateFilter = sql`AND sessions.check_in >= ${from}`;
    } else if (to) {
      dateFilter = sql`AND sessions.check_in <= ${to}`;
    }

    const data = await sql`SELECT COUNT(*)
    FROM sessions
    JOIN students ON sessions.student_id = students.id
    WHERE (
      students.first_name ILIKE ${`%${query}%`} OR
      students.last_name ILIKE ${`%${query}%`} OR
      students.grade ILIKE ${`%${query}%`} OR
      students.department ILIKE ${`%${query}%`}
    )
    ${dateFilter}
  `;

    const totalSessions = Number(data[0].count);
    const totalPages = Math.ceil(totalSessions / ITEMS_PER_PAGE);
    return { totalPages, totalSessions };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of sessions.");
  }
}

export async function fetchSessionById(id: string) {
  try {
    const data = await sql<Session[]>`
      SELECT
        sessions.id,
        sessions.student_id,
        sessions.check_in,
        sessions.check_out,
        sessions.estimated_time
      FROM sessions
      WHERE sessions.id = ${id};
    `;

    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch session.");
  }
}

export async function fetchStudents() {
  try {
    const students = await sql<StudentField[]>`
      SELECT
        id,
        first_name,
        last_name
      FROM students
      ORDER BY first_name ASC
    `;

    return students;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all students.");
  }
}

export async function fetchStudentById(id: string) {
  try {
    const data = await sql<Student[]>`
      SELECT * FROM students WHERE id = ${id};
    `;

    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch student.");
  }
}

export async function fetchInstructorById(id: string) {
  try {
    const data = await sql<Instructor[]>`
      SELECT * FROM instructors WHERE id = ${id};
    `;

    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch instructor.");
  }
}

// export async function fetchFilteredSessions(
//   query: string,
//   currentPage: number,
//   from?: string,
//   to?: string
// ) {
//   const offset = (currentPage - 1) * ITEMS_PER_PAGE;
//   const whereClauses = [];
//   const params = [];

//   if (from) {
//     whereClauses.push(`sessions.check_in >= $${params.length + 1}`);
//     params.push(from);
//   }

//   if (to) {
//     whereClauses.push(`sessions.check_in <= $${params.length + 1}`);
//     params.push(to);
//   }

//   if (query) {
//     whereClauses.push(`(
//       students.first_name ILIKE $${params.length + 1} OR
//       students.last_name ILIKE $${params.length + 2} OR
//       students.grade ILIKE $${params.length + 3} OR
//       students.department ILIKE $${params.length + 4}
//     )`);
//     params.push(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
//   }

//   const whereSQL =
//     whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

//   try {
//     const sessions = await sql.unsafe(
//       `
//       SELECT
//         sessions.id,
//         sessions.check_in,
//         sessions.check_out,
//         sessions.estimated_time,
//         students.first_name,
//         students.last_name,
//         students.grade,
//         students.department
//       FROM sessions
//       JOIN students ON sessions.student_id = students.id
//       ${whereSQL}
//       ORDER BY sessions.check_in DESC
//       LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
//     `,
//       params
//     );

//     return sessions;
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch sessions.");
//   }
// }
