"use server";

import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { formatEstimatedTime } from "./utils";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const FormSchema = z.object({
  id: z.string(),
  studentId: z.string({
    invalid_type_error: "اختر طالباً من فضلك.",
  }),
  check_in: z.string(),
  check_out: z.string().optional(),
});

const StudentFormSchema = z
  .object({
    first_name: z
      .string({
        required_error: "الاسم الاول مطلوب.",
        invalid_type_error: "الاسم الأول يجب أن يكون نصاً.",
      })
      .min(3, "يجب أن يكون الاسم الاول مؤلفاً من ثلاثة حروف على الأقل."),
    last_name: z
      .string({
        required_error: "اسم العائلة مطلوب.",
        invalid_type_error: "اسم العائلة يجب أن يكون نصاً.",
      })
      .min(3, "يجب أن يكون اسم العائلة مؤلفاً من ثلاثة حروف على الأقل."),
    grade: z.string({
      invalid_type_error: "اختر صفاً من فضلك.",
    }),
    department: z.preprocess(
      (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
      z.string().nullable().optional()
    ),
  })
  .refine(
    (data) => {
      const needsDepartment = ["الحادي عشر", "الثاني عشر"].includes(data.grade);

      if (needsDepartment) {
        // Must have a non-empty department
        return !!data.department && data.department.trim().length > 0;
      } else {
        // Must NOT have a department
        return !data.department || data.department.trim().length === 0;
      }
    },
    {
      message: "الفرع مطلوب للصفوف الحادي عشر والثاني عشر.",
      path: ["department"],
    }
  );

export type StudentFormState = {
  errors?: {
    first_name?: string[];
    last_name?: string[];
    grade?: string[];
    department?: string[];
  };
  message?: string | null;
};

const InstructorFormSchema = z.object({
  first_name: z
    .string({
      required_error: "الاسم الاول مطلوب.",
      invalid_type_error: "الاسم الأول يجب أن يكون نصاً.",
    })
    .min(3, "يجب أن يكون الاسم الاول مؤلفاً من ثلاثة حروف على الأقل."),
  last_name: z
    .string({
      required_error: "اسم العائلة مطلوب.",
      invalid_type_error: "اسم العائلة يجب أن يكون نصاً.",
    })
    .min(3, "يجب أن يكون اسم العائلة مؤلفاً من ثلاثة حروف على الأقل."),
});

export type InstructorFormState = {
  errors?: {
    first_name?: string[];
    last_name?: string[];
  };
  message?: string | null;
};

const CreateSession = FormSchema.omit({ id: true });
const UpdateSession = FormSchema.omit({ id: true });

export type State = {
  errors?: {
    studentId?: string[];
    check_in?: string[];
    check_out?: string[];
  };
  message?: string | null;
};

export async function checkSession(
  studentId: string,
  action: "check_in" | "check_out",
  date?: string | null
) {
  try {
    const getAdvancedDate = (d?: string | null) => {
      const base = d ? new Date(d) : new Date();
      base.setHours(base.getHours() + 3);
      return base;
    };

    const advancedDate = getAdvancedDate(date);

    // 1. Check if the student exists
    const studentExists = await sql`
      SELECT 1 FROM students WHERE id = ${studentId}
    `;
    if (studentExists.length === 0) {
      return { message: "الطالب غير موجود. فشل إنشاء الجلسة." };
    }

    if (action === "check_in") {
      // 2. Prevent overlapping sessions
      const overlap = await sql`
        SELECT 1
        FROM sessions
        WHERE student_id = ${studentId}
          AND (
            (${advancedDate} BETWEEN check_in AND check_out)
            OR (check_out IS NULL AND ${advancedDate} <= check_in)
          )
      `;
      if (overlap.length > 0) {
        return {
          message: `لا يمكن تسجيل الدخول في ${
            date
              ? new Date(date).toLocaleString("ar-SY")
              : new Date().toLocaleString("ar-SY")
          } لأنه يتداخل مع جلسة موجودة.`,
        };
      }

      // 3. Block if the last session is still open
      const lastOpen = await sql`
        SELECT 1
        FROM sessions
        WHERE student_id = ${studentId}
          AND check_out IS NULL
        LIMIT 1
      `;
      if (lastOpen.length > 0) {
        return {
          message:
            "لا يمكن تسجيل الدخول. يوجد جلسة سابقة لم يتم تسجيل الخروج منها بعد.",
        };
      }

      // 4. Insert a new check-in
      const insertResult = await sql`
        INSERT INTO sessions (student_id, check_in, estimated_time)
        VALUES (${studentId}, ${advancedDate}, 60)
        RETURNING check_in
      `;
      const { check_in } = insertResult[0];
      return {
        message: `تم تسجيل الدخول في ${new Date(check_in).toLocaleString(
          "ar-SY"
        )}.`,
      };
    }

    if (action === "check_out") {
      // 5. Get the last session
      const lastSession = await sql`
        SELECT id, check_in, check_out
        FROM sessions
        WHERE student_id = ${studentId}
        ORDER BY check_in DESC
        LIMIT 1
      `;

      if (lastSession.length === 0) {
        return { message: "لا يمكن تسجيل الخروج لأنه لا توجد جلسة مفتوحة." };
      }

      const { id, check_out } = lastSession[0];

      if (check_out !== null) {
        return {
          message: "لا يمكن تسجيل الخروج. آخر جلسة مسجلة مغلقة بالفعل.",
        };
      }

      // 6. Update only if at least 10 minutes have passed
      const result = await sql`
        UPDATE sessions
        SET check_out = ${advancedDate},
            estimated_time = EXTRACT(EPOCH FROM ${advancedDate} - check_in) / 60
        WHERE id = ${id}
          AND ${advancedDate} - check_in >= INTERVAL '10 minutes'
        RETURNING check_out, estimated_time
      `;

      if (result.length === 0) {
        return {
          message:
            "لا يمكن تسجيل الخروج. يجب أن تمر 10 دقائق على الأقل بعد تسجيل الدخول.",
        };
      }

      const { check_out: co, estimated_time } = result[0];
      return {
        message: `تم تسجيل الخروج في ${new Date(co).toLocaleString(
          "ar-SY"
        )}، والمدة المقدرة: ${formatEstimatedTime(+estimated_time, "full")}.`,
      };
    }

    return { message: "إجراء غير صالح." };
  } catch (error) {
    console.error(error);
    return { message: "خطأ في قاعدة البيانات: فشل إنشاء الجلسة." };
  } finally {
    revalidatePath("/dashboard/sessions");
    revalidatePath("/dashboard");
  }
}

export async function createSession(prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateSession.safeParse({
    studentId: formData.get("studentId"),
    check_in: formData.get("check_in"),
    check_out: formData.get("check_out"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "يجب إدخال جميع الحقول. فشل في إنشاء الجلسة.",
    };
  }

  // Prepare data for insertion into the database
  const { studentId, check_in, check_out } = validatedFields.data;

  // Check that check_in is less than the current time
  const checkInDate = new Date(check_in);
  const now = new Date();
  if (checkInDate.getTime() >= now.getTime()) {
    return {
      errors: {
        check_in: ["يجب أن يكون وقت الدخول قبل الوقت الحالي."],
      },
      message: "يجب أن يكون وقت الدخول قبل الوقت الحالي.",
    };
  }

  // Check interval between check_in and check_out (at least 10 minutes)
  if (check_out) {
    const checkOutDate = new Date(check_out);
    // Check that check_out is less than the current time
    if (checkOutDate.getTime() >= now.getTime()) {
      return {
        errors: {
          check_out: ["يجب أن يكون وقت الخروج قبل الوقت الحالي."],
        },
        message: "يجب أن يكون وقت الخروج قبل الوقت الحالي.",
      };
    }
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    if (diffMs < 10 * 60 * 1000) {
      return {
        errors: {
          check_out: [
            "يجب أن يكون وقت الخروج بعد الدخول بعشر دقائق على الأقل.",
          ],
        },
        message: "يجب أن يكون وقت الخروج بعد الدخول بعشر دقائق على الأقل.",
      };
    }
  }

  // Insert data into the database
  try {
    const checkInISO = new Date(check_in).toISOString();
    const checkOutISO = check_out ? new Date(check_out).toISOString() : null;
    let estimatedTime: number | null = null;
    if (check_out) {
      const checkInDate = new Date(check_in);
      const checkOutDate = new Date(check_out);
      estimatedTime = Math.floor(
        (checkOutDate.getTime() - checkInDate.getTime()) / (60 * 1000)
      );
    }
    await sql`
      INSERT INTO sessions (student_id, check_in, check_out, estimated_time)
      VALUES (${studentId}, ${checkInISO}, ${checkOutISO}, ${estimatedTime})
    `;
  } catch (error) {
    console.error("DB Insert Error:", error);
    // If a database error occurs, return a more specific error.
    return {
      message: "خطأ في قاعدة البيانات: فشل في إنشاء الجلسة.",
    };
  }

  // Revalidate the cache for the sessions page and redirect the user.
  revalidatePath("/dashboard/sessions");
  revalidatePath("/dashboard");
  redirect("/dashboard/sessions");
}

export async function createStudent(
  prevState: StudentFormState,
  formData: FormData
) {
  // Validate form fields using Zod
  const validatedFields = StudentFormSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    grade: formData.get("grade"),
    department: formData.get("department"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "يجب إدخال جميع الحقول. فشل في إضافة الطالب.",
    };
  }

  // Prepare data for insertion into the database
  const { first_name, last_name, grade, department } = validatedFields.data;

  // Insert data into the database
  try {
    await sql`
      INSERT INTO students (first_name, last_name, grade, department)
      VALUES (${first_name}, ${last_name}, ${grade}, ${department ?? null})
    `;
  } catch (error) {
    console.error("DB Insert Error:", error);
    // If a database error occurs, return a more specific error.
    return {
      message: "خطأ في قاعدة البيانات: فشل في إضافة الطالب.",
    };
  }

  // Revalidate the cache for the students page and redirect the user.
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/sessions");
  revalidatePath("/dashboard/register");
  revalidatePath("/dashboard");
  redirect("/dashboard/students");
}

export async function updateStudent(
  id: string,
  prevState: StudentFormState,
  formData: FormData
) {
  // Validate form fields using Zod
  const validatedFields = StudentFormSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    grade: formData.get("grade"),
    department: formData.get("department"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "يجب إدخال جميع الحقول. فشل في تحديث الطالب.",
    };
  }

  // Prepare data for insertion into the database
  const { first_name, last_name, grade, department } = validatedFields.data;

  // Insert data into the database
  try {
    await sql`
      UPDATE students
      SET first_name = ${first_name}, last_name = ${last_name}, grade = ${grade}, department = ${
      department ?? null
    }
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("DB Insert Error:", error);
    // If a database error occurs, return a more specific error.
    return {
      message: "خطأ في قاعدة البيانات: فشل في تحديث الطالب.",
    };
  }

  // Revalidate the cache for the students page and redirect the user.
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/sessions");
  revalidatePath("/dashboard/register");
  revalidatePath("/dashboard");
  redirect("/dashboard/students");
}

export async function createInstructor(
  prevState: InstructorFormState,
  formData: FormData
) {
  // Validate form fields using Zod
  const validatedFields = InstructorFormSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "يجب إدخال جميع الحقول. فشل في إضافة المدرس.",
    };
  }

  // Prepare data for insertion into the database
  const { first_name, last_name } = validatedFields.data;

  // Insert data into the database
  try {
    await sql`
      INSERT INTO instructors (first_name, last_name)
      VALUES (${first_name}, ${last_name})
    `;
  } catch (error) {
    console.error("DB Insert Error:", error);
    // If a database error occurs, return a more specific error.
    return {
      message: "خطأ في قاعدة البيانات: فشل في إضافة المدرس.",
    };
  }

  // Revalidate the cache for the instructors page and redirect the user.
  revalidatePath("/dashboard/instructors");
  redirect("/dashboard/instructors");
}

export async function updateInstructor(
  id: string,
  prevState: InstructorFormState,
  formData: FormData
) {
  // Validate form fields using Zod
  const validatedFields = InstructorFormSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "يجب إدخال جميع الحقول. فشل في تحديث المدرس.",
    };
  }

  // Prepare data for insertion into the database
  const { first_name, last_name } = validatedFields.data;

  // Insert data into the database
  try {
    await sql`
      UPDATE instructors
      SET first_name = ${first_name}, last_name = ${last_name}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("DB Insert Error:", error);
    // If a database error occurs, return a more specific error.
    return {
      message: "خطأ في قاعدة البيانات: فشل في تحديث المدرس.",
    };
  }

  // Revalidate the cache for the instructors page and redirect the user.
  revalidatePath("/dashboard/instructors");
  redirect("/dashboard/instructors");
}

export async function updateSession(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = UpdateSession.safeParse({
    studentId: formData.get("studentId"),
    check_in: formData.get("check_in"),
    check_out: formData.get("check_out"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "يجب إدخال جميع الحقول. فشل في تحديث الجلسة.",
    };
  }

  const { studentId, check_in, check_out } = validatedFields.data;

  // Check that check_in is less than the current time
  const checkInDate = new Date(check_in);
  const now = new Date();
  if (checkInDate.getTime() >= now.getTime()) {
    return {
      errors: {
        check_in: ["يجب أن يكون وقت الدخول قبل الوقت الحالي."],
      },
      message: "يجب أن يكون وقت الدخول قبل الوقت الحالي.",
    };
  }

  // Check interval between check_in and check_out (at least 10 minutes)
  if (check_out) {
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    // Check that check_out is less than the current time
    if (checkOutDate.getTime() >= now.getTime()) {
      return {
        errors: {
          check_out: ["يجب أن يكون وقت الخروج قبل الوقت الحالي."],
        },
        message: "يجب أن يكون وقت الخروج قبل الوقت الحالي.",
      };
    }
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    if (diffMs < 10 * 60 * 1000) {
      return {
        errors: {
          check_out: [
            "يجب أن يكون وقت الخروج بعد الدخول بعشر دقائق على الأقل.",
          ],
        },
        message: "يجب أن يكون وقت الخروج بعد الدخول بعشر دقائق على الأقل.",
      };
    }
  }

  try {
    const checkOut = check_out ? new Date(check_out).toISOString() : null;
    const checkIn = new Date(check_in).toISOString();

    let estimatedTime: number | null = null;
    if (check_out) {
      const checkInDate = new Date(check_in);
      const checkOutDate = new Date(check_out);
      estimatedTime = Math.floor(
        (checkOutDate.getTime() - checkInDate.getTime()) / (60 * 1000)
      );
    }
    await sql`
      UPDATE sessions
      SET student_id = ${studentId}, check_in = ${checkIn}, check_out = ${checkOut}, estimated_time = ${estimatedTime}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("DB Insert Error:", error);
    return { message: "خطأ في قاعدة البيانات: فشل في تحديث الجلسة." };
  }

  revalidatePath("/dashboard/sessions");
  revalidatePath("/dashboard");
  redirect("/dashboard/sessions");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "خطأ في تسجيل الدخول. يرجى التحقق من البيانات الخاصة بك.";
        default:
          return "حدث خطأ ما أثناء تسجيل الدخول.";
      }
    }
    throw error;
  }
}

export async function deleteRecord(id: string, tableName: string) {
  console.log(tableName);
  await sql`DELETE FROM ${sql(tableName)} WHERE id = ${id}`;
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/instructors");
  revalidatePath("/dashboard/sessions");
  revalidatePath("/dashboard/register");
  revalidatePath("/dashboard");
  revalidatePath("/sessions");
}
