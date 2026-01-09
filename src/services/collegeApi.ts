import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

export const fetchColleges = async (search: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/api/colleges/colleges/dropdown`,
    {
      params: { search }
    }
  );

  return response.data.colleges;
};
