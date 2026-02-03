import mongoose from 'mongoose';
import connectDB from '../lib/mongodb';
import User from '../models/User';

async function migrateUserFields() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Update all users to have default role and status if they don't exist
    const result = await User.updateMany(
      { 
        $or: [
          { role: { $exists: false } },
          { status: { $exists: false } }
        ]
      },
      { 
        $set: { 
          role: 'user',
          status: 'active'
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} users with role and status fields`);

    // Verify the update
    const usersWithoutRole = await User.countDocuments({ role: { $exists: false } });
    const usersWithoutStatus = await User.countDocuments({ status: { $exists: false } });

    console.log(`Users without role: ${usersWithoutRole}`);
    console.log(`Users without status: ${usersWithoutStatus}`);

    if (usersWithoutRole === 0 && usersWithoutStatus === 0) {
      console.log('✅ Migration completed successfully!');
    } else {
      console.log('⚠️  Migration completed with some issues');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the migration
migrateUserFields();
