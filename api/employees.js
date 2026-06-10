export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://centralparknyc.officespacesoftware.com/api/directory_search",
      {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const text = await response.text();

    res.status(200).send(text);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
}
