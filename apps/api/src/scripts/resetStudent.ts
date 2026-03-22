import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { StudentProfile } from '../models/StudentProfile';
import { Accumulation } from '../models/Accumulation';
import { Role } from '../models/Role';
import { Interview } from '../models/Interview';

const STUDENT_PROFILE_ID = '69bd51e8476f1c54debc31f2';
const STUDENT_USER_ID = '69bd5163476f1c54debc31f0';
const STUDENT_NAME = 'Jonathan Dionisio';

async function resetStudentData() {
  try {
    console.log('🚀 Connecting to database...');
    await connectDB();
    console.log('✅ Connected.');

    // 1. Reset Student Profile Accumulation Points
    console.log('🔄 Resetting Student Profile points...');
    const profile = await StudentProfile.findById(STUDENT_PROFILE_ID);
    if (profile) {
      // We calculate the new total points by subtracting the accumulation points
      const accumulationPoints = profile.pointsBreakdown?.accumulations || 0;
      profile.totalPoints = Math.max(0, profile.totalPoints - accumulationPoints);
      
      if (profile.pointsBreakdown) {
        profile.pointsBreakdown.accumulations = 0;
        profile.pointsBreakdown.rawAccumulations = 0;
      }
      
      await profile.save();
      console.log(`✅ Profile points reset. New total: ${profile.totalPoints}`);
    } else {
      console.log('⚠️ Student Profile not found.');
    }

    // 2. Remove from Accumulations
    console.log('🔄 Removing student from Accumulations...');
    const resultAcc = await Accumulation.updateMany(
      { 'participantList.name': STUDENT_NAME },
      { 
        $pull: { participantList: { name: STUDENT_NAME } },
        $inc: { participants: -1 }
      }
    );
    console.log(`✅ Removed from ${resultAcc.modifiedCount} accumulations.`);

    // 3. Remove from Role Applications
    console.log('🔄 Removing student from Internship Offer applications...');
    const resultRoles = await Role.updateMany(
      { appliedStudents: new mongoose.Types.ObjectId(STUDENT_USER_ID) },
      { 
        $pull: { appliedStudents: new mongoose.Types.ObjectId(STUDENT_USER_ID) },
        $inc: { applicants: -1 }
      }
    );
    console.log(`✅ Removed from ${resultRoles.modifiedCount} role applications.`);

    // 4. Delete Interviews
    console.log('🔄 Deleting industrial interviews...');
    const resultInt = await Interview.deleteMany({ applicant: new mongoose.Types.ObjectId(STUDENT_USER_ID) });
    console.log(`✅ Deleted ${resultInt.deletedCount} interviews.`);

    console.log('\n✨ Reset complete for Jonathan Dionisio.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during reset:', error);
    process.exit(1);
  }
}

resetStudentData();
