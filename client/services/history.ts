import { api } from "@/config/api";

export const getHistories = async (token: string) => {
  const response = await api.get(`/history/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};

export const updateVisibility = async (
  id: string,
  token: string,
  visibility: "public" | "private",
) => {
  const response = await api.put(
    `/history/${id}/visibility`,
    { visibility },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response;
};

export const updateTitle = async (id: string, title: string, token: string) => {
  const response = await api.put(
    `/history/${id}/title`,
    { title },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response;
};

export const deleteHistory = async (id: string, token: string) => {
  const response = await api.delete(`/history/${id}/delete`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};

export const getQueriesByHistory = async (
  token: string,
  historyUrl: string,
) => {
  const response = await api.get(`/history/${historyUrl}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};
