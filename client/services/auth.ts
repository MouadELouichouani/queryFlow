import { api } from "@/config/api";

// Oauth with google
export const login = async () => {
  const response = api.get(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`,
  );
  return response;
};
