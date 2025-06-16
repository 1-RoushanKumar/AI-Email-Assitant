import {useState} from "react";
import axios from "axios";
import './App.css';

function App() {
    const [emailContent, setEmailContent] = useState("");
    const [tone, setTone] = useState("");
    const [desiredLength, setDesiredLength] = useState("");
    const [keywords, setKeywords] = useState("");
    const [language, setLanguage] = useState("");

    const [generatedReply, setGeneratedReply] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        setGeneratedReply("");

        try {
            const response = await axios.post("http://localhost:8080/api/email/generate", {
                emailContent,
                tone,
                desiredLength,
                keywords,
                language,
            });

            setGeneratedReply(response.data);

        } catch (err) {
            console.error("API call error:", err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err.code === "ERR_NETWORK") {
                setError("Network error: Could not connect to the backend server. Please ensure the server is running and accessible.");
            } else {
                setError("Failed to generate email reply. An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                body {
                    font-family: 'Inter', sans-serif;
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>
            <script src="https://cdn.tailwindcss.com"></script>

            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4 font-inter">
                <div
                    className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
                    <h1 className="text-3xl font-bold text-center mb-6 text-teal-400">Email Reply Assistant 🤖</h1>
                    <label htmlFor="emailContent" className="block text-sm font-medium mb-1">Original Email
                        Content:</label>
                    <textarea
                        id="emailContent"
                        rows={6}
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        placeholder="Paste the email you want to reply to here..."
                        className="w-full p-4 mb-4 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
                    />
                    <label htmlFor="tone" className="block text-sm font-medium mb-1">Select Tone (Optional):</label>
                    <select
                        id="tone"
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full p-3 mb-4 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200 cursor-pointer"
                    >
                        <option value="">Default (No specific tone)</option>
                        <option value="Professional">Professional</option>
                        <option value="Casual">Casual</option>
                        <option value="Friendly">Friendly</option>
                        <option value="Concise">Concise</option>
                        <option value="Empathetic">Empathetic</option>
                        <option value="Urgent">Urgent</option>
                    </select>
                    <label htmlFor="desiredLength" className="block text-sm font-medium mb-1">Desired Length
                        (Optional):</label>
                    <select
                        id="desiredLength"
                        value={desiredLength}
                        onChange={(e) => setDesiredLength(e.target.value)}
                        className="w-full p-3 mb-4 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200 cursor-pointer"
                    >
                        <option value="">Default (No specific length)</option>
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="long">Long</option>
                        <option value="one sentence">One Sentence</option>
                        <option value="bullet points">Bullet Points</option>
                    </select>
                    <label htmlFor="keywords" className="block text-sm font-medium mb-1">Keywords to Include (Optional,
                        comma-separated):</label>
                    <input
                        id="keywords"
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="e.g., 'meeting, follow-up, tomorrow'"
                        className="w-full p-3 mb-4 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
                    />
                    <label htmlFor="language" className="block text-sm font-medium mb-1">Desired Language
                        (Optional):</label>
                    <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full p-3 mb-6 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200 cursor-pointer"
                    >
                        <option value="">Default (English)</option>
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Italian">Italian</option>
                        <option value="Portuguese">Portuguese</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Hindi">Hindi</option>
                    </select>
                    <button
                        onClick={handleSubmit}
                        disabled={!emailContent || loading}
                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 transition duration-300 ease-in-out font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                        {loading ? "Generating Reply..." : "Generate Reply"}
                    </button>
                    {error && (
                        <div
                            className="mt-4 p-3 bg-red-800/30 border border-red-700 rounded-lg text-red-300 text-sm animate-fadeIn">
                            <p className="font-semibold">Error:</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {generatedReply && (
                        <div className="mt-6 animate-fadeIn">
                            <h2 className="text-xl font-semibold text-green-400 mb-3">Generated Reply</h2>
                            <textarea
                                rows={8}
                                readOnly
                                value={generatedReply}
                                className="w-full p-4 rounded-lg bg-slate-700 text-white focus:outline-none resize-none overflow-auto"
                            />
                            <button
                                onClick={() => {
                                    if (navigator.clipboard && navigator.clipboard.writeText) {
                                        navigator.clipboard.writeText(generatedReply)
                                            .then(() => alert("Copied to clipboard!"))
                                            .catch(err => console.error("Failed to copy:", err));
                                    } else {
                                        const textArea = document.createElement("textarea");
                                        textArea.value = generatedReply;
                                        document.body.appendChild(textArea);
                                        textArea.select();
                                        document.execCommand('copy');
                                        textArea.remove();
                                        alert("Copied to clipboard!");
                                    }
                                }}
                                className="mt-4 border border-white hover:bg-white hover:text-slate-900 transition duration-200 px-5 py-2 rounded-lg font-medium transform hover:scale-105"
                            >
                                📋 Copy to Clipboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default App;