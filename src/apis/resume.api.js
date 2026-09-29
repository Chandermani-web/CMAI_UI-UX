import api from '../utils/api.js';

export const getResume = async () => {
    try {
        const response = await api('/api/resume/get-resume', {
            method: 'GET',
        });
        const result = await response.json();
        return result?.data;
    } catch (error) {
        console.error('Error fetching resume:', error);
        return null;
    }
}