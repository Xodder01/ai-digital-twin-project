import React, { useState, useRef, useEffect } from 'react';
import { sendChat, uploadSyllabus } from '../api/mlApi.js';

export default function ChatDock({ metrics }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! Adjust your simulation or ask me anything...' }
  ]);
  const [input, setInput]   = useState('');
  const [sending, setSending] = useState(false);
  const [pdfName, setPdfName] = useState('');
  const [isListening, setIsListening] = useState(false);
  const chatBoxRef = useRef(null);
  const fileRef    = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || sending) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setSending(true);
    try {
      const res = await sendChat(msg, metrics);
      setMessages(prev => [...prev, { role: 'ai', text: res.reply || 'No response.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠ Could not connect to the AI backend.' }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadSyllabus(file);
      setPdfName(file.name);
      setMessages(prev => [...prev, { role: 'ai', text: '📄 ' + (res.message || 'Syllabus uploaded!') }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠ Failed to upload PDF.' }]);
    }
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <div className="chat-dock">
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>
        ))}
        {sending && <div className="chat-msg ai"><span className="spinner" style={{ width: 14, height: 14 }} /></div>}
      </div>
      <div className="chat-input-row">
        {pdfName && <div className="pdf-badge">📄 {pdfName}</div>}
        <input type="file" ref={fileRef} accept=".pdf" style={{ display: 'none' }} onChange={handleFileUpload} />
        <button className="icon-btn" onClick={() => fileRef.current?.click()} title="Upload PDF Syllabus">📄</button>
        <button className={`icon-btn ${isListening ? 'mic-active' : ''}`} onClick={toggleVoice} title="Voice Input">
          {isListening ? <span className="pulse">🔴</span> : '🎤'}
        </button>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your twin..."
        />
        <button className="icon-btn send" onClick={handleSend} disabled={sending}>➤</button>
      </div>
    </div>
  );
}
