import api from '../utils/api.js';

export const getCurrentUser = async () => {
    try {
        const response = await api('/api/me', {
            method: 'GET',
        });
        const result = await response.json();
        return result?.user;
    } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
    }
}

export const useCoin = async (data) => {
    try {
        const response = await api("/api/auth/use-coins", {
            method: 'POST',
            body: data,
        });
        const result = await response.json();
        console.log(`useCoin response for action ${data.action}:`, result);
        return result;
    } catch (error) {
        console.error(`Error ${data.action} coin:`, error);
        return null;
    }
}