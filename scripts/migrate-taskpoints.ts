import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

async function migrateTaskPoints() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Find users with taskPoints = 0, null, or undefined
    const usersToUpdate = await User.find({
      $or: [
        { taskPoints: { $exists: false } },
        { taskPoints: null },
        { taskPoints: 0 }
      ]
    });

    console.log(`Found ${usersToUpdate.length} users to update with 50 TP welcome bonus`);

    if (usersToUpdate.length === 0) {
      console.log('No users need migration. All users already have taskPoints > 0');
      return;
    }

    // Update all eligible users with 50 TP welcome bonus
    const result = await User.updateMany(
      {
        $or: [
          { taskPoints: { $exists: false } },
          { taskPoints: null },
          { taskPoints: 0 }
        ]
      },
      {
        $set: { taskPoints: 50 }
      }
    );

    console.log(`Successfully updated ${result.modifiedCount} users with 50 TP welcome bonus`);

    // Verify the updates
    const remainingUsers = await User.find({
      $or: [
        { taskPoints: { $exists: false } },
        { taskPoints: null },
        { taskPoints: 0 }
      ]
    });

    if (remainingUsers.length === 0) {
      console.log('✅ Migration completed successfully! All users now have at least 50 TP.');
    } else {
      console.log(`⚠️  ${remainingUsers.length} users still need updates`);
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateTaskPoints();
