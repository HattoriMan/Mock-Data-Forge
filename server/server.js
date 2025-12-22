import express from "express"
import { spawn } from "child_process"
import { dirname , join } from "path"
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;
const __dirname=dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/generate", (req, res) => {
    const python = spawn("python", [join(__dirname, "..", "generator", "main.py")]);

    let output = "";
    let errorOutput = "";

    python.stdin.write(JSON.stringify(req.body));
    python.stdin.end();

    python.stdout.on("data", (data) => {
        output += data.toString();
    });

    python.on("close", (code) => {
        if (errorOutput) {
            console.error("Python error:", errorOutput);
        }

        try {
            const jsonOutput = output ? JSON.parse(output) : {};
            res.json(jsonOutput);
        } catch (err) {
            console.error("Invalid JSON from Python:", output);
            res.status(500).json({ error: "Python script error" });
        }
    });
});

// Test API endpoint
// app.post("/test-api", (req, res) => {
//     console.log("Received data at /test-api:", JSON.stringify(req.body, null, 2));
//     res.json({ status: "success", message: "Data received successfully!" });
// });

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
