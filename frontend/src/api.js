import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export const getNotices = () => axios.get(`${API_URL}/notices`);
export const createNotice = (data) => axios.post(`${API_URL}/notices`, data);
export const updateNotice = (id, data) => axios.put(`${API_URL}/notices/${id}`, data);
export const deleteNotice = (id) => axios.delete(`${API_URL}/notices/${id}`);

export const getContests = async () => {
  const res = await axios.get(`${API_URL}/contests`);
  const now = Date.now();
  res.data = res.data.map(c => {
    if (c.status !== 'Past') {
      let start = 0;
      if (c.startTime && c.startTime.includes(',')) {
          const parts = c.startTime.split(', ');
          if(parts.length === 2) {
             start = new Date(`${parts[0]}T${parts[1]}:00`).getTime();
          }
      } else if (c.date && c.time) {
          start = new Date(`${c.date}T${c.time}:00`).getTime();
      } else if (c.startTime) {
          start = new Date(c.startTime).getTime();
      }

      if (start && !isNaN(start)) {
        const durationMatch = c.duration?.match(/(\d+)/);
        const durationMins = durationMatch ? parseInt(durationMatch[1], 10) : 60;
        const durationMs = durationMins * 60 * 1000;
        const absoluteEndTime = start + durationMs;

        if (now > absoluteEndTime) {
          c.status = 'Past';
        } else if (now >= start && now <= absoluteEndTime) {
          c.status = 'Live';
        } else if (now < start) {
          c.status = 'Upcoming';
        }
      }
    }
    return c;
  });
  return res;
};
export const createContest = (data) => axios.post(`${API_URL}/contests`, data);
export const updateContest = (id, data) => axios.put(`${API_URL}/contests/${id}`, data);
export const deleteContest = (id) => axios.delete(`${API_URL}/contests/${id}`);

export const getSubmissions = () => axios.get(`${API_URL}/submissions`);
export const submitContestAnswers = (data) => axios.post(`${API_URL}/submissions`, data);
