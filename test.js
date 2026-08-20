const res = await fetch("http://localhost:3001/api/consult", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ procedure: "test procedure", persona: "patient" })
});
console.log("Status:", res.status);
console.log("Headers:", res.headers.get("content-type"));
const text = await res.text();
console.log("Body length:", text.length);
