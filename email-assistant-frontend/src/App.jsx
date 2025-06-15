import {useState} from "react";
import axios from "axios";
import './App.css'

function App() {
    const [emailContent, setEmailContent] = useState("");
    const [tone, setTone] = useState("");
    const [generatedReply, setGeneratedReply] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.post("http://localhost:8080/api/email/generate", {
                emailContent,
                tone,
            });

            setGeneratedReply(
                typeof response.data === "string" ? response.data : JSON.stringify(response.data)
            );
        } catch (error) {
            setError("Failed to generate Email reply. Please try again later.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4">
            <div
                className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
                <h1 className="text-3xl font-bold text-center mb-6">Email Reply Assistant 🤖</h1>

                <textarea
                    rows={6}
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    placeholder="Paste your email here..."
                    className="w-full p-4 mb-4 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />

                <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full p-3 mb-4 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                    <option value="">Select Tone (Optional)</option>
                    <option value="Professional">Professional</option>
                    <option value="Casual">Casual</option>
                    <option value="Friendly">Friendly</option>
                </select>

                <button
                    onClick={handleSubmit}
                    disabled={!emailContent || loading}
                    className="w-full bg-teal-500 hover:bg-teal-600 transition font-semibold py-3 rounded-lg disabled:opacity-50"
                >
                    {loading ? "Generating..." : "Generate Reply"}
                </button>

                {error && <p className="text-red-400 mt-3">{error}</p>}

                {generatedReply && (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold text-green-400 mb-2">Generated Reply</h2>
                        <textarea
                            rows={8}
                            readOnly
                            value={generatedReply}
                            className="w-full p-4 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none"
                        />
                        <button
                            onClick={() => navigator.clipboard.writeText(generatedReply)}
                            className="mt-3 border border-white hover:bg-white hover:text-slate-900 transition px-4 py-2 rounded-lg"
                        >
                            📋 Copy to Clipboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
