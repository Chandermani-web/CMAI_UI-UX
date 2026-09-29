import api from '../utils/api.js';

export const generateRoadmap = async (payload) => {
  const response = await api('/api/roadmap', {
    method: 'POST',
    body: payload,
  });
  return response.json();
};

export const getAllRoadmaps = async () => {
  const response = await api('/api/roadmap/all', {
    method: 'GET',
  });
  return response.json();
};

export const getRoadmapById = async (id) => {
  const response = await api(`/api/roadmap/${id}`, {
    method: 'GET',
  });
  return response.json();
};