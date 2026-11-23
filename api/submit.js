export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const scriptUrl = process.env.APPS_SCRIPT_URL;
    if (!scriptUrl) {
        return res.status(500).json({ error: "Server misconfiguration" });
    }

    try {
        const clientIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
        const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        
        payload.server_detected_ip = clientIp;
        payload.api_secret = process.env.API_SECRET; // <-- AQUÍ VA ESTA LÍNEA

        const response = await fetch(scriptUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(502).json({ error: "Failed to reach grading service" });
    }
}