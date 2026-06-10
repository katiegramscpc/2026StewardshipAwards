import { useState, useEffect } from "react";
import SmartSearch from "./SmartSearch";

async function fetchEmployees() {
  const res = await fetch(
    "https://api.allorigins.win/raw?url=https://centralparknyc.officespacesoftware.com/visual-directory/api/directory_search"
  );

  console.log("STATUS:", res.status);

  const data = await res.json();
  console.log("DATA:", data);

  return (data.items || []).map((emp) => ({
    name: `${emp.firstName} ${emp.lastName}`,
    title: emp.title,
    department: emp.department,
    location: normalizeLocation(emp.workLocation),
    years: calculateYears(emp.udf5),
  }));
}

function calculateYears(startDate) {
  if (!startDate) return null;

  const start = new Date(startDate);
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();

  const hasHadAnniversary =
    now.getMonth() > start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() >= start.getDate());

  if (!hasHadAnniversary) years--;

  return years;
}

function normalizeLocation(workLocation) {
  if (!workLocation) return null;

  if (workLocation.includes("717")) return "717";
  return "In-Park";
}

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [nomineeType, setNomineeType] = useState(null);
  const [otherNominee, setOtherNominee] = useState("");
  const [awards, setAwards] = useState([]);
  const [nominator, setNominator] = useState(null);
  const [answers, setAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
  });

  useEffect(() => {
    async function load() {
      const data = await fetchEmployees();
      setEmployees(data);
    }

    load();
  }, []);

  return (
    <form
      style={{
        maxWidth: 600,
        margin: "auto",
        padding: 20,
        fontFamily: "Arial",
      }}
      onSubmit={async (e) => {
        e.preventDefault();

        if (
          (nomineeType === "employee" && !selectedEmployee) ||
          (nomineeType === "other" && !otherNominee) ||
          !nominator ||
          awards.length === 0 ||
          !answers.q1 ||
          !answers.q2 ||
          !answers.q3
        ) {
          alert("Please complete all required fields.");
          return;
        }

        const nomineeData =
          nomineeType === "employee"
            ? {
                ...selectedEmployee,
                years: selectedEmployee?.years,
                location: selectedEmployee?.location,
              }
            : {
                name: otherNominee,
                title: "N/A",
                department: "N/A",
                years: "N/A",
                location: "N/A",
              };

        await fetch("https://tinyurl.com/AutomateStewies", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nominee: nomineeData,
            nominator: nominator,
            awards,
            answers,
            years: nomineeData?.years,
            location: nomineeData?.location,
          }),
        });

        alert("Your nomination has been submitted and received!");
      }}
    >
      <h1>2026 Stewardship Awards</h1>

      <h3 style={{ marginTop: 25 }}>Nominee</h3>

      <label>
        <input
          type="radio"
          value="employee"
          checked={nomineeType === "employee"}
          onChange={() => setNomineeType("employee")}
        />
        Select employee
      </label>

      <br />

      <label>
        <input
          type="radio"
          value="other"
          checked={nomineeType === "other"}
          onChange={() => setNomineeType("other")}
        />
        Team / Other
      </label>

      <br />
      <br />

      {nomineeType === "employee" && (
        <>
          <SmartSearch employees={employees} onSelect={setSelectedEmployee} />

          {selectedEmployee && (
            <div
              style={{
                marginTop: 10,
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 6,
                background: "#f9f9f9",
              }}
            >
              <strong>{selectedEmployee.name}</strong>
              <br />
              <span style={{ fontSize: "0.9em", color: "#555" }}>
                {selectedEmployee.title}
              </span>
              <br />
              <span style={{ fontSize: "0.85em", color: "#777" }}>
                {selectedEmployee.department}
              </span>
            </div>
          )}
        </>
      )}

      {nomineeType === "other" && (
        <input
          type="text"
          placeholder="Enter team or multiple nominees"
          value={otherNominee}
          onChange={(e) => setOtherNominee(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />
      )}

      <h3 style={{ marginTop: 25 }}>
        Which award(s) are you nominating this person for? Please choose up to
        two categories.
      </h3>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {[
          "Bench Award (Commitment): This award recognizes an employee’s unwavering commitment to the mission of the Central Park Conservancy on a daily basis. Much like our sturdy, trusty Park benches, this person demonstrates steadfast support and reliability in all that they do, providing a solid foundation for their team and the Central Park community at large.",
          "Bridge Award (Collaboration):  This award recognizes an individual or small group of employees who bring colleagues and teams together in an effective and positive way. Just as the Park’s bridges facilitate connection, these employees bridge gaps in communications, building strong connections and fostering a sense of belonging within our community.",
          "Elm Award (Integrity): This award recognizes an employee’s sound moral and ethical principles in the workplace. Like the majestic elms that tower over the Mall, their admirable integrity inspires respect and sets a high standard for others to emulate across the organization.",
          "Olmsted & Vaux Award (Expertise): This award recognizes an employee’s sound moral and ethical principles in the workplace. Like the majestic elms that tower over the Mall, their admirable integrity inspires respect and sets a high standard for others to emulate across the organization.",
          "Sapling Award (Rookie of the Year): This award celebrates an employee who, within their first two years at the Conservancy, has displayed exceptional promise, dedication, and a positive attitude toward their colleagues.",
        ].map((award) => (
          <button
            type="button"
            key={award}
            onClick={() => {
              if (awards.includes(award)) {
                setAwards(awards.filter((a) => a !== award));
              } else if (awards.length < 2) {
                setAwards([...awards, award]);
              } else {
                alert("You can only select up to 2 awards.");
              }
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 20,
              border: "1px solid #2c7a7b",
              background: awards.includes(award) ? "#2c7a7b" : "white",
              color: awards.includes(award) ? "white" : "#2c7a7b",
              cursor: "pointer",
            }}
          >
            {award}
          </button>
        ))}
      </div>

      <h3 style={{ marginTop: 25 }}>Nomination Questions</h3>

      <label>
        1. Explain how the nominee exemplifies the values of this award:
      </label>
      <textarea
        required
        value={answers.q1}
        onChange={(e) => setAnswers({ ...answers, q1: e.target.value })}
        style={{
          width: "100%",
          marginTop: 5,
          marginBottom: 15,
          padding: 10,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />

      <label>
        2. What additional outstanding qualities set this nominee apart?
      </label>
      <textarea
        required
        value={answers.q2}
        onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
        style={{
          width: "100%",
          marginTop: 5,
          marginBottom: 15,
          padding: 10,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />

      <label>3. Fun facts about the nominee:</label>
      <textarea
        required
        value={answers.q3}
        onChange={(e) => setAnswers({ ...answers, q3: e.target.value })}
        style={{
          width: "100%",
          marginTop: 5,
          marginBottom: 20,
          padding: 10,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />

      <h3>Your Name</h3>
      <SmartSearch employees={employees} onSelect={setNominator} />

      {nominator && (
        <div
          style={{
            marginTop: 10,
            marginBottom: 10,
            padding: 10,
            border: "1px solid #ddd",
            borderRadius: 6,
            background: "#f9f9f9",
          }}
        >
          <strong>{nominator.name}</strong>
          <br />
          <span style={{ fontSize: "0.9em", color: "#555" }}>
            {nominator.title}
          </span>
          <br />
          <span style={{ fontSize: "0.85em", color: "#777" }}>
            {nominator.department}
          </span>
        </div>
      )}
      <button
        type="submit"
        style={{
          marginTop: 10,
          padding: "10px 15px",
          borderRadius: 6,
          border: "none",
          background: "#2c7a7b",
          color: "white",
          cursor: "pointer",
        }}
      >
        Submit Nomination
      </button>
    </form>
  );
}
