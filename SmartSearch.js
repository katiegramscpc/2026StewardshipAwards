import { useState } from "react";
import Fuse from "fuse.js";

const nicknameMap = {
  William: ["Bill", "Will"],
  Michael: ["Mike"],
  Robert: ["Bob", "Rob"],
  Elizabeth: ["Liz", "Beth"],
  Katherine: ["Katie", "Kate"],
};

function enrichEmployees(list) {
  return list.map((emp) => {
    const [first, ...rest] = emp.name.split(" ");
    const last = rest.join(" ");

    const nicknames = nicknameMap[first] || [];

    const generated = nicknames.map((n) => (last ? `${n} ${last}` : n));

    return {
      ...emp,
      searchTerms: [emp.name, ...generated].map((s) => s.toLowerCase()),
    };
  });
}

export default function SmartSearch({ employees, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const enriched = enrichEmployees(employees || []);

  const fuse = new Fuse(enriched, {
    keys: ["searchTerms"],
    threshold: 0.3,
    includeMatches: true,
  });

  const handleSearch = (value) => {
    setQuery(value);

    if (!value) {
      setResults([]);
      return;
    }

    const res = fuse.search(value.toLowerCase());
    setResults(res.slice(0, 5));
    setActiveIndex(0);
  };

  const handleSelect = (emp) => {
    setQuery(emp.name);
    setResults([]);

    if (onSelect) {
      onSelect(emp);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) {
        handleSelect(results[activeIndex].item);
      }
    }
  };

  const highlightText = (text, matches) => {
    if (!matches || matches.length === 0) return text;

    const match = matches[0];
    if (!match) return text;

    let parts = [];
    let lastIndex = 0;

    match.indices.forEach(([start, end], i) => {
      parts.push(text.slice(lastIndex, start));
      parts.push(
        <span key={i} style={{ backgroundColor: "yellow" }}>
          {text.slice(start, end + 1)}
        </span>
      );
      lastIndex = end + 1;
    });

    parts.push(text.slice(lastIndex));
    return parts;
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search and select a name..."
        style={{
          width: "100%",
          padding: 10,
          border: "1px solid #ccc",
          borderRadius: 6,
        }}
      />

      {results.length > 0 && (
        <ul
          style={{
            border: "1px solid #ccc",
            marginTop: 5,
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          {results.map((r, i) => (
            <li
              key={i}
              onClick={() => handleSelect(r.item)}
              style={{
                padding: 10,
                cursor: "pointer",
                background: i === activeIndex ? "#f0f4f8" : "white",
                borderBottom: "1px solid #eee",
              }}
            >
              <div style={{ fontWeight: "bold" }}>
                {highlightText(r.item.name, r.matches)}
              </div>

              <div
                style={{
                  fontSize: "0.9em",
                  color: "#555",
                }}
              >
                {r.item.title} • {r.item.department}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
