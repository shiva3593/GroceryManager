import { db } from './db';
import { users } from '@shared/schema';
import bcrypt from 'bcrypt';

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.insert(users).values({
      username: 'admin',
      password: hashedPassword
    }).onConflictDoNothing();
    
    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser(); 