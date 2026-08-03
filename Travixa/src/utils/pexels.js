const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

export const fetchDestinationImages = async (destination) => {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${destination}&per_page=12`,
      {
        headers: {
          Authorization: API_KEY,
        },
      }
    );

    const data = await response.json();

    return data.photos || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};