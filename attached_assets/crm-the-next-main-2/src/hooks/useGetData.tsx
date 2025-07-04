import api from "@/services/api";
import { useQuery } from "react-query";

export const useGetData = (queryKey: string) => {
  return useQuery(queryKey, async () => {
    const { data } = await api.get(queryKey);
    return data;
  });
};
