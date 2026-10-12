import { api }from "../../lib/api";

export const getAnalyticsOverview = async () => {
  const { data } = await api.get("/analytics/overview");
  return data;
};

export const getAnalyticsComparison = async () => {
  const { data } = await api.get("/analytics/comparison");
  return data;
};

export const getAnalyticsTrends = async (days = 30) => {
  const { data } = await api.get("/analytics/trends", {
    params: { days },
  });
  return data;
};

export const getAnalyticsTeachers = async () => {
  const { data } = await api.get("/analytics/teachers");
  return data;
};