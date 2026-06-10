import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/employees", async (req, res) => {
  try {
    const response = await fetch(
      "https://centralparknyc.officespacesoftware.com/api/directory_search",
      {
        headers: {
          Cookie: req.headers.cookie || "", // pass session
        },
      }
    );

    const text = await response.text();
    res.send(text);
  } catch (err) {
    res.status(500).send("Error fetching employees");
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
