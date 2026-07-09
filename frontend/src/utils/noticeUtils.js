export const getStudentBatchFromSession = () => {
  try {
    const profileStr = sessionStorage.getItem('student_profile');
    if (!profileStr) return 'All';

    const profile = JSON.parse(profileStr);
    return profile.batch || 'All';
  } catch (error) {
    return 'All';
  }
};

export const isNoticeActive = (notice) => {
  if (notice.deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadlineDate = new Date(notice.deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    
    if (today > deadlineDate) {
      return false;
    }
  }
  return true;
};

export const filterNoticesForStudent = (notices = [], studentBatch = 'All') =>
  notices.filter((notice) => {
    if (!isNoticeActive(notice)) return false;

    if (!notice?.batch || notice.batch.length === 0) return true;

    const batches = Array.isArray(notice.batch) ? notice.batch : [notice.batch];
    return batches.includes('All') || batches.includes(studentBatch);
  });
