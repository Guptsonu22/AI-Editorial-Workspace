async function verifyRepo() {
  try {
    const res = await fetch("https://api.github.com/repos/Guptsonu22/AI-Editorial-Workspace", {
      headers: { "User-Agent": "Node-Auditor" },
    });
    const d = await res.json();
    console.log("Status:", res.status);
    console.log("Repository:", d.full_name);
    console.log("Visibility:", d.visibility);
    console.log("Is Private:", d.private);
    console.log("Default Branch:", d.default_branch);
    console.log("Description:", d.description);
  } catch (err) {
    console.error("Failed to fetch repo info:", err);
  }
}
verifyRepo();
