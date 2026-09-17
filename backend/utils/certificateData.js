/**
 * Builds the student / course objects that generateCertificatePDF expects for a batch
 * certificate. Candidates without a Student registration record or CourseDetail fall back
 * to their User account and the batch name.
 *
 * @param {Object} user          - User document (candidate)
 * @param {Object} [student]     - Student document (populated collegeId, branchId) or null
 * @param {Object} [courseDetail]- CourseDetail document (populated technologyId, durationId) or null
 * @param {Object} [batch]       - Batch document or null
 */
const buildBatchCertificateData = ({ user, student, courseDetail, batch }) => {
  const studentData = {
    _id: student ? student._id : null,
    name: (user?.name || student?.name || 'Candidate').trim(),
    registrationNo: student?.registrationNo || user?.username || (user ? `REG-${user._id.toString().slice(-6).toUpperCase()}` : ''),
    collegeId: student?.collegeId || { collegeName: 'SLOG Solutions Private Limited' },
    branchId: student?.branchId || { branchName: user?.branch || 'General' }
  };

  const courseDetailData = courseDetail || {
    _id: null,
    technologyId: { name: batch?.name ? batch.name.toUpperCase() : 'TRAINING PROGRAM' },
    durationId: { value: 'Complete', unit: 'Course' }
  };

  return { studentData, courseDetailData };
};

module.exports = { buildBatchCertificateData };
