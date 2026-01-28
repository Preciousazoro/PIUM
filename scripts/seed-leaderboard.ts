import mongoose from 'mongoose';
import User from '../models/User';

// Sample users for testing leaderboard
const sampleUsers = [
  {
    name: 'Alex Chen',
    email: 'alex@example.com',
    password: 'password123',
    username: 'CryptoKing',
    taskPoints: 15400,
    tasksCompleted: 142,
    avatarUrl: 'https://i.pravatar.cc/150?u=1'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: 'password123',
    username: 'TaskMaster',
    taskPoints: 12850,
    tasksCompleted: 120,
    avatarUrl: 'https://i.pravatar.cc/150?u=2'
  },
  {
    name: 'Mike Wilson',
    email: 'mike@example.com',
    password: 'password123',
    username: 'Zelda_99',
    taskPoints: 10200,
    tasksCompleted: 98,
    avatarUrl: 'https://i.pravatar.cc/150?u=3'
  },
  {
    name: 'Emma Davis',
    email: 'emma@example.com',
    password: 'password123',
    username: 'DevGamer',
    taskPoints: 9400,
    tasksCompleted: 85,
    avatarUrl: 'https://i.pravatar.cc/150?u=4'
  },
  {
    name: 'John Smith',
    email: 'john@example.com',
    password: 'password123',
    username: 'Sarah_S',
    taskPoints: 8200,
    tasksCompleted: 72,
    avatarUrl: 'https://i.pravatar.cc/150?u=5'
  },
  {
    name: 'Lisa Brown',
    email: 'lisa@example.com',
    password: 'password123',
    username: 'KashFlow',
    taskPoints: 7500,
    tasksCompleted: 60,
    avatarUrl: 'https://i.pravatar.cc/150?u=6'
  },
  {
    name: 'Tom Miller',
    email: 'tom@example.com',
    password: 'password123',
    username: 'Web3Whale',
    taskPoints: 5200,
    tasksCompleted: 45,
    avatarUrl: 'https://i.pravatar.cc/150?u=7'
  },
  {
    name: 'Amy Taylor',
    email: 'amy@example.com',
    password: 'password123',
    username: 'CryptoQueen',
    taskPoints: 4800,
    tasksCompleted: 38,
    avatarUrl: 'https://i.pravatar.cc/150?u=8'
  },
  {
    name: 'David Lee',
    email: 'david@example.com',
    password: 'password123',
    username: 'TaskNinja',
    taskPoints: 3200,
    tasksCompleted: 25,
    avatarUrl: 'https://i.pravatar.cc/150?u=9'
  },
  {
    name: 'Rachel Green',
    email: 'rachel@example.com',
    password: 'password123',
    username: 'PointMaster',
    taskPoints: 2100,
    tasksCompleted: 18,
    avatarUrl: 'https://i.pravatar.cc/150?u=10'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing data)
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Insert sample users
    const users = await User.insertMany(sampleUsers);
    console.log(`Successfully created ${users.length} users`);

    // Display leaderboard preview
    const leaderboard = await User.find({})
      .select('username taskPoints tasksCompleted')
      .sort({ taskPoints: -1, tasksCompleted: -1 })
      .limit(10);

    console.log('\n=== LEADERBOARD PREVIEW ===');
    leaderboard.forEach((user, index) => {
      const level = user.taskPoints >= 15000 ? 'Expert' :
                   user.taskPoints >= 8000 ? 'Advanced' :
                   user.taskPoints >= 3000 ? 'Intermediate' : 'Beginner';
      console.log(`#${index + 1} ${user.username} - ${user.taskPoints} TP (${user.tasksCompleted} tasks) - ${level}`);
    });

    mongoose.connection.close();
    console.log('\nDatabase seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
