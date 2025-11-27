import { api } from "@/config/api";

export const ask = async (token: string, queryParams: unknown) => {
  const response = await api.get(`/ask?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};
