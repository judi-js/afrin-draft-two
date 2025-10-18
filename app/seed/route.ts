import bcrypt from "bcryptjs";
import postgres from "postgres";
import { v4 as uuidv4 } from "uuid";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const roles = [
  { id: "9ede9a59-36e8-4527-8309-afa73fb9ece7", name: "مدير" },
  { id: "e8e39be9-9b72-4148-af0b-a6b4a514f632", name: "مدرس" },
  { id: "1032b611-948a-4a8c-91b9-6b62f12da624", name: "طالب" },
];

const users = [
  {
    id: uuidv4(),
    first_name: "زكريا",
    last_name: "حيدر",
    phone: "0994889780",
    password: "123456",
    role_id: "9ede9a59-36e8-4527-8309-afa73fb9ece7",
  },

  {
    id: uuidv4(),
    first_name: "جودي",
    last_name: "علي",
    phone: "0980213028",
    password: "123456",
    role_id: "e8e39be9-9b72-4148-af0b-a6b4a514f632",
  },

  {
    id: uuidv4(),
    first_name: "أحمد",
    last_name: "عثمان",
    phone: "1234567890",
    password: "123456",
    role_id: "1032b611-948a-4a8c-91b9-6b62f12da624",
  },
];

async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // A safe way to handle foreign key constraints with cascade deletion

  // UPDATE users
  // SET role_id = '1032b611-948a-4a8c-91b9-6b62f12da624' -- طالب
  // WHERE role_id = 'e8e39be9-9b72-4148-af0b-a6b4a514f632';

  // DELETE FROM roles WHERE id = 'e8e39be9-9b72-4148-af0b-a6b4a514f632';


  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, first_name, last_name, phone, password, role_id, created_at, updated_at)
        VALUES (${user.id}, ${user.first_name}, ${user.last_name}, ${user.phone}, ${hashedPassword}, ${user.role_id}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;
      `;
    })
  );

  return insertedUsers;
}

async function seedRoles() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS roles (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE
    );
  `;

  const insertedRoles = await Promise.all(
    roles.map(
      (role) => sql`
        INSERT INTO roles (id, name)
        VALUES (${role.id}, ${role.name})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );

  return insertedRoles;
}

export async function GET() {
  try {
    const result = await sql.begin((sql) => [
      seedUsers(),
      // seedRoles(),
    ]);

    return Response.json({ message: "Database seeded successfully", result });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
