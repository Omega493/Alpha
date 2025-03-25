const { exec } = require("child_process");
const depcheck = require("depcheck");

// Define project directory
const options = {
  ignorePatterns: ["node_modules", "commands", "utils"],
};

// Run depcheck
depcheck(process.cwd(), options).then((unused) => {
  const unusedDeps = unused.dependencies;

  if (unusedDeps.length === 0) {
    console.log("✅ No unused dependencies found!");
    return;
  }

  console.log("⚠️ Unused dependencies found:", unusedDeps.join(", "));

  // Uninstall unused dependencies
  const uninstallCommand = `npm uninstall ${unusedDeps.join(" ")}`;
  exec(uninstallCommand, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Error uninstalling packages:", stderr);
      return;
    }
    console.log("✅ Successfully uninstalled unused dependencies:\n", stdout);
  });
});
