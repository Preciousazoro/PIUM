import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';
import User from '@/models/User';

async function seedActivities() {
  try {
    await connectDB();
    
    // Get a sample user (or create one if needed)
    let user = await User.findOne();
    if (!user) {
      console.log('No users found. Please create a user first.');
      return;
    }

    console.log('Found user:', user.name);

    // Clear existing activities (optional - comment out if you want to keep existing data)
    await Activity.deleteMany({});
    console.log('Cleared existing activities');

    // Create sample activities
    const sampleActivities = [
      {
        userId: user._id,
        type: 'task_submitted',
        status: 'completed',
        title: 'Task Submitted: Social Media Post',
        description: 'User submitted proof for social media task',
        rewardPoints: 0,
        metadata: {
          taskTitle: 'Social Media Post',
          taskCategory: 'social'
        }
      },
      {
        userId: user._id,
        type: 'task_approved',
        status: 'completed',
        title: 'Task Approved: Social Media Post',
        description: 'Task approved and points awarded',
        rewardPoints: 50,
        metadata: {
          taskTitle: 'Social Media Post',
          taskCategory: 'social'
        }
      },
      {
        userId: user._id,
        type: 'task_started',
        status: 'completed',
        title: 'Task Started: Content Creation',
        description: 'User began working on content creation task',
        rewardPoints: 0,
        metadata: {
          taskTitle: 'Content Creation',
          taskCategory: 'content'
        }
      },
      {
        userId: user._id,
        type: 'profile_updated',
        status: 'completed',
        title: 'Profile Updated',
        description: 'User updated their profile information',
        rewardPoints: 0
      },
      {
        userId: user._id,
        type: 'welcome_bonus',
        status: 'completed',
        title: 'Welcome Bonus Awarded',
        description: 'New user received welcome bonus',
        rewardPoints: 100
      },
      {
        userId: user._id,
        type: 'task_rejected',
        status: 'completed',
        title: 'Task Rejected: Referral Task',
        description: 'Task submission was rejected',
        rewardPoints: 0,
        metadata: {
          taskTitle: 'Referral Task',
          taskCategory: 'referral',
          rejectionReason: 'Invalid referral link provided'
        }
      }
    ];

    // Insert activities with slight time delays to make them look more realistic
    const activities = [];
    for (let i = 0; i < sampleActivities.length; i++) {
      const activity = {
        ...sampleActivities[i],
        createdAt: new Date(Date.now() - (i * 60 * 60 * 1000)), // Each activity 1 hour apart
        updatedAt: new Date(Date.now() - (i * 60 * 60 * 1000))
      };
      activities.push(activity);
    }

    await Activity.insertMany(activities);
    console.log(`Successfully created ${activities.length} sample activities`);

    // Display the created activities
    const createdActivities = await Activity.find()
      .populate('userId', 'name username email')
      .sort({ createdAt: -1 });

    console.log('\nCreated Activities:');
    createdActivities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title} - ${activity.type} - ${activity.createdAt.toLocaleString()}`);
    });

  } catch (error) {
    console.error('Error seeding activities:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seed function
seedActivities();
