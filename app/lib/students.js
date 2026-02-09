// app/lib/students.js
import pool from "./database.js";

// Get all students
export async function getAllUsers() {
  // Change table name if yours is different
  const [rows] = await pool.query("SELECT * FROM students");
  return rows;
}

// Get 1 student by email
export async function getStudentByEmail(email) {
  const [rows] = await pool.query(
    "SELECT * FROM students WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] ?? null;
}

// Create student
export async function createUser(student) {
  const {
    first_name,
    last_name,
    email,
    phone,
    street_address,
    city,
    province_state,
    country,
    postal_code,
    program,
    year,
    profile_picture_url = null,
  } = student;

  // Basic required field checks
  const required = {
    first_name,
    last_name,
    email,
    phone,
    street_address,
    city,
    province_state,
    country,
    postal_code,
    program,
    year,
  };

  for (const [k, v] of Object.entries(required)) {
    if (!v || String(v).trim() === "") {
      throw new Error(`Missing required field: ${k}`);
    }
  }

  // Check unique email
  const [existing] = await pool.query(
    "SELECT email FROM students WHERE email = ? LIMIT 1",
    [email]
  );

  if (existing.length > 0) {
    throw new Error("Student with this email already exists");
  }

  // Insert
  await pool.query(
    `
    INSERT INTO students
      (first_name, last_name, email, phone, street_address, city, province_state, country, postal_code, program, year, profile_picture_url)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      first_name,
      last_name,
      email,
      phone,
      street_address,
      city,
      province_state,
      country,
      postal_code,
      program,
      year,
      profile_picture_url,
    ]
  );

  return { ok: true };
}