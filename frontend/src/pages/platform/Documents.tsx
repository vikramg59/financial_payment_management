import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";

interface Message {
  text: string;
  sender: "user" | "ai";
}

export const Documents = () => {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  // Clear context on component mount
  useEffect(() => {
    // Generate a new session ID for each page load
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(newSessionId);
    
    // Reset state
    setFile(null);
    setSummary("");
    setMessages([]);
    
    // Clear context on the server
    fetch(`${import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5002'}/clear-context`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId: newSessionId }),
    }).catch(err => console.error("Failed to clear context:", err));
    
    // Cleanup on component unmount
    return () => {
      fetch(`${import.meta.env.VITE_AI_SERVICE_URL}/clear-context`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: newSessionId }),
      }).catch(err => console.error("Failed to clear context on unmount:", err));
    };
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setLoading(true);
    
    // Reset messages when a new document is uploaded
    setMessages([]);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("sessionId", sessionId);

    try {
      const response = await fetch(`${import.meta.env.VITE_AI_SERVICE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error(error);
      setSummary("Failed to generate summary.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newMessages: Message[] = [...messages, { text: input, sender: "user" }];
      setMessages(newMessages);
      setInput("");

      try {
        const response = await fetch(`${import.meta.env.VITE_AI_SERVICE_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            message: input,
            sessionId: sessionId
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response from AI");
        }

        const data = await response.json();
        // Check if data.response is an object with answer property
        const aiResponse = typeof data.response === 'object' && data.response.answer 
          ? data.response.answer 
          : (typeof data.response === 'string' ? data.response : 'No response available');
        setMessages([...newMessages, { text: aiResponse, sender: "ai" }]);
      } catch (error) {
        console.error(error);
        setMessages([
          ...newMessages,
          { text: "Failed to get response from AI.", sender: "ai" },
        ]);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Document Understanding</CardTitle>
              <CardDescription>
                Upload a document to get a summary and ask questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the files here ...</p>
                ) : (
                  <p>
                    Drag 'n' drop some files here, or click to select files
                  </p>
                )}
              </div>
              {file && (
                <div className="mt-4">
                  <p>File: {file.name}</p>
                </div>
              )}
              {loading && (
                <div className="mt-4">
                  <p>Generating summary...</p>
                </div>
              )}
              {summary && (
                <div className="mt-4">
                  <h3 className="font-semibold">Summary</h3>
                  <p>{summary}</p>
                </div>
              )}
              <div className="mt-4">
                <h3 className="font-semibold">Chat</h3>
                <div className="border rounded-lg p-4 h-64 overflow-y-auto">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-grow border rounded-l-lg p-2"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white p-2 rounded-r-lg"
                  >
                    Send
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>AI Document Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Get instant insights and summaries from your financial
                documents.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documents;